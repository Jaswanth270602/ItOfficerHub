package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "site_visit_events")
public class SiteVisitEvent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "ip_address", nullable = false, length = 45)
	private String ipAddress;

	@Column(name = "visited_at", nullable = false)
	private Instant visitedAt;

	@Column(name = "visit_date", nullable = false)
	private LocalDate visitDate;

	@Column(nullable = false, length = 512)
	private String path;

	@Column(name = "query_string", length = 1024)
	private String queryString;

	@Column(length = 2048)
	private String referer;

	@Column(name = "user_agent", columnDefinition = "TEXT")
	private String userAgent;

	@Column(name = "accept_language", length = 128)
	private String acceptLanguage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "session_key", length = 64)
	private String sessionKey;

	@Column(name = "device_class", nullable = false, length = 16)
	private String deviceClass = "UNKNOWN";

	@Column(name = "is_authenticated", nullable = false)
	private boolean authenticated;

	@Column(name = "country_hint", length = 8)
	private String countryHint;

	public Long getId() { return id; }

	public String getIpAddress() { return ipAddress; }
	public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

	public Instant getVisitedAt() { return visitedAt; }
	public void setVisitedAt(Instant visitedAt) { this.visitedAt = visitedAt; }

	public LocalDate getVisitDate() { return visitDate; }
	public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

	public String getPath() { return path; }
	public void setPath(String path) { this.path = path; }

	public String getQueryString() { return queryString; }
	public void setQueryString(String queryString) { this.queryString = queryString; }

	public String getReferer() { return referer; }
	public void setReferer(String referer) { this.referer = referer; }

	public String getUserAgent() { return userAgent; }
	public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

	public String getAcceptLanguage() { return acceptLanguage; }
	public void setAcceptLanguage(String acceptLanguage) { this.acceptLanguage = acceptLanguage; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getSessionKey() { return sessionKey; }
	public void setSessionKey(String sessionKey) { this.sessionKey = sessionKey; }

	public String getDeviceClass() { return deviceClass; }
	public void setDeviceClass(String deviceClass) { this.deviceClass = deviceClass; }

	public boolean isAuthenticated() { return authenticated; }
	public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }

	public String getCountryHint() { return countryHint; }
	public void setCountryHint(String countryHint) { this.countryHint = countryHint; }
}
