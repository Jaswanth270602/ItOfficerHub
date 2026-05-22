package com.itofficerhub.service;

import com.itofficerhub.config.CacheNames;
import com.itofficerhub.dto.*;
import com.itofficerhub.entity.*;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.*;
import com.itofficerhub.entity.Role;
import com.itofficerhub.security.UserPrincipal;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SocialService {

	private final ConversationRepository conversationRepository;
	private final ConversationMemberRepository memberRepository;
	private final ChatMessageRepository messageRepository;
	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final UserDisplayService userDisplayService;
	private final UniqueRankingService uniqueRankingService;
	private final UserBlockRepository userBlockRepository;
	private final AppCacheService appCacheService;
	private final SocialService self;

	public SocialService(ConversationRepository conversationRepository,
			ConversationMemberRepository memberRepository, ChatMessageRepository messageRepository,
			UserRepository userRepository, TestAttemptRepository attemptRepository,
			UserDisplayService userDisplayService, UniqueRankingService uniqueRankingService,
			UserBlockRepository userBlockRepository, AppCacheService appCacheService,
			@Lazy SocialService self) {
		this.conversationRepository = conversationRepository;
		this.memberRepository = memberRepository;
		this.messageRepository = messageRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.userDisplayService = userDisplayService;
		this.uniqueRankingService = uniqueRankingService;
		this.userBlockRepository = userBlockRepository;
		this.appCacheService = appCacheService;
		this.self = self;
	}

	@Transactional(readOnly = true)
	public List<ConversationDto> inbox() {
		User me = getCurrentUser().getUser();
		return self.inboxForUser(me.getId());
	}

	@Cacheable(cacheNames = CacheNames.USER_INBOX, key = "#userId")
	@Transactional(readOnly = true)
	public List<ConversationDto> inboxForUser(long userId) {
		return conversationRepository.findForUser(userId).stream()
				.map(c -> toConversationDto(c, userId))
				.toList();
	}

	@Transactional(readOnly = true)
	public PollResponseDto poll(Instant since) {
		User me = getCurrentUser().getUser();
		long unread = messageRepository.countUnreadForUser(me.getId());
		List<ChatMessage> fresh = since != null
				? messageRepository.findNewForUserAfter(me.getId(), since)
				: List.of();
		List<ChatMessageDto> dtos = fresh.stream().map(m -> toMessageDto(m, me.getId())).toList();
		// Lightweight poll — inbox is loaded separately (avoids heavy rebuild every few seconds)
		return new PollResponseDto(Instant.now(), unread, dtos, List.of());
	}

	@Transactional(readOnly = true)
	public List<ChatMessageDto> getMessages(Long conversationId, Instant since) {
		User me = getCurrentUser().getUser();
		requireMember(conversationId, me.getId());
		markRead(conversationId, me.getId());
		List<ChatMessage> rows = since != null
				? messageRepository.findForConversationAfter(conversationId, since)
				: messageRepository.findAllForConversation(conversationId);
		return rows.stream()
				.filter(m -> m.getMessageType() == MessageType.SYSTEM
						|| !userBlockRepository.isBlockedEitherWay(me.getId(), m.getSender().getId()))
				.map(m -> toMessageDto(m, me.getId()))
				.toList();
	}

	@Transactional
	public ChatMessageDto sendMessage(Long conversationId, SendMessageRequest request) {
		User me = getCurrentUser().getUser();
		requireMember(conversationId, me.getId());
		Conversation convCheck = conversationRepository.findById(conversationId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
		if (convCheck.getType() == ConversationType.DIRECT) {
			Long otherId = memberRepository.findByConversationIdWithUser(conversationId).stream()
					.map(m -> m.getUser().getId())
					.filter(id -> !id.equals(me.getId()))
					.findFirst()
					.orElse(null);
			if (otherId != null) {
				User other = userRepository.findById(otherId).orElseThrow();
				assertCanDirectMessage(me, other);
			}
		}
		if (request.scoreCardAttemptId() == null && (request.body() == null || request.body().isBlank())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Message body or score card required");
		}
		Conversation conv = conversationRepository.findById(conversationId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));

		ChatMessage msg = new ChatMessage();
		msg.setConversation(conv);
		msg.setSender(me);
		if (request.scoreCardAttemptId() != null) {
			verifyAttemptOwner(request.scoreCardAttemptId(), me.getId());
			msg.setMessageType(MessageType.SCORE_CARD);
			msg.setBody("Shared a score card 🎯");
			msg.setScoreCardAttemptId(request.scoreCardAttemptId());
		} else {
			msg.setMessageType(MessageType.TEXT);
			msg.setBody(request.body().trim());
		}
		msg = messageRepository.save(msg);
		conv.setUpdatedAt(Instant.now());
		conversationRepository.save(conv);
		evictInboxForConversation(conversationId);
		return toMessageDto(msg, me.getId());
	}

	@Transactional
	public ConversationDto startDirect(Long targetUserId) {
		User me = getCurrentUser().getUser();
		if (me.getId().equals(targetUserId)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot message yourself");
		}
		User target = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		assertCanDirectMessage(me, target);

		Conversation conv = conversationRepository.findDirectBetween(me.getId(), targetUserId, ConversationType.DIRECT)
				.or(() -> conversationRepository.findDirectBetween(targetUserId, me.getId(), ConversationType.DIRECT))
				.orElseGet(() -> {
					Conversation c = new Conversation();
					c.setType(ConversationType.DIRECT);
					c.setName(userDisplayService.displayName(target) + " ↔ " + userDisplayService.displayName(me));
					c.setCreatedBy(me);
					c = conversationRepository.save(c);
					addMember(c, me);
					addMember(c, target);
					ChatMessage welcome = new ChatMessage();
					welcome.setConversation(c);
					welcome.setSender(me);
					welcome.setMessageType(MessageType.SYSTEM);
					welcome.setBody("Direct prep mail started. Share score cards and clear doubts here! 📬");
					messageRepository.save(welcome);
					evictInboxForConversation(c.getId());
					return c;
				});
		evictInboxForConversation(conv.getId());
		return toConversationDto(conv, me.getId());
	}

	@Transactional
	public ConversationDto createGroup(CreateGroupRequest request) {
		User me = getCurrentUser().getUser();
		Conversation conv = new Conversation();
		conv.setType(ConversationType.GROUP);
		conv.setName(request.name().trim());
		conv.setDescription(request.description());
		conv.setCreatedBy(me);
		conv = conversationRepository.save(conv);
		addMember(conv, me);
		if (request.memberIds() != null) {
			for (Long id : request.memberIds()) {
				if (!id.equals(me.getId())) {
					var opt = userRepository.findById(id);
					if (opt.isPresent()) addMember(conv, opt.get());
				}
			}
		}
		ChatMessage welcome = new ChatMessage();
		welcome.setConversation(conv);
		welcome.setSender(me);
		welcome.setMessageType(MessageType.SYSTEM);
		welcome.setBody(me.getName() + " created prep group \"" + conv.getName() + "\" 🚀");
		messageRepository.save(welcome);
		evictInboxForConversation(conv.getId());
		return toConversationDto(conv, me.getId());
	}

	@Transactional
	public ConversationDto addGroupMembers(Long conversationId, AddGroupMembersRequest request) {
		User me = getCurrentUser().getUser();
		Conversation conv = conversationRepository.findById(conversationId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
		if (conv.getType() != ConversationType.GROUP) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Only prep groups support adding members");
		}
		requireMember(conversationId, me.getId());

		List<String> added = new ArrayList<>();
		for (Long userId : request.userIds()) {
			if (userId.equals(me.getId())) continue;
			if (memberRepository.existsByConversationIdAndUserId(conversationId, userId)) continue;
			if (userBlockRepository.isBlockedEitherWay(me.getId(), userId)) {
				throw new ApiException(HttpStatus.FORBIDDEN, "Cannot add a blocked user to the group");
			}
			User target = userRepository.findById(userId)
					.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found: " + userId));
			addMember(conv, target);
			added.add(userDisplayService.displayName(target));
		}
		if (!added.isEmpty()) {
			ChatMessage sys = new ChatMessage();
			sys.setConversation(conv);
			sys.setSender(me);
			sys.setMessageType(MessageType.SYSTEM);
			sys.setBody(userDisplayService.displayName(me) + " added " + String.join(", ", added) + " to the group");
			messageRepository.save(sys);
			conv.setUpdatedAt(Instant.now());
			conversationRepository.save(conv);
			evictInboxForConversation(conversationId);
		}
		return toConversationDto(conv, me.getId());
	}

	@Transactional
	public ConversationDto joinPrepSquad() {
		User me = getCurrentUser().getUser();
		Conversation g = conversationRepository.findAll().stream()
				.filter(c -> "IBPS SO IT Prep Squad".equals(c.getName()))
				.findFirst()
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prep group not found"));
		addMember(g, me);
		appCacheService.evictUserInbox(me.getId());
		return toConversationDto(g, me.getId());
	}

	@Transactional(readOnly = true)
	public List<StudentDirectoryDto> listStudents() {
		User me = getCurrentUser().getUser();
		return userRepository.findByRoleAndShowInDirectoryTrueOrderByNameAsc(Role.USER).stream()
				.filter(u -> !u.getId().equals(me.getId()))
				.map(u -> toStudentDto(u, me))
				.toList();
	}

	public List<ProfileDto> searchUsers(String query) {
		if (query == null || query.length() < 2) return List.of();
		User me = getCurrentUser().getUser();
		return userRepository.searchUsers(query).stream()
				.filter(u -> !u.getId().equals(me.getId()))
				.map(u -> toStudentProfile(u))
				.toList();
	}

	@Transactional
	public void blockUser(Long targetUserId) {
		User me = getCurrentUser().getUser();
		if (me.getId().equals(targetUserId)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot block yourself");
		}
		User target = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		if (!userBlockRepository.existsByBlockerIdAndBlockedId(me.getId(), target.getId())) {
			UserBlock block = new UserBlock();
			block.setBlocker(me);
			block.setBlocked(target);
			userBlockRepository.save(block);
		}
	}

	@Transactional
	public void unblockUser(Long targetUserId) {
		User me = getCurrentUser().getUser();
		userBlockRepository.findByBlockerIdAndBlockedId(me.getId(), targetUserId)
				.ifPresent(userBlockRepository::delete);
	}

	private StudentDirectoryDto toStudentDto(User u, User me) {
		boolean blockedByMe = userBlockRepository.existsByBlockerIdAndBlockedId(me.getId(), u.getId());
		boolean blockedMe = userBlockRepository.existsByBlockerIdAndBlockedId(u.getId(), me.getId());
		boolean canMessage = !blockedByMe && !blockedMe && u.isAllowDirectMessages();
		long attempts = attemptRepository.findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(u.getId()).size();
		return new StudentDirectoryDto(
				u.getId(),
				userDisplayService.displayName(u),
				u.getAvatarEmoji() != null ? u.getAvatarEmoji() : "🎯",
				u.getBio(),
				attempts,
				u.isAllowDirectMessages(),
				blockedByMe,
				blockedMe,
				canMessage);
	}

	private ProfileDto toStudentProfile(User u) {
		return new ProfileDto(u.getId(), null, u.getName(), userDisplayService.displayName(u),
				u.getAnonymousAlias(), u.isUseAnonymousDisplay(), u.getBio(),
				u.getAvatarEmoji() != null ? u.getAvatarEmoji() : "🎯", 0,
				u.isAllowDirectMessages(), u.isShowInDirectory());
	}

	private void assertCanDirectMessage(User me, User target) {
		if (userBlockRepository.isBlockedEitherWay(me.getId(), target.getId())) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Messaging blocked between you and this user");
		}
		if (!target.isAllowDirectMessages()) {
			throw new ApiException(HttpStatus.FORBIDDEN,
					userDisplayService.displayName(target) + " has restricted direct messages");
		}
		if (!me.isAllowDirectMessages()) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Enable direct messages in your profile settings first");
		}
	}

	private void addMember(Conversation conv, User user) {
		if (memberRepository.existsByConversationIdAndUserId(conv.getId(), user.getId())) return;
		ConversationMember m = new ConversationMember();
		m.setConversation(conv);
		m.setUser(user);
		memberRepository.save(m);
	}

	private void requireMember(Long conversationId, Long userId) {
		if (!memberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Not a member of this conversation");
		}
	}

	private void markRead(Long conversationId, Long userId) {
		memberRepository.findByConversationIdAndUserId(conversationId, userId).ifPresent(m -> {
			m.setLastReadAt(Instant.now());
			memberRepository.save(m);
		});
	}

	private void verifyAttemptOwner(Long attemptId, Long userId) {
		TestAttempt a = attemptRepository.findById(attemptId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attempt not found"));
		if (!a.isSubmitted() || !a.getUser().getId().equals(userId)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid score card");
		}
	}

	private ConversationDto toConversationDto(Conversation c, Long meId) {
		ChatMessage last = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(c.getId()).orElse(null);
		String preview = last != null ? preview(last) : "No messages yet";
		Instant lastAt = last != null ? last.getCreatedAt() : c.getCreatedAt();
		long unread = 0;
		var member = memberRepository.findByConversationIdAndUserId(c.getId(), meId);
		if (member.isPresent() && last != null && !last.getSender().getId().equals(meId)) {
			Instant read = member.get().getLastReadAt();
			if (read == null || last.getCreatedAt().isAfter(read)) unread = 1;
		}
		List<ConversationDto.MemberSummaryDto> members = memberRepository.findByConversationIdWithUser(c.getId())
				.stream()
				.map(m -> new ConversationDto.MemberSummaryDto(
						m.getUser().getId(),
						userDisplayService.displayName(m.getUser()),
						m.getUser().getAvatarEmoji()))
				.toList();
		return new ConversationDto(c.getId(), c.getType().name(), c.getName(), c.getDescription(),
				preview, lastAt, unread, members);
	}

	private String preview(ChatMessage m) {
		return switch (m.getMessageType()) {
			case SCORE_CARD -> "🎯 Shared score card";
			case SYSTEM -> m.getBody();
			default -> m.getBody() != null && m.getBody().length() > 80 ? m.getBody().substring(0, 80) + "…" : m.getBody();
		};
	}

	private ChatMessageDto toMessageDto(ChatMessage m, Long meId) {
		ScoreCardDto card = null;
		if (m.getMessageType() == MessageType.SCORE_CARD && m.getScoreCardAttemptId() != null) {
			card = buildScoreCard(m.getScoreCardAttemptId());
		}
		return new ChatMessageDto(
				m.getId(),
				m.getConversation().getId(),
				m.getSender().getId(),
				userDisplayService.displayName(m.getSender()),
				m.getSender().getAvatarEmoji(),
				m.getMessageType().name(),
				m.getBody(),
				card,
				m.getCreatedAt());
	}

	private ScoreCardDto buildScoreCard(Long attemptId) {
		TestAttempt a = attemptRepository.findById(attemptId).orElseThrow();
		long rank;
		double percentile;
		long students;
		if (a.getRankAtSubmit() != null) {
			rank = a.getRankAtSubmit();
			percentile = a.getPercentileAtSubmit() != null ? a.getPercentileAtSubmit() : 0;
			students = a.getUniqueStudentsAtSubmit() != null ? a.getUniqueStudentsAtSubmit() : 0;
		} else {
			var computed = uniqueRankingService.computeForAttempt(a);
			rank = computed.rank();
			percentile = computed.percentile();
			students = computed.uniqueStudents();
		}
		return new ScoreCardDto(
				a.getId(),
				a.getMockTest().getTitle(),
				a.getNetScore(),
				a.getTotalQuestions() * ExamScoring.MARKS_PER_CORRECT,
				a.getCorrectCount(),
				a.getWrongCount(),
				rank,
				Math.round(percentile * 10) / 10.0,
				students,
				a.getNetScore() >= a.getMockTest().getCutoffMarks(),
				a.getMockTest().getCutoffMarks());
	}

	private void evictInboxForConversation(Long conversationId) {
		memberRepository.findByConversationIdWithUser(conversationId)
				.forEach(m -> appCacheService.evictUserInbox(m.getUser().getId()));
	}

	private UserPrincipal getCurrentUser() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) return p;
		throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
	}
}
