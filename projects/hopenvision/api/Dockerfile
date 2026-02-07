# === Build stage ===
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

# Copy Gradle wrapper and build files first (for layer caching)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew \
    && sed -i "s/DEFAULT_JVM_OPTS='.*'/DEFAULT_JVM_OPTS='-Xmx64m -Xms64m'/" ./gradlew

# Download dependencies (cached layer if build.gradle unchanged)
RUN ./gradlew dependencies --no-daemon || true

# Copy source and build
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

# === Runtime stage ===
FROM eclipse-temurin:17-jre
WORKDIR /app

ENV TZ=Asia/Seoul

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=builder /app/build/libs/hopenvision-api-0.0.1-SNAPSHOT.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
