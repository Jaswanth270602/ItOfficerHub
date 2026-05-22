package com.itofficerhub.service;

import com.itofficerhub.config.CacheNames;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class AppCacheService {

	private final CacheManager cacheManager;

	public AppCacheService(CacheManager cacheManager) {
		this.cacheManager = cacheManager;
	}

	/** After a mock is submitted — rankings and public counts change. */
	public void evictAfterMockSubmit(long mockTestId, long userId) {
		evictKey(CacheNames.MOCK_RANKING, mockTestId);
		clear(CacheNames.MOCK_LEADERBOARD);
		evictKey(CacheNames.MOCK_ATTEMPT_COUNT, mockTestId);
		clear(CacheNames.PUBLIC_STATS);
		clear(CacheNames.PUBLISHED_MOCKS);
		evictKey(CacheNames.USER_MOCK_STATUS, userId);
		evictKey(CacheNames.USER_HISTORY, userId);
		clear(CacheNames.DASHBOARD_OVERVIEW);
	}

	public void evictDashboardOverview() {
		clear(CacheNames.DASHBOARD_OVERVIEW);
	}

	public void evictUserInbox(long userId) {
		evictKey(CacheNames.USER_INBOX, userId);
	}

	public void evictAllInboxes() {
		clear(CacheNames.USER_INBOX);
	}

	/** Admin changed mock catalog (publish/unpublish/edit). */
	public void evictPublicCatalog() {
		clear(CacheNames.PUBLISHED_MOCKS);
		clear(CacheNames.PUBLIC_STATS);
		clear(CacheNames.MOCK_ATTEMPT_COUNT);
		clear(CacheNames.DASHBOARD_OVERVIEW);
	}

	private void evictKey(String cacheName, Object key) {
		var cache = cacheManager.getCache(cacheName);
		if (cache != null) {
			cache.evict(key);
		}
	}

	private void clear(String cacheName) {
		var cache = cacheManager.getCache(cacheName);
		if (cache != null) {
			cache.clear();
		}
	}
}
