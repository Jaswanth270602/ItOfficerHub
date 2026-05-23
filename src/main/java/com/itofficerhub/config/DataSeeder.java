package com.itofficerhub.config;

import com.itofficerhub.entity.Role;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Optional one-time admin bootstrap only. Never seeds mocks or sample questions.
 * Idempotent: skips if admin email already exists. Does not modify existing users or DB content.
 */
@Component
public class DataSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.seed.admin.enabled:true}")
	private boolean seedAdminEnabled;

	@Value("${app.admin.email}")
	private String adminEmail;

	@Value("${app.admin.password}")
	private String adminPassword;

	@Value("${app.admin.name}")
	private String adminName;

	public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
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
