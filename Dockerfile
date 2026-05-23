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

# Stage 3: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D -u 1000 appuser
USER appuser
COPY --from=build /app/target/ItOfficerHub-*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-jar", "app.jar"]
