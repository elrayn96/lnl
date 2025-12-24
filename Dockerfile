FROM eclipse-temurin:17-jdk-alpine

# Diretório de trabalho
WORKDIR /app

# Copia todo o código
COPY . .

# Dá permissão de execução ao mvnw
RUN chmod +x ./mvnw

# Constrói o projeto (ignora testes)
RUN ./mvnw clean package -DskipTests

# Expõe a porta
EXPOSE 8080

# Executa o JAR correto (nome real gerado pelo Maven)
CMD ["java", "-jar", "target/LnL-0.0.1-SNAPSHOT.jar"]
