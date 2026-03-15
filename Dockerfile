FROM openjdk:21-jdk
WORKDIR /app
COPY target/budget-service.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
