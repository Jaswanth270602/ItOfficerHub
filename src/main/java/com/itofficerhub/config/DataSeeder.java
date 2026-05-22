package com.itofficerhub.config;

import com.itofficerhub.entity.*;
import com.itofficerhub.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final ConversationRepository conversationRepository;
	private final ConversationMemberRepository memberRepository;
	private final ChatMessageRepository chatMessageRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.admin.email}")
	private String adminEmail;

	@Value("${app.admin.password}")
	private String adminPassword;

	@Value("${app.admin.name}")
	private String adminName;

	public DataSeeder(UserRepository userRepository, ConversationRepository conversationRepository,
			ConversationMemberRepository memberRepository, ChatMessageRepository chatMessageRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.conversationRepository = conversationRepository;
		this.memberRepository = memberRepository;
		this.chatMessageRepository = chatMessageRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		seedAdmin();
		seedPrepGroup();
	}

	private void seedPrepGroup() {
		if (conversationRepository.findAll().stream().anyMatch(c -> "IBPS SO IT Prep Squad".equals(c.getName()))) {
			return;
		}
		User admin = userRepository.findByEmail(adminEmail).orElse(null);
		if (admin == null) return;
		Conversation g = new Conversation();
		g.setType(ConversationType.GROUP);
		g.setName("IBPS SO IT Prep Squad");
		g.setDescription("Official community — share score cards, ask doubts, motivate each other! 📬");
		g.setCreatedBy(admin);
		g = conversationRepository.save(g);
		ConversationMember m = new ConversationMember();
		m.setConversation(g);
		m.setUser(admin);
		memberRepository.save(m);
		ChatMessage welcome = new ChatMessage();
		welcome.setConversation(g);
		welcome.setSender(admin);
		welcome.setMessageType(MessageType.SYSTEM);
		welcome.setBody("Welcome to ItOfficerHub Prep Mail! 🎉 Create groups, DM friends, share your mock score cards after each test. Rankings use your BEST score only — retakes don't hurt leaderboard!");
		chatMessageRepository.save(welcome);
	}

	private void seedAdmin() {
		if (!userRepository.existsByEmail(adminEmail)) {
			User admin = new User();
			admin.setEmail(adminEmail);
			admin.setPassword(passwordEncoder.encode(adminPassword));
			admin.setName(adminName);
			admin.setRole(Role.ADMIN);
			userRepository.save(admin);
		}
	}
}
