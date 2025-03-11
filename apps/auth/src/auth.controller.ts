import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './users/models/user.schema';
import { USER_VALIDATE } from '@app/common';

/**
 * Controller for handling authentication-related endpoints.
 * This controller manages user authentication processes such as login and user validation,
 * utilizing local and JWT strategies for authentication and guards to protect endpoints.
 * @Controller('auth') Sets the base route for this controller to `/auth`.
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor for `AuthController`.
   * @param {AuthService} authService - Injected `AuthService` instance.
   *        Provides the core authentication logic, including login and JWT handling.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint for user login.
   * This endpoint is protected by the `LocalAuthGuard`, which authenticates users based on local strategy (username/password).
   * Upon successful local authentication, it calls the `authService.login` method to generate and set an authentication cookie.
   * @UseGuards(LocalAuthGuard) Decorator that applies the `LocalAuthGuard` to this endpoint, enforcing local authentication.
   * @Post('login') Decorator that maps this method to handle POST requests to `/auth/login`.
   * @param {User} user - The authenticated `User` object, injected by the `CurrentUser` decorator after successful authentication by `LocalAuthGuard`.
   * @CurrentUser() Decorator that injects the currently authenticated user object into the parameter.
   * @param {Response} response - The Express `Response` object, used to set the authentication cookie.
   * @Res({ passthrough: true }) Decorator that injects the `Response` object and allows the controller method to handle `response` processing and bypass default NestJS `response` handling.
   * @async
   * @returns A Promise that resolves to the authenticated `User` object, which is also sent as the `response` body.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    response.send(user);
  }

  /**
   * Message pattern endpoint for validating a user via JWT.
   * This endpoint is protected by the `JwtAuthGuard`, which verifies the JWT token from the request.
   * It is designed to be used as a microservice endpoint, listening for `validate_user` messages.
   * Upon successful JWT validation, it returns the authenticated user.
   * @UseGuards(JwtAuthGuard) Decorator that applies the `JwtAuthGuard` to this endpoint, enforcing JWT-based authentication.
   * @MessagePattern('validate_user') Decorator that makes this method a microservice endpoint, listening for messages with the pattern 'validate_user'.
   * @param {User} user - The authenticated `User` object, injected by the `CurrentUser` decorator after successful JWT validation by `JwtAuthGuard`.
   * @CurrentUser() Decorator that injects the currently authenticated `user` object into the parameter.
   * @returns {Promise<User>} A Promise that resolves to the validated `User` object.
   */
  @UseGuards(JwtAuthGuard)
  @MessagePattern(USER_VALIDATE)
  async validateUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
