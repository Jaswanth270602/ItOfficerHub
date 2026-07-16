package com.itofficerhub.util;

/**
 * Composes a simple stored explanation from structured import fields
 * (explanation + explainA–D) so the result UI can render cleanly.
 */
public final class ExplanationComposer {

	private ExplanationComposer() {}

	public static String compose(String explanation, String a, String b, String c, String d) {
		String main = blankToEmpty(explanation);
		String ea = blankToEmpty(a);
		String eb = blankToEmpty(b);
		String ec = blankToEmpty(c);
		String ed = blankToEmpty(d);

		if (!ea.isEmpty() && !eb.isEmpty() && !ec.isEmpty() && !ed.isEmpty()) {
			String head = main.isEmpty() ? "See option explanations below." : main;
			return head + "\n\nOption A — " + ea
					+ "\nOption B — " + eb
					+ "\nOption C — " + ec
					+ "\nOption D — " + ed;
		}
		return main;
	}

	public static boolean hasAllOptionExplains(String a, String b, String c, String d) {
		return !blankToEmpty(a).isEmpty()
				&& !blankToEmpty(b).isEmpty()
				&& !blankToEmpty(c).isEmpty()
				&& !blankToEmpty(d).isEmpty();
	}

	/** Legacy free-text: must mention Option A–D. */
	public static boolean explainsAllOptionsInText(String exp) {
		if (exp == null) return false;
		String upper = exp.toUpperCase();
		return upper.contains("OPTION A") && upper.contains("OPTION B")
				&& upper.contains("OPTION C") && upper.contains("OPTION D");
	}

	private static String blankToEmpty(String s) {
		return s == null ? "" : s.trim();
	}
}
