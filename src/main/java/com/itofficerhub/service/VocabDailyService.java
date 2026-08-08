package com.itofficerhub.service;

import com.itofficerhub.repository.AppDownloadCounterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class VocabDailyService {

	public static final String APP_KEY = "vocab-daily";

	private static final Logger log = LoggerFactory.getLogger(VocabDailyService.class);

	private final AppDownloadCounterRepository counterRepository;
	private final String apkPath;

	public VocabDailyService(
			AppDownloadCounterRepository counterRepository,
			@Value("${app.vocab-daily.apk-path:}") String apkPath) {
		this.counterRepository = counterRepository;
		this.apkPath = apkPath == null ? "" : apkPath.trim();
	}

	@Transactional(readOnly = true)
	public long downloadCount() {
		Long count = counterRepository.findCountByAppKey(APP_KEY);
		return count != null ? count : 0L;
	}

	@Transactional
	public Resource prepareDownload() {
		Resource apk = resolveApk();
		if (apk == null || !apk.exists()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocab Daily APK is not available yet.");
		}
		counterRepository.increment(APP_KEY);
		return apk;
	}

	private Resource resolveApk() {
		if (!apkPath.isBlank()) {
			if (apkPath.startsWith("classpath:")) {
				return new ClassPathResource(apkPath.substring("classpath:".length()));
			}
			String filePath = apkPath.startsWith("file:") ? apkPath.substring("file:".length()) : apkPath;
			Path path = Path.of(filePath);
			if (Files.isRegularFile(path)) {
				return new FileSystemResource(path);
			}
			log.warn("Vocab Daily APK not found at configured path: {}", path.toAbsolutePath());
		}
		// Local / fallback locations (APK is kept outside the fat JAR on Render)
		Path[] candidates = {
				Path.of("downloads", "vocab-daily.apk"),
				Path.of("/app/downloads/vocab-daily.apk")
		};
		for (Path candidate : candidates) {
			if (Files.isRegularFile(candidate)) {
				return new FileSystemResource(candidate);
			}
		}
		ClassPathResource classpath = new ClassPathResource("static/downloads/vocab-daily.apk");
		if (classpath.exists()) {
			return classpath;
		}
		return null;
	}
}
