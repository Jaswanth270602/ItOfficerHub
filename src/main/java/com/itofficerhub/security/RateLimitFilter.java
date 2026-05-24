package com.itofficerhub.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itofficerhub.util.HttpRequestUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Map;

/**
 * In-memory per-IP rate limits to reduce brute-force and basic DoS on auth and API routes.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

	private final RateLimitService rateLimitService;
	private final ObjectMapper objectMapper;

	public RateLimitFilter(RateLimitService rateLimitService, ObjectMapper objectMapper) {
		this.rateLimitService = rateLimitService;
		this.objectMapper = objectMapper;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		if (!rateLimitService.isEnabled()) {
			chain.doFilter(request, response);
			return;
		}

		String path = request.getRequestURI();
		if ("/health".equals(path)) {
			chain.doFilter(request, response);
			return;
		}

		String clientIp = HttpRequestUtils.clientIp(request);
		RateLimitService.Tier tier = tierFor(request, path);

		if (!rateLimitService.tryConsume(clientIp, tier)) {
			write429(response);
			return;
		}
		if (tier != RateLimitService.Tier.GLOBAL
				&& !rateLimitService.tryConsume(clientIp, RateLimitService.Tier.GLOBAL)) {
			write429(response);
			return;
		}

		chain.doFilter(request, response);
	}

	private static RateLimitService.Tier tierFor(HttpServletRequest request, String path) {
		if (path.startsWith("/api/auth/")) {
			return RateLimitService.Tier.AUTH;
		}
		String method = request.getMethod();
		if (path.startsWith("/api/public/") && "GET".equalsIgnoreCase(method)) {
			return RateLimitService.Tier.API_READ;
		}
		if (path.startsWith("/api/") && !"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) {
			return RateLimitService.Tier.API_WRITE;
		}
		return RateLimitService.Tier.GLOBAL;
	}

	private void write429(HttpServletResponse response) throws IOException {
		response.setStatus(429);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(),
				Map.of("error", "Too many requests. Please wait a minute and try again."));
	}
}
