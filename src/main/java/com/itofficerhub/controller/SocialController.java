package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.ProfileService;
import com.itofficerhub.service.SocialService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/social")
public class SocialController {

	private final SocialService socialService;
	private final ProfileService profileService;

	public SocialController(SocialService socialService, ProfileService profileService) {
		this.socialService = socialService;
		this.profileService = profileService;
	}

	@GetMapping("/profile/me")
	public ProfileDto myProfile() { return profileService.getMyProfile(); }

	@PutMapping("/profile/me")
	public ProfileDto updateProfile(@RequestBody UpdateProfileRequest request) {
		return profileService.updateProfile(request);
	}

	@GetMapping("/profile/{userId}")
	public ProfileDto userProfile(@PathVariable Long userId) { return profileService.getProfile(userId); }

	@GetMapping("/users")
	public List<StudentDirectoryDto> listStudents() { return socialService.listStudents(); }

	@GetMapping("/users/search")
	public List<ProfileDto> search(@RequestParam String q) { return socialService.searchUsers(q); }

	@PostMapping("/users/{userId}/block")
	public void block(@PathVariable Long userId) { socialService.blockUser(userId); }

	@DeleteMapping("/users/{userId}/block")
	public void unblock(@PathVariable Long userId) { socialService.unblockUser(userId); }

	@GetMapping("/inbox")
	public List<ConversationDto> inbox() { return socialService.inbox(); }

	@GetMapping("/poll")
	public PollResponseDto poll(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since) {
		return socialService.poll(since);
	}

	@GetMapping("/conversations/{id}/messages")
	public List<ChatMessageDto> messages(
			@PathVariable Long id,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since) {
		return socialService.getMessages(id, since);
	}

	@PostMapping("/conversations/{id}/messages")
	public ChatMessageDto send(@PathVariable Long id, @RequestBody SendMessageRequest request) {
		return socialService.sendMessage(id, request);
	}

	@PostMapping("/conversations/direct/{userId}")
	public ConversationDto direct(@PathVariable Long userId) { return socialService.startDirect(userId); }

	@PostMapping("/groups")
	public ConversationDto createGroup(@Valid @RequestBody CreateGroupRequest request) {
		return socialService.createGroup(request);
	}

	@PostMapping("/conversations/{id}/members")
	public ConversationDto addMembers(
			@PathVariable Long id,
			@Valid @RequestBody AddGroupMembersRequest request) {
		return socialService.addGroupMembers(id, request);
	}

	@PostMapping("/groups/prep-squad/join")
	public ConversationDto joinPrepSquad() { return socialService.joinPrepSquad(); }
}
