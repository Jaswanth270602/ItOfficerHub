package com.itofficerhub.service;

import com.itofficerhub.entity.ExamTarget;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.repository.MockTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MockCodeService {

	private final MockTestRepository mockTestRepository;

	public MockCodeService(MockTestRepository mockTestRepository) {
		this.mockTestRepository = mockTestRepository;
	}

	public String prefixFor(ExamTarget target) {
		return switch (target) {
			case IBPS_SO_IT -> "IBPS";
			case TCS_NQT -> "TCS";
			case NIACL_IT -> "NIACL";
			case LIC_IT -> "LIC";
			case GIC_IT -> "GIC";
			case RBI_IT -> "RBI";
			case PSU_IT_GENERAL -> "PSU";
			case MIXED -> "MIX";
		};
	}

	@Transactional(readOnly = true)
	public String previewNextCode(ExamTarget target) {
		long seq = mockTestRepository.countByExamTarget(target) + 1;
		return formatCode(target, seq);
	}

	@Transactional
	public String assignCode(MockTest mock) {
		if (mock.getMockCode() != null && !mock.getMockCode().isBlank()) {
			return mock.getMockCode();
		}
		ExamTarget target = mock.getExamTarget() != null ? mock.getExamTarget() : ExamTarget.IBPS_SO_IT;
		long seq = mockTestRepository.countByExamTarget(target) + 1;
		String code = formatCode(target, seq);
		mock.setMockCode(code);
		return code;
	}

	private String formatCode(ExamTarget target, long seq) {
		return prefixFor(target) + "-" + String.format("%03d", seq);
	}
}
