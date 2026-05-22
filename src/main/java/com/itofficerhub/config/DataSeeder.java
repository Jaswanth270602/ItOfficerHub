package com.itofficerhub.config;

import com.itofficerhub.entity.*;
import com.itofficerhub.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

	private static final String OSI_IMAGE =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Osi_model.png/640px-Osi_model.png";
	private static final String TCP_IMAGE =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/TCP_TCP_IP.png/500px-TCP_TCP_IP.png";

	private final UserRepository userRepository;
	private final MockTestRepository mockTestRepository;
	private final QuestionRepository questionRepository;
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

	public DataSeeder(UserRepository userRepository, MockTestRepository mockTestRepository,
			QuestionRepository questionRepository, ConversationRepository conversationRepository,
			ConversationMemberRepository memberRepository, ChatMessageRepository chatMessageRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.mockTestRepository = mockTestRepository;
		this.questionRepository = questionRepository;
		this.conversationRepository = conversationRepository;
		this.memberRepository = memberRepository;
		this.chatMessageRepository = chatMessageRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		seedAdmin();
		seedMocksIfNeeded();
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

	private void seedMocksIfNeeded() {
		if (mockTestRepository.count() >= 5) return;

		seedMock1();
		seedThemedMock("IBPS SO IT - Networking & Security",
				"20 questions on networks, protocols, firewalls, and cyber threats.",
				Difficulty.MEDIUM, Topic.NETWORKING, "network");
		seedThemedMock("IBPS SO IT - DBMS & Data Structures",
				"SQL, normalization, indexing, trees, and complexity.",
				Difficulty.MEDIUM, Topic.DBMS, "dbms");
		seedThemedMock("IBPS SO IT - OS & Cloud",
				"Processes, memory, virtualization, AWS basics.",
				Difficulty.MEDIUM, Topic.OPERATING_SYSTEMS, "os");
		seedThemedMock("IBPS SO IT - Full Syllabus Mixed",
				"Hard mixed mock across all IT Officer topics. Cutoff 10 marks.",
				Difficulty.HARD, Topic.SOFTWARE_ENGINEERING, "mixed");
	}

	private boolean exists(String title) {
		return mockTestRepository.findAll().stream().anyMatch(m -> title.equals(m.getTitle()));
	}

	private void seedMock1() {
		if (exists("IBPS SO IT Officer - Sample Mock #1")) return;

		MockTest mock = createMock(
				"IBPS SO IT Officer - Sample Mock #1",
				"Free sample mock — 20 questions, +1/−0.25 marking, cutoff 10 marks.",
				Difficulty.MEDIUM);

		String[][] samples = {
				{"Which layer of the OSI model handles routing?", "Physical", "Data Link", "Network", "Transport", "C", "NETWORKING", "Routing is performed at the Network layer (Layer 3).", OSI_IMAGE},
				{"What is the default port for HTTPS?", "80", "443", "21", "25", "B", "NETWORKING", "HTTPS uses port 443 by default.", null},
				{"Which SQL command removes all rows quickly?", "DROP", "DELETE", "TRUNCATE", "REMOVE", "C", "DBMS", "TRUNCATE deallocates pages with minimal row logging.", null},
				{"2NF eliminates which dependency?", "Multi-valued", "Partial", "Transitive", "Join", "B", "DBMS", "Second normal form removes partial dependencies.", null},
				{"Which scheduling may cause starvation?", "FCFS", "Round Robin", "Priority", "SJF without aging", "D", "OPERATING_SYSTEMS", "SJF can starve long jobs; use aging.", null},
				{"Deadlock requires circular wait?", "True", "False", "Sometimes", "Never", "A", "OPERATING_SYSTEMS", "Circular wait is a Coffman condition.", null},
				{"AES is?", "Symmetric cipher", "Hash only", "Asymmetric only", "Protocol", "A", "SECURITY", "AES is Advanced Encryption Standard.", null},
				{"DDoS attack aims to?", "Steal passwords", "Flood resources", "Encrypt disk", "Spoof MAC", "B", "SECURITY", "Denial of service overloads targets.", TCP_IMAGE},
				{"REST is primarily?", "Stateful", "Stateless", "SOAP-only", "Binary-only", "B", "WEB_TECHNOLOGIES", "REST clients send context per request.", null},
				{"PUT method is typically?", "Non-idempotent", "Idempotent", "Unsafe always", "Cache-only", "B", "WEB_TECHNOLOGIES", "PUT replaces resource; repeat has same effect.", null},
				{"Binary search time?", "O(n)", "O(log n)", "O(n²)", "O(1)", "B", "DATA_STRUCTURES", "Halves search space each step.", null},
				{"LIFO structure?", "Queue", "Stack", "Graph", "Heap", "B", "DATA_STRUCTURES", "Stack is Last-In-First-Out.", null},
				{"Program Counter holds?", "Data", "Next instruction address", "Opcode only", "Cache line", "B", "COMPUTER_ORGANIZATION", "PC points to next instruction.", null},
				{"Cache reduces?", "CPU heat", "Memory latency", "Disk RPM", "Network hops", "B", "COMPUTER_ORGANIZATION", "Hits avoid slow main memory.", null},
				{"Agile values working software over?", "Contracts", "Documentation alone", "Hardware", "Licenses", "B", "SOFTWARE_ENGINEERING", "Agile manifesto prioritizes delivery.", null},
				{"Unit tests target?", "Full UI", "Single module", "Production DB", "DNS", "B", "SOFTWARE_ENGINEERING", "Isolated component verification.", null},
				{"IaaS delivers?", "Email client", "VMs and storage", "Only SaaS CRM", "Compiler", "B", "CLOUD_COMPUTING", "Infrastructure: compute, network, storage.", null},
				{"Public cloud example?", "AWS", "USB hub", "BIOS chip", "LAN cable", "A", "CLOUD_COMPUTING", "AWS is a hyperscale public cloud.", null},
				{"NAND is 0 when?", "Any input 0", "All inputs 1", "All inputs 0", "Never", "B", "DIGITAL_ELECTRONICS", "NAND outputs 0 only if all inputs are 1.", null},
				{"IPv4 address size?", "32 bits", "64 bits", "128 bits", "16 bits", "A", "NETWORKING", "IPv4 uses 32-bit addresses.", OSI_IMAGE}
		};
		saveQuestions(mock, samples);
	}

	private void seedThemedMock(String title, String description, Difficulty difficulty, Topic primaryTopic, String key) {
		if (exists(title)) return;
		MockTest mock = createMock(title, description, difficulty);
		String[][] bank = themedBank(primaryTopic, key);
		saveQuestions(mock, bank);
	}

	private MockTest createMock(String title, String description, Difficulty difficulty) {
		MockTest mock = new MockTest();
		mock.setTitle(title);
		mock.setDescription(description);
		mock.setDifficulty(difficulty);
		mock.setQuestionCount(20);
		mock.setTimeLimitMinutes(15);
		mock.setPublished(true);
		mock.setAllowRetake(true);
		mock.setCutoffMarks(10.0);
		return mockTestRepository.save(mock);
	}

	private void saveQuestions(MockTest mock, String[][] rows) {
		int idx = 1;
		for (String[] s : rows) {
			Question q = new Question();
			q.setMockTest(mock);
			q.setQuestionText(s[0]);
			q.setOptionA(s[1]);
			q.setOptionB(s[2]);
			q.setOptionC(s[3]);
			q.setOptionD(s[4]);
			q.setCorrectOption(OptionLabel.valueOf(s[5]));
			q.setTopic(Topic.valueOf(s[6]));
			q.setExplanation(s[7]);
			if (s.length > 8 && s[8] != null && !s[8].isBlank()) {
				q.setSolutionImageUrl(s[8]);
			}
			q.setOrderIndex(idx++);
			questionRepository.save(q);
		}
	}

	private String[][] themedBank(Topic topic, String key) {
		String[][] q = new String[20][];
		for (int i = 0; i < 20; i++) {
			int n = i + 1;
			String correct = switch (n % 4) { case 0 -> "D"; case 1 -> "A"; case 2 -> "B"; default -> "C"; };
			String img = (i == 0 || i == 9) ? OSI_IMAGE : (i == 5 ? TCP_IMAGE : null);
			q[i] = new String[] {
					"(" + key.toUpperCase() + " Q" + n + ") Concept check on " + topic.name().replace('_', ' ') + "?",
					"Option A for Q" + n,
					"Option B for Q" + n,
					"Option C for Q" + n,
					"Option D for Q" + n,
					correct,
					topic.name(),
					"Detailed solution for question " + n + ": the correct answer is " + correct
							+ " because it matches the IBPS SO IT Officer syllabus point for "
							+ topic.name().replace('_', ' ') + ". Review official notes and previous year papers.",
					img
			};
		}
		return q;
	}
}
