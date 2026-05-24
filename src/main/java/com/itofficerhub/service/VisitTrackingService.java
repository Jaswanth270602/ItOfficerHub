package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.SiteVisitEvent;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.SiteVisitEventRepository;
import com.itofficerhub.repository.UserRepository;
import com.itofficerhub.util.AppTime;
import com.itofficerhub.util.HttpRequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class VisitTrackingService {

	private static final Duration DEDUP_WINDOW = Duration.ofSeconds(45);

	private final SiteVisitEventRepository repository;
	private final UserRepository userRepository;

	public VisitTrackingService(SiteVisitEventRepository repository, UserRepository userRepository) {
		this.repository = repository;
		this.userRepository = userRepository;
	}

	@Transactional
	public void recordVisit(HttpServletRequest request, RecordVisitRequest body) {
		String path = sanitizePath(body.path());
		if (path == null) return;
		if (path.startsWith("/admin")) return;

		String ip = HttpRequestUtils.clientIp(request);
		if (ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr() != null ? request.getRemoteAddr() : "0.0.0.0";
		}

		Instant now = Instant.now();
		if (repository.existsByIpAddressAndPathAndVisitedAtAfter(ip, path, now.minus(DEDUP_WINDOW))) {
			return;
		}

		SiteVisitEvent event = new SiteVisitEvent();
		event.setIpAddress(truncate(ip, 45));
		event.setVisitedAt(now);
		event.setVisitDate(LocalDate.now(AppTime.ZONE));
		event.setPath(path);
		event.setQueryString(truncate(body.query(), 1024));
		event.setReferer(truncate(body.referer(), 2048));
		String ua = request.getHeader("User-Agent");
		event.setUserAgent(ua != null ? truncate(ua, 2000) : null);
		event.setAcceptLanguage(truncate(request.getHeader("Accept-Language"), 128));
		event.setSessionKey(truncate(body.sessionKey(), 64));
		event.setDeviceClass(classifyDevice(ua));
		event.setCountryHint(truncate(request.getHeader("CF-IPCountry"), 8));

		Long userId = resolveUserId();
		if (userId != null) {
			event.setAuthenticated(true);
			userRepository.findById(userId).ifPresent(event::setUser);
		}

		repository.save(event);
	}

	@Transactional(readOnly = true)
	public VisitorAnalyticsDto adminAnalytics(String date, String ipSearch, String pathSearch, int page, int size) {
		int safeSize = Math.min(Math.max(size, 10), 100);
		int safePage = Math.max(page, 0);
		Pageable pageable = PageRequest.of(safePage, safeSize);

		String dateParam = (date != null && !date.isBlank()) ? date.trim() : null;
		String ip = ipSearch != null ? ipSearch.trim() : "";
		String path = pathSearch != null ? pathSearch.trim() : "";

		Page<SiteVisitEvent> result = repository.search(dateParam, ip, path, pageable);

		LocalDate selected = dateParam != null ? LocalDate.parse(dateParam) : AppTime.today();
		long visitsDay = repository.countByVisitDate(selected);
		long uniqueDay = repository.countDistinctIpByVisitDate(selected);

		LocalDate from = AppTime.today().minusDays(30);
		List<DailyVisitSummaryDto> summaries = repository.aggregateByDaySince(from).stream()
				.map(row -> new DailyVisitSummaryDto(
						((LocalDate) row[0]).toString(),
						((Number) row[1]).longValue(),
						((Number) row[2]).longValue()))
				.toList();

		List<SiteVisitRowDto> rows = result.getContent().stream().map(this::toRow).toList();

		return new VisitorAnalyticsDto(
				rows,
				result.getTotalElements(),
				safePage,
				safeSize,
				result.getTotalPages(),
				visitsDay,
				uniqueDay,
				summaries);
	}

	private SiteVisitRowDto toRow(SiteVisitEvent e) {
		User u = e.getUser();
		return new SiteVisitRowDto(
				e.getId(),
				e.getIpAddress(),
				e.getVisitedAt(),
				e.getVisitDate().toString(),
				e.getPath(),
				e.getQueryString(),
				e.getReferer(),
				e.getDeviceClass(),
				e.isAuthenticated(),
				u != null ? u.getId() : null,
				u != null ? u.getEmail() : null,
				u != null ? u.getName() : null,
				e.getCountryHint());
	}

	private static Long resolveUserId() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated()) return null;
		Object principal = auth.getPrincipal();
		if (principal instanceof com.itofficerhub.security.UserPrincipal p) {
			return p.getId();
		}
		return null;
	}

	private static String sanitizePath(String raw) {
		if (raw == null || raw.isBlank()) return null;
		String p = raw.trim();
		if (!p.startsWith("/")) p = "/" + p;
		if (p.length() > 512) p = p.substring(0, 512);
		if (p.contains("..")) return null;
		return p;
	}

	static String classifyDevice(String userAgent) {
		if (userAgent == null || userAgent.isBlank()) return "UNKNOWN";
		String ua = userAgent.toLowerCase(Locale.ROOT);
		if (ua.contains("bot") || ua.contains("crawler") || ua.contains("spider")) return "BOT";
		if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) return "MOBILE";
		if (ua.contains("ipad") || ua.contains("tablet")) return "TABLET";
		return "DESKTOP";
	}

	private static String truncate(String s, int max) {
		if (s == null) return null;
		String t = s.trim();
		if (t.isEmpty()) return null;
		return t.length() <= max ? t : t.substring(0, max);
	}
}
