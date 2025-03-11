import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RmqModule, DatabaseModule } from '@app/common';
import * as Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from './users/users.module';

/**
 * Module for authentication functionalities within the application.
 * This module orchestrates user authentication, JWT handling, and integrates with other modules like database and messaging.
 * It configures environment variables, JWT module, database connection, and registers authentication strategies and services.
 * @exports {AuthModule} Exports the `AuthModule` class, making it available for import in other modules.
 */
@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    RmqModule,
    ConfigModule.forRoot({
      // Configures the ConfigModule as a global module to manage environment variables.
      isGlobal: true,
      validationSchema: Joi.object({
        // Defines a Joi validation schema to ensure required environment variables are set and of the correct type.
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    JwtModule.registerAsync({
      // Configures the JwtModule asynchronously to handle JWT signing and verification, using configuration from ConfigService.
      useFactory: (configService: ConfigService) => ({
        // Factory function to create the JwtModule options asynchronously.
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // Sets the JWT expiration time based on the JWT_EXPIRATION environment variable (appended with 's' for seconds).
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      // Injects the ConfigService into the factory function to access application configuration.
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
