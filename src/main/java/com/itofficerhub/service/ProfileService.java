package com.itofficerhub.service;

import com.itofficerhub.dto.ProfileDto;
import com.itofficerhub.dto.UpdateProfileRequest;
import com.itofficerhub.entity.User;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.repository.UserRepository;
import com.itofficerhub.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final UserDisplayService userDisplayService;

	public ProfileService(UserRepository userRepository, TestAttemptRepository attemptRepository,
			UserDisplayService userDisplayService) {
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.userDisplayService = userDisplayService;
	}

	public ProfileDto getMyProfile() {
		return toDto(getCurrentUser().getUser(), countAttempts(getCurrentUser().getId()));
	}

	public ProfileDto getProfile(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		return toDto(user, countAttempts(userId));
	}

	@Transactional
	public ProfileDto updateProfile(UpdateProfileRequest request) {
		User user = getCurrentUser().getUser();
		if (request.anonymousAlias() != null) user.setAnonymousAlias(request.anonymousAlias().trim());
		if (request.useAnonymousDisplay() != null) user.setUseAnonymousDisplay(request.useAnonymousDisplay());
		if (request.bio() != null) user.setBio(request.bio());
		if (request.avatarEmoji() != null && !request.avatarEmoji().isBlank()) {
			user.setAvatarEmoji(request.avatarEmoji().trim());
		}
		if (request.allowDirectMessages() != null) user.setAllowDirectMessages(request.allowDirectMessages());
		if (request.showInDirectory() != null) user.setShowInDirectory(request.showInDirectory());
		user = userRepository.save(user);
		return toDto(user, countAttempts(user.getId()));
	}

	private long countAttempts(Long userId) {
		return attemptRepository.findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(userId).size();
	}

	private ProfileDto toDto(User user, long mocksAttempted) {
		return new ProfileDto(
				user.getId(),
				user.getEmail(),
				user.getPhone(),
				user.getName(),
				userDisplayService.displayName(user),
				user.getAnonymousAlias(),
				user.isUseAnonymousDisplay(),
				user.getBio(),
				user.getAvatarEmoji() != null ? user.getAvatarEmoji() : "🎯",
				mocksAttempted,
				user.isAllowDirectMessages(),
				user.isShowInDirectory());
	}

	private UserPrincipal getCurrentUser() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) return p;
		throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
	}
}
