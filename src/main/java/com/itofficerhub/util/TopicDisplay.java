package com.itofficerhub.util;

import com.itofficerhub.dto.TopicCatalogItemDto;
import com.itofficerhub.entity.Topic;

import java.util.Arrays;
import java.util.List;

public final class TopicDisplay {

	private TopicDisplay() {}

	public static List<TopicCatalogItemDto> catalog() {
		return Arrays.stream(Topic.values())
				.map(t -> new TopicCatalogItemDto(t.name(), shortLabel(t), fullLabel(t)))
				.toList();
	}

	public static String shortLabel(Topic topic) {
		return switch (topic) {
			case NETWORKING -> "CN";
			case DBMS -> "DBMS";
			case OPERATING_SYSTEMS -> "OS";
			case SECURITY -> "SEC";
			case WEB_TECHNOLOGIES -> "WEB";
			case DATA_STRUCTURES -> "DS";
			case COMPUTER_ORGANIZATION -> "CO";
			case SOFTWARE_ENGINEERING -> "SE";
			case CLOUD_COMPUTING -> "CLOUD";
			case DIGITAL_ELECTRONICS -> "DE";
			case QUANTITATIVE_APTITUDE -> "QUANT";
			case LOGICAL_REASONING -> "LR";
			case VERBAL_ABILITY -> "VERB";
		};
	}

	public static String fullLabel(Topic topic) {
		return switch (topic) {
			case NETWORKING -> "Computer Networks";
			case DBMS -> "DBMS & SQL";
			case OPERATING_SYSTEMS -> "Operating Systems";
			case SECURITY -> "Cyber Security";
			case WEB_TECHNOLOGIES -> "Web Technologies";
			case DATA_STRUCTURES -> "Data Structures";
			case COMPUTER_ORGANIZATION -> "Computer Organization";
			case SOFTWARE_ENGINEERING -> "Software Engineering";
			case CLOUD_COMPUTING -> "Cloud Computing";
			case DIGITAL_ELECTRONICS -> "Digital Electronics";
			case QUANTITATIVE_APTITUDE -> "Quantitative Aptitude";
			case LOGICAL_REASONING -> "Logical Reasoning";
			case VERBAL_ABILITY -> "Verbal Ability";
		};
	}
}
