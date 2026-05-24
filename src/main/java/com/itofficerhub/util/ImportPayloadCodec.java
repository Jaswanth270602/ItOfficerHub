package com.itofficerhub.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itofficerhub.dto.ImportMockRequest;
import com.itofficerhub.dto.ImportPracticeRequest;
import com.itofficerhub.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.util.Base64;

@Component
public class ImportPayloadCodec {

	private final ObjectMapper objectMapper;

	public ImportPayloadCodec(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public ImportMockRequest decodeMock(String base64Payload) {
		return decode(base64Payload, ImportMockRequest.class);
	}

	public ImportPracticeRequest decodePractice(String base64Payload) {
		return decode(base64Payload, ImportPracticeRequest.class);
	}

	private <T> T decode(String base64Payload, Class<T> type) {
		if (base64Payload == null || base64Payload.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Import payload is empty");
		}
		try {
			String cleaned = base64Payload.replaceAll("\\s+", "");
			byte[] json = Base64.getDecoder().decode(cleaned);
			return objectMapper.readValue(json, type);
		} catch (IllegalArgumentException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Import payload is not valid Base64");
		} catch (Exception e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Import payload is not valid JSON: " + e.getMessage());
		}
	}
}
