package com.itofficerhub.service;

import com.itofficerhub.entity.MockTest;
import com.itofficerhub.repository.MockTestRepository;
import com.itofficerhub.util.AppTime;
import com.itofficerhub.util.MockVisibility;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class MockCatalogService {

	private final MockTestRepository mockTestRepository;

	public MockCatalogService(MockTestRepository mockTestRepository) {
		this.mockTestRepository = mockTestRepository;
	}

	@Transactional(readOnly = true)
	public List<MockTest> visibleMocks(Instant now) {
		return mockTestRepository.findPublishedCandidates().stream()
				.filter(m -> MockVisibility.isVisible(m, now))
				.sorted(Comparator.comparing(MockVisibility::effectiveGoLiveAt).reversed())
				.toList();
	}

	/** Today's scheduled daily mock only (IST go-live date = today). No fallback to older live mocks. */
	@Transactional(readOnly = true)
	public Optional<MockTest> featuredMock(Instant now) {
		LocalDate today = AppTime.today();
		return visibleMocks(now).stream()
				.filter(m -> MockVisibility.goLiveDate(m).equals(today))
				.max(Comparator.comparing(MockVisibility::effectiveGoLiveAt));
	}

	@Transactional(readOnly = true)
	public Optional<MockTest> nextScheduled(Instant now) {
		return mockTestRepository.findPublishedCandidates().stream()
				.filter(m -> MockVisibility.isScheduledFuture(m, now))
				.min(Comparator.comparing(MockVisibility::effectiveGoLiveAt));
	}

	@Transactional(readOnly = true)
	public long countVisible(Instant now) {
		return visibleMocks(now).size();
	}

	@Transactional(readOnly = true)
	public Optional<MockTest> findByIdIfVisible(long id, Instant now) {
		return mockTestRepository.findById(id)
				.filter(m -> MockVisibility.isVisible(m, now));
	}
}
