# Stage 1: Build React UI
FROM node:20-bookworm-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend .
ENV VITE_API_URL=
ARG VITE_SITE_URL=https://itofficerhub.in
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

# Stage 2: Build Spring Boot JAR (UI baked into classpath:/static)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
COPY src src
COPY --from=frontend /fe/dist src/main/resources/static
RUN ./mvnw -q package -DskipTests -Dskip.frontend.build=true

# Stage 3: Run — APK kept outside the fat JAR (faster startup / less RAM on Render free)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D -u 1000 appuser \
	&& mkdir -p /app/downloads \
	&& chown -R appuser:appuser /app
COPY --from=build /app/target/ItOfficerHub-*.jar app.jar
COPY downloads/vocab-daily.apk /app/downloads/vocab-daily.apk
RUN chown appuser:appuser /app/downloads/vocab-daily.apk
USER appuser
EXPOSE 8080
ENV PORT=8080
ENV VOCAB_DAILY_APK_PATH=/app/downloads/vocab-daily.apk
# Render free = 512Mi total. Hard-cap heap/metaspace so native+threads stay under the limit.
# SerialGC uses less overhead than G1 on tiny heaps. (MaxRAMPercentage alone still OOMs.)
ENV JAVA_TOOL_OPTIONS="-Xms48m -Xmx180m -XX:MaxMetaspaceSize=96m -XX:ReservedCodeCacheSize=40m -Xss256k -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
