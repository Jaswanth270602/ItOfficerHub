package com.itofficerhub.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Maps Neon/Render {@code DATABASE_URL} (postgres://...) to Spring datasource properties.
 */
public class DatabaseUrlConfig implements EnvironmentPostProcessor {

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		String databaseUrl = System.getenv("DATABASE_URL");
		if (databaseUrl == null || databaseUrl.isBlank()) {
			return;
		}
		if (environment.getProperty("SPRING_DATASOURCE_URL") != null) {
			return;
		}
		try {
			Map<String, Object> props = parseDatabaseUrl(databaseUrl);
			environment.getPropertySources().addFirst(new MapPropertySource("databaseUrl", props));
		} catch (Exception ignored) {
			// Fall back to DB_* / defaults in application.properties
		}
	}

	static Map<String, Object> parseDatabaseUrl(String databaseUrl) {
		URI uri = URI.create(databaseUrl.replace("postgres://", "postgresql://"));
		String userInfo = uri.getUserInfo();
		String username = "postgres";
		String password = "";
		if (userInfo != null && userInfo.contains(":")) {
			int colon = userInfo.indexOf(':');
			username = userInfo.substring(0, colon);
			password = userInfo.substring(colon + 1);
		} else if (userInfo != null) {
			username = userInfo;
		}
		String path = uri.getPath();
		String dbName = path != null && path.length() > 1 ? path.substring(1) : "itofficerhub";
		String query = uri.getQuery();
		String jdbc = "jdbc:postgresql://" + uri.getHost()
				+ (uri.getPort() > 0 ? ":" + uri.getPort() : "")
				+ "/" + dbName
				+ (query != null && !query.isBlank() ? "?" + query : "?sslmode=require");

		Map<String, Object> props = new HashMap<>();
		props.put("spring.datasource.url", jdbc);
		props.put("spring.datasource.username", username);
		props.put("spring.datasource.password", password);
		return props;
	}
}
