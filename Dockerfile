# syntax=docker/dockerfile:1
FROM node:22-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY src/ src/
COPY --from=frontend-build /workspace/src/main/resources/static/app/ src/main/resources/static/app/
RUN ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S linklive && adduser -S linklive -G linklive
COPY --from=backend-build /workspace/target/LnL-0.0.1-SNAPSHOT.jar app.jar
USER linklive
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
