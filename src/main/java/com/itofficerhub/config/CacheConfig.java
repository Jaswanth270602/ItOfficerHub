package com.itofficerhub.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

	@Bean
	public CacheManager cacheManager() {
		var manager = new org.springframework.cache.support.SimpleCacheManager();
		manager.setCaches(List.of(
				build(CacheNames.PUBLIC_STATS, 120, 8),
				build(CacheNames.PUBLISHED_MOCKS, 120, 32),
				build(CacheNames.MOCK_ATTEMPT_COUNT, 180, 256),
				build(CacheNames.MOCK_RANKING, 90, 128),
				build(CacheNames.MOCK_LEADERBOARD, 90, 512),
				build(CacheNames.USER_INBOX, 25, 2048),
				build(CacheNames.USER_MOCK_STATUS, 45, 2048),
				build(CacheNames.USER_HISTORY, 45, 2048)));
		return manager;
	}

	private static CaffeineCache build(String name, int ttlSeconds, int maxSize) {
		return new CaffeineCache(name, Caffeine.newBuilder()
				.maximumSize(maxSize)
				.expireAfterWrite(Duration.ofSeconds(ttlSeconds))
				.recordStats()
				.build());
	}
}
