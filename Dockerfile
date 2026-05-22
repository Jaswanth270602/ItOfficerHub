# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
COPY src src
RUN ./mvnw -q package -DskipTests -Dskip.frontend.build=false

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D -u 1000 appuser
USER appuser
COPY --from=build /app/target/ItOfficerHub-*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-jar", "app.jar"]
