package com.itofficerhub.util;

import java.util.regex.Pattern;

public final class PhoneUtils {

	private static final Pattern INDIAN_MOBILE = Pattern.compile("^\\+91[6-9]\\d{9}$");

	private PhoneUtils() {}

	/** Normalize to +91XXXXXXXXXX for Indian mobiles. */
	public static String normalizeIndian(String raw) {
		if (raw == null) return null;
		String digits = raw.replaceAll("[^0-9+]", "");
		if (digits.startsWith("+91")) {
			digits = digits.substring(3);
		} else if (digits.startsWith("91") && digits.length() == 12) {
			digits = digits.substring(2);
		} else if (digits.startsWith("0") && digits.length() == 11) {
			digits = digits.substring(1);
		}
		if (digits.length() == 10) {
			return "+91" + digits;
		}
		if (raw.trim().startsWith("+91") && digits.length() >= 12) {
			return "+91" + digits.substring(digits.length() - 10);
		}
		return raw.trim();
	}

	public static boolean isValidIndian(String normalized) {
		return normalized != null && INDIAN_MOBILE.matcher(normalized).matches();
	}
}
