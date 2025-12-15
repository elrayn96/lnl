FROM eclipse-temurin:17-jdk-alpine

# Diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia tudo para o contêiner
COPY . .

# Constrói o projeto com Maven Wrapper
RUN ./mvnw clean package -DskipTests

# Expõe a porta
EXPOSE 8080

# Comando de execução
CMD ["java", "-jar", "target/Link&Live-0.0.1-SNAPSHOT.jar"]