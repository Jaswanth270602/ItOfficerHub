package com.itofficerhub.service;

import com.itofficerhub.repository.AppDownloadCounterRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VocabDailyService {

	public static final String APP_KEY = "vocab-daily";
	private static final String APK_CLASSPATH = "static/downloads/vocab-daily.apk";

	private final AppDownloadCounterRepository counterRepository;

	public VocabDailyService(AppDownloadCounterRepository counterRepository) {
		this.counterRepository = counterRepository;
	}

	@Transactional(readOnly = true)
	public long downloadCount() {
		Long count = counterRepository.findCountByAppKey(APP_KEY);
		return count != null ? count : 0L;
	}

	@Transactional
	public Resource prepareDownload() {
		Resource apk = new ClassPathResource(APK_CLASSPATH);
		if (!apk.exists()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocab Daily APK is not available yet.");
		}
		int updated = counterRepository.increment(APP_KEY);
		if (updated == 0) {
			// Row missing (migration not applied) — still serve APK without failing the user
		}
		return apk;
	}
}
