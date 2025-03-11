import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices';
import { QUEUE_AUTH, RmqService } from '@app/common';
import { AuthModule } from './auth.module';

/**
 * Bootstraps the NestJS application, setting up both an HTTP server and a RabbitMQ microservice listener.
 * This function is the entry point for the `AuthModule` application, configuring it as a hybrid application capable of handling both HTTP requests and RabbitMQ messages.
 * It initializes the NestJS application, connects a RabbitMQ microservice, sets up global validation, and starts both the microservice and HTTP server.
 * @async
 * @returns A Promise that resolves when the application has started listening on both HTTP and RabbitMQ, or rejects if an error occurs during startup.
 * @throws If any error occurs during application creation or startup, it will be caught and logged to the console.
 */
async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  // Retrieve the RmqService instance from the application context to access RabbitMQ configuration utilities.
  const rmqService = app.get<RmqService>(RmqService);
  // Connect the application as a RabbitMQ microservice listener using configurations provided by RmqService.
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(QUEUE_AUTH, true));
  // Apply a global ValidationPipe to the application. This pipe automatically validates all incoming requests across the application based on DTO validation rules.
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  // Start the RabbitMQ microservice listener.
  await app.startAllMicroservices();
  // Start the HTTP server and listen for incoming HTTP requests on the port specified in the application configuration.
  await app.listen(configService.get('PORT'));
}
bootstrap().catch((err) => console.error(err));
