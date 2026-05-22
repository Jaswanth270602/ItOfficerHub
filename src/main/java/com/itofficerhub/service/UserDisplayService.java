package com.itofficerhub.service;

import com.itofficerhub.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserDisplayService {

	public String displayName(User user) {
		if (user == null) return "Student";
		if (user.isUseAnonymousDisplay() && user.getAnonymousAlias() != null && !user.getAnonymousAlias().isBlank()) {
			return user.getAnonymousAlias().trim();
		}
		return maskRealName(user.getName());
	}

	public String maskRealName(String name) {
		if (name == null || name.isBlank()) return "Student";
		String[] parts = name.trim().split("\\s+");
		if (parts.length == 1) return parts[0];
		return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
	}
}
