package com.itofficerhub.config;

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

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
		List<MockTest> missing = mockTestRepository.findAll().stream()
				.filter(m -> m.getMockCode() == null || m.getMockCode().isBlank())
				.sorted(Comparator.comparing(MockTest::getId))
				.toList();
		if (missing.isEmpty()) return;

		Map<com.itofficerhub.entity.ExamTarget, Long> seqByTarget = mockTestRepository.findAll().stream()
				.filter(m -> m.getMockCode() != null && !m.getMockCode().isBlank())
				.collect(Collectors.groupingBy(MockTest::getExamTarget, Collectors.counting()));

		log.warn("Backfilling mockCode for {} mocks", missing.size());
		for (MockTest m : missing) {
			var target = m.getExamTarget();
			long seq = seqByTarget.getOrDefault(target, 0L) + 1;
			String code = mockCodeService.prefixFor(target) + "-" + String.format("%03d", seq);
			m.setMockCode(code);
			mockTestRepository.save(m);
			seqByTarget.put(target, seq);
		}
		log.info("mockCode backfill complete");
	}
}
