FROM eclipse-temurin:17-jdk-alpine

# Diretório de trabalho
WORKDIR /app

# Copia todo o código-fonte
COPY . .

# Dá permissão de execução ao Maven Wrapper
RUN chmod +x ./mvnw

# Constrói o projeto (ignora testes para build mais rápido)
RUN ./mvnw clean package -DskipTests

# Expõe a porta da aplicação
EXPOSE 8080

# Executa o JAR gerado
CMD ["java", "-jar", "target/Link&Live-0.0.1-SNAPSHOT.jar"]
