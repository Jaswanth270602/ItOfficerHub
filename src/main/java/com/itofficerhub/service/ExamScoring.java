package com.itofficerhub.service;

/** IBPS-style: +1 per correct, −0.25 per wrong, 0 for unattempted */
public final class ExamScoring {

	public static final double MARKS_PER_CORRECT = 1.0;
	public static final double NEGATIVE_PER_WRONG = 0.25;

	private ExamScoring() {}

	public record Breakdown(
			int correct,
			int wrong,
			int unattempted,
			double positiveMarks,
			double negativeMarks,
			double netScore,
			double maxMarks,
			double accuracyPercent
	) {}

	public static Breakdown compute(int totalQuestions, int correct, int wrong) {
		int unattempted = Math.max(0, totalQuestions - correct - wrong);
		double positive = correct * MARKS_PER_CORRECT;
		double negative = wrong * NEGATIVE_PER_WRONG;
		double net = positive - negative;
		double max = totalQuestions * MARKS_PER_CORRECT;
		double accuracy = totalQuestions > 0 ? (correct * 100.0) / totalQuestions : 0;
		return new Breakdown(correct, wrong, unattempted, positive, negative, net, max, accuracy);
	}
}
