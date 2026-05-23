package com.itofficerhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Serves React build from classpath:/static and falls back to index.html for client routes.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**")
				.addResourceLocations("classpath:/static/")
				.resourceChain(true)
				.addResolver(new SpaFallbackResolver());
	}

	static class SpaFallbackResolver extends PathResourceResolver {
		@Override
		protected Resource resolveResourceInternal(HttpServletRequest request, String requestPath,
				List<? extends Resource> locations, ResourceResolverChain chain) {
			if (requestPath.startsWith("api/") || "health".equals(requestPath)) {
				return null;
			}
			Resource resolved = super.resolveResourceInternal(request, requestPath, locations, chain);
			if (resolved != null) {
				return resolved;
			}
			return new ClassPathResource("/static/index.html");
		}
	}
}
