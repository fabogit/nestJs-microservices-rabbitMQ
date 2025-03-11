import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AUTH_SERVICE } from '../constants/services';
import { RmqModule } from '../rmq/rmq.module';

/**
 * Module for Authentication functionalities, focused on client-side (e.g., cookie) JWT handling.
 * This module is designed to manage aspects of authentication that are client-facing, such as parsing cookies
 * to extract JWTs. It integrates with the `RmqModule` for inter-service communication related to authentication.
 *
 * @exports {AuthModule} Exports the `AuthModule` class, making it available for import in other modules.
 * @implements {NestModule} Implements the NestJS {@link NestModule} interface to configure middleware for the module.
 */
@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  exports: [RmqModule],
})
export class AuthModule implements NestModule {
  /**
   * Configures middleware for the `AuthModule`.
   * This method is part of the {@link NestModule} interface and is called by NestJS during module initialization.
   * It's used here to apply the `cookieParser` middleware to all routes within the application, enabling cookie parsing.
   * @param {MiddlewareConsumer} consumer - The middleware consumer object, used to configure middleware.
   * @returns {void}
   * @implements {NestModule}
   */
  configure(consumer: MiddlewareConsumer): void {
    // Apply cookieParser middleware globally for all routes ('*').
    // `cookieParser()` middleware parses cookies attached to the client request and populates the `req.cookies` property with an object keyed by cookie names.
    // This is essential for handling JWTs that are often stored in HTTP cookies for web-based authentication.
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
