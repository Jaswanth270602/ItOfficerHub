package com.itofficerhub.util;

import java.time.*;

/** India Standard Time for “today’s mock” and daily spotlight windows. */
public final class AppTime {

	public static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

	private AppTime() {}

	public static LocalDate today() {
		return LocalDate.now(ZONE);
	}

	public static Instant startOfToday() {
		return today().atStartOfDay(ZONE).toInstant();
	}

	public static Instant startOfTomorrow() {
		return today().plusDays(1).atStartOfDay(ZONE).toInstant();
	}

	public static boolean isToday(Instant instant) {
		if (instant == null) return false;
		LocalDate d = instant.atZone(ZONE).toLocalDate();
		return d.equals(today());
	}
}
