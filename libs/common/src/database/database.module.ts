import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

/**
 * Module for configuring and establishing a database connection using Mongoose.
 * This module sets up the Mongoose module asynchronously, allowing for database connection configuration to be dynamically sourced from environment variables via `ConfigService`.
 * @exports {DatabaseModule} Exports the `DatabaseModule` class, making it available for import in other modules that require database access.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      /**
       * Asynchronous factory function to create Mongoose connection options.
       * This factory is used to dynamically configure the Mongoose connection, leveraging the `ConfigService` to retrieve the MongoDB connection URI from the application's configuration.
       * @param {ConfigService} configService - Injected `ConfigService` instance.
       * @returns An object containing the Mongoose connection options, specifically the MongoDB URI.
       */
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      /**
       * Inject `ConfigService` to be used within the `useFactory` function.
       * This makes the `ConfigService` instance available for accessing configuration values needed to set up the Mongoose connection.
       */
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
