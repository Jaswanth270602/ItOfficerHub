package com.itofficerhub.repository;

import com.itofficerhub.entity.PracticeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {

	Optional<PracticeQuestion> findBySectionIdAndSubtopicSlugAndPublishedTrue(String sectionId, String subtopicSlug);

	Optional<PracticeQuestion> findBySectionIdAndSubtopicSlug(String sectionId, String subtopicSlug);

	@Query("SELECT p.sectionId AS sectionId, p.subtopicSlug AS subtopicSlug FROM PracticeQuestion p WHERE p.published = true")
	List<SubtopicKey> findPublishedKeys();

	interface SubtopicKey {
		String getSectionId();
		String getSubtopicSlug();
	}
}
