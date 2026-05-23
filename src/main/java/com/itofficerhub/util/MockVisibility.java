package com.itofficerhub.util;

import com.itofficerhub.entity.MockTest;

import java.time.Instant;
import java.time.LocalDate;

/** When a scheduled mock becomes visible to students (IST midnight on go-live day). */
public final class MockVisibility {

	private MockVisibility() {}

	public static Instant effectiveGoLiveAt(MockTest m) {
		if (m.getGoLiveAt() != null) {
			return m.getGoLiveAt();
		}
		if (m.getPublishedAt() != null) {
			return m.getPublishedAt();
		}
		return m.getCreatedAt();
	}

	public static LocalDate goLiveDate(MockTest m) {
		return effectiveGoLiveAt(m).atZone(AppTime.ZONE).toLocalDate();
	}

	public static boolean isVisible(MockTest m, Instant now) {
		if (!m.isPublished()) {
			return false;
		}
		return !now.isBefore(effectiveGoLiveAt(m));
	}

	public static boolean isScheduledFuture(MockTest m, Instant now) {
		return m.isPublished() && !isVisible(m, now);
	}

	public static String liveStatus(MockTest m, Instant now) {
		if (!m.isPublished()) {
			return "DRAFT";
		}
		if (!isVisible(m, now)) {
			return "SCHEDULED";
		}
		return "LIVE";
	}
}
