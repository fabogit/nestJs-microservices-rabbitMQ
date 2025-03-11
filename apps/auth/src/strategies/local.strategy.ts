import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';

/**
 * Injectable service implementing the Passport Local Strategy for authentication.
 * This strategy is responsible for validating user credentials (username and password)
 * against a user database, typically for handling traditional username/password login scenarios.
 * It extends `PassportStrategy(Strategy)` from `@nestjs/passport` and `passport-local`.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for `LocalStrategy`.
   * @param {UsersService} usersService - Injected UsersService instance.
   *        This service is used to validate user credentials against the user database.
   *        It is expected to have a method like `validateUser` that checks if the provided email and password are valid.
   */
  constructor(private readonly usersService: UsersService) {
    // Configures the strategy to use 'email' as the username field instead of the default 'username'.
    super({ usernameField: 'email' });
  }

  /**
   * Validates the user credentials provided during authentication.
   * This method is automatically called by Passport when the local strategy is used.
   * It receives the `username` (which is 'email' as configured) and `password` from the authentication request.
   * It then delegates the actual validation to the `usersService.validateUser` method.
   * @async
   * @param  email - The `email` address provided by the user during login (used as `username` field).
   * @param  password - The `password` provided by the user during login.
   * @returns A Promise that resolves to the user object if credentials are valid.
   * If validation fails, it should throw an exception (e.g., `UnauthorizedException`), which Passport will handle.
   */
  async validate(email: string, password: string) {
    return this.usersService.validateUser(email, password);
  }
}
