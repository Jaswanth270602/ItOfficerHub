package com.itofficerhub.service;

import com.itofficerhub.dto.AuthResponse;
import com.itofficerhub.dto.AuthRequest;
import com.itofficerhub.dto.ChangePasswordRequest;
import com.itofficerhub.dto.RegisterRequest;
import com.itofficerhub.dto.SessionDto;
import com.itofficerhub.entity.Role;
import com.itofficerhub.entity.User;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.UserRepository;
import com.itofficerhub.security.JwtService;
import com.itofficerhub.security.UserPrincipal;
import com.itofficerhub.util.PhoneUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	public AuthService(UserRepository userRepository,
			PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}

	public AuthResponse register(RegisterRequest request) {
		if (request.website() != null && !request.website().isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Registration failed");
		}
		String phone = PhoneUtils.normalizeIndian(request.phone());
		if (!PhoneUtils.isValidIndian(phone)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid 10-digit Indian mobile number");
		}
		String email = request.email().toLowerCase().trim();
		if (userRepository.existsByEmail(email)) {
			throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
		}
		if (userRepository.existsByPhone(phone)) {
			throw new ApiException(HttpStatus.CONFLICT, "Mobile number already registered");
		}
		User user = new User();
		user.setEmail(email);
		user.setPhone(phone);
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setName(request.name().trim());
		user.setRole(Role.USER);
		if (request.anonymousAlias() != null && !request.anonymousAlias().isBlank()) {
			user.setAnonymousAlias(request.anonymousAlias().trim());
			user.setUseAnonymousDisplay(true);
		}
		if (request.bio() != null) user.setBio(request.bio());
		if (request.avatarEmoji() != null && !request.avatarEmoji().isBlank()) {
			user.setAvatarEmoji(request.avatarEmoji().trim());
		}
		user = userRepository.save(user);
		return buildAuthResponse(user);
	}

	public AuthResponse login(AuthRequest request) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(), request.password()));
		User user = userRepository.findByEmail(request.email().toLowerCase().trim())
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
		return buildAuthResponse(user);
	}

	public AuthResponse adminLogin(AuthRequest request) {
		AuthResponse response = login(request);
		if (!"ADMIN".equals(response.role())) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Admin access only");
		}
		return response;
	}

	public UserPrincipal currentUser() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal p)) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}
		return p;
	}

	public SessionDto currentSession() {
		UserPrincipal p = currentUser();
		User u = p.getUser();
		return new SessionDto(u.getId(), u.getEmail(), u.getName(), u.getRole().name());
	}

	@org.springframework.transaction.annotation.Transactional
	public void changePassword(ChangePasswordRequest request) {
		UserPrincipal principal = currentUser();
		User user = userRepository.findById(principal.getId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}
		if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
		}
		user.setPassword(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
	}

	private AuthResponse buildAuthResponse(User user) {
		String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
		return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name());
	}
}
