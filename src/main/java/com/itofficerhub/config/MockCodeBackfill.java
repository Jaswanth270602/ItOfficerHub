package com.itofficerhub.config;

import com.itofficerhub.entity.ExamTarget;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.repository.MockTestRepository;
import com.itofficerhub.service.MockCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Assigns IBPS-001 style codes to mocks created before mockCode existed. */
@Component
@Order(1)
public class MockCodeBackfill implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(MockCodeBackfill.class);

	private final MockTestRepository mockTestRepository;
	private final MockCodeService mockCodeService;

	public MockCodeBackfill(MockTestRepository mockTestRepository, MockCodeService mockCodeService) {
		this.mockTestRepository = mockTestRepository;
		this.mockCodeService = mockCodeService;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		List<MockTest> missing = mockTestRepository.findMissingMockCodes();
		if (missing.isEmpty()) {
			return;
		}

		Map<ExamTarget, Long> seqByTarget = new HashMap<>();
		log.warn("Backfilling mockCode for {} mocks", missing.size());
		for (MockTest m : missing) {
			ExamTarget target = m.getExamTarget();
			long next = seqByTarget.computeIfAbsent(target, t -> {
				long total = mockTestRepository.countByExamTarget(t);
				long stillMissing = missing.stream().filter(x -> Objects.equals(x.getExamTarget(), t)).count();
				return total - stillMissing; // already-coded count for this target
			}) + 1;
			seqByTarget.put(target, next);
			m.setMockCode(mockCodeService.prefixFor(target) + "-" + String.format("%03d", next));
			mockTestRepository.save(m);
		}
		log.info("mockCode backfill complete");
	}
}
