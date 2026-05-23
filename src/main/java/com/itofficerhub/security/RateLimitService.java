package com.itofficerhub.security;

import com.itofficerhub.config.RateLimitProperties;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimitService {

	public enum Tier {
		AUTH, API_WRITE, API_READ, GLOBAL
	}

	private record Window(AtomicInteger count, long resetAtMs) {}

	private final RateLimitProperties props;
	private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

	public RateLimitService(RateLimitProperties props) {
		this.props = props;
	}

	public boolean isEnabled() {
		return props.enabled();
	}

	public boolean tryConsume(String clientKey, Tier tier) {
		if (!props.enabled()) return true;
		int limit = limitFor(tier);
		long windowMs = 60_000L;
		String key = tier.name() + ":" + clientKey;
		long now = System.currentTimeMillis();

		Window w = windows.compute(key, (k, existing) -> {
			if (existing == null || now >= existing.resetAtMs) {
				return new Window(new AtomicInteger(0), now + windowMs);
			}
			return existing;
		});

		int n = w.count.incrementAndGet();
		if (n > limit) {
			return false;
		}
		if (windows.size() > 20_000) {
			prune(now);
		}
		return true;
	}

	private int limitFor(Tier tier) {
		return switch (tier) {
			case AUTH -> props.authPerMinute();
			case API_WRITE -> props.apiWritePerMinute();
			case API_READ -> props.apiReadPerMinute();
			case GLOBAL -> props.globalPerMinute();
		};
	}

	private void prune(long now) {
		windows.entrySet().removeIf(e -> now >= e.getValue().resetAtMs);
	}
}
