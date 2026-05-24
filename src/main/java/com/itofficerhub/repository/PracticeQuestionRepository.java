package com.itofficerhub.repository;

import com.itofficerhub.entity.PracticeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {

	List<PracticeQuestion> findBySectionIdAndSubtopicSlugOrderByQuestionNumberAsc(
			String sectionId, String subtopicSlug);

	Optional<PracticeQuestion> findBySectionIdAndSubtopicSlugAndQuestionNumberAndPublishedTrue(
			String sectionId, String subtopicSlug, int questionNumber);

	Optional<PracticeQuestion> findBySectionIdAndSubtopicSlugAndQuestionNumber(
			String sectionId, String subtopicSlug, int questionNumber);

	List<PracticeQuestion> findBySectionIdAndSubtopicSlugAndPublishedTrueOrderByQuestionNumberAsc(
			String sectionId, String subtopicSlug);

	long countBySectionIdAndSubtopicSlugAndPublishedTrue(String sectionId, String subtopicSlug);

	long countBySectionIdAndSubtopicSlug(String sectionId, String subtopicSlug);

	@Query("""
			SELECT COALESCE(MAX(p.questionNumber), 0) FROM PracticeQuestion p
			WHERE p.sectionId = :sectionId AND p.subtopicSlug = :subtopicSlug
			""")
	int findMaxQuestionNumber(String sectionId, String subtopicSlug);

	@Query("""
			SELECT p.sectionId AS sectionId, p.subtopicSlug AS subtopicSlug, COUNT(p) AS cnt
			FROM PracticeQuestion p WHERE p.published = true
			GROUP BY p.sectionId, p.subtopicSlug
			""")
	List<SubtopicCount> countPublishedBySubtopic();

	interface SubtopicCount {
		String getSectionId();
		String getSubtopicSlug();
		long getCnt();
	}
}
