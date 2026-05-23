package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(unique = true, length = 20)
	private String phone;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.USER;

	private String googleId;

	@Column(length = 80)
	private String anonymousAlias;

	@Column(nullable = false)
	private boolean useAnonymousDisplay = false;

	@Column(length = 500)
	private String bio;

	@Column(length = 16)
	private String avatarEmoji = "🎯";

	@Column(nullable = false)
	private boolean allowDirectMessages = true;

	@Column(nullable = false)
	private boolean showInDirectory = true;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	@Column(nullable = false)
	private int prepPoints = 0;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }
	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public Role getRole() { return role; }
	public void setRole(Role role) { this.role = role; }
	public String getGoogleId() { return googleId; }
	public void setGoogleId(String googleId) { this.googleId = googleId; }
	public String getAnonymousAlias() { return anonymousAlias; }
	public void setAnonymousAlias(String anonymousAlias) { this.anonymousAlias = anonymousAlias; }
	public boolean isUseAnonymousDisplay() { return useAnonymousDisplay; }
	public void setUseAnonymousDisplay(boolean useAnonymousDisplay) { this.useAnonymousDisplay = useAnonymousDisplay; }
	public String getBio() { return bio; }
	public void setBio(String bio) { this.bio = bio; }
	public String getAvatarEmoji() { return avatarEmoji; }
	public void setAvatarEmoji(String avatarEmoji) { this.avatarEmoji = avatarEmoji; }
	public boolean isAllowDirectMessages() { return allowDirectMessages; }
	public void setAllowDirectMessages(boolean allowDirectMessages) { this.allowDirectMessages = allowDirectMessages; }
	public boolean isShowInDirectory() { return showInDirectory; }
	public void setShowInDirectory(boolean showInDirectory) { this.showInDirectory = showInDirectory; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public int getPrepPoints() { return prepPoints; }
	public void setPrepPoints(int prepPoints) { this.prepPoints = prepPoints; }
}
