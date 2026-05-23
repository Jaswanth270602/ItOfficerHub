package com.itofficerhub.config;

import com.itofficerhub.entity.Role;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.UserRepository;
import com.itofficerhub.service.MockDataWipeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Optional admin bootstrap only. Never seeds mocks.
 * Set SEED_WIPE_MOCKS=true once to delete all existing mock tests (then turn off).
 */
@Component
public class DataSeeder implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final MockDataWipeService mockDataWipeService;

	@Value("${app.seed.admin.enabled:true}")
	private boolean seedAdminEnabled;

	@Value("${app.seed.wipe-mocks:false}")
	private boolean wipeMocks;

	@Value("${app.admin.email}")
	private String adminEmail;

	@Value("${app.admin.password}")
	private String adminPassword;

	@Value("${app.admin.name}")
	private String adminName;

	public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
			MockDataWipeService mockDataWipeService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.mockDataWipeService = mockDataWipeService;
	}

	@Override
	public void run(String... args) {
		if (wipeMocks) {
			log.warn("app.seed.wipe-mocks=true — deleting all mock tests and attempts");
			mockDataWipeService.wipeAllMocks();
		}
		if (seedAdminEnabled) {
			seedAdmin();
		}
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
