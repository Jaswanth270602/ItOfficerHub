package com.itofficerhub.service;

import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Awards Prep Points only on the first submitted attempt per mock (per user).
 * Points unlock future features; retakes do not earn more.
 */
@Service
public class PrepPointsService {

	private final TestAttemptRepository attemptRepository;
	private final UserRepository userRepository;

	public PrepPointsService(TestAttemptRepository attemptRepository, UserRepository userRepository) {
		this.attemptRepository = attemptRepository;
		this.userRepository = userRepository;
	}

	public boolean isFirstSubmittedAttempt(long userId, long mockId) {
		return attemptRepository.countSubmittedByUserAndMock(userId, mockId) == 0;
	}

	@Transactional
	public int awardFirstAttempt(long userId, double percentage, boolean clearedCutoff) {
		int earned = computePoints(percentage, clearedCutoff);
		User user = userRepository.findById(userId).orElseThrow();
		user.setPrepPoints(user.getPrepPoints() + earned);
		userRepository.save(user);
		return earned;
	}

	public int getTotalPoints(long userId) {
		return userRepository.findById(userId).map(User::getPrepPoints).orElse(0);
	}

	static int computePoints(double percentage, boolean clearedCutoff) {
		int base = 25;
		int scorePart = (int) Math.round(Math.min(100, Math.max(0, percentage)));
		int cutoffBonus = clearedCutoff ? 25 : 0;
		int total = base + scorePart + cutoffBonus;
		return Math.min(150, total);
	}
}
