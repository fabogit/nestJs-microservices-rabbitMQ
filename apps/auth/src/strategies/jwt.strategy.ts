import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Types } from 'mongoose';
import { TokenPayload } from '../auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.schema';

/**
 * Injectable service implementing the Passport JWT Strategy for authentication.
 * This strategy is responsible for verifying JWT tokens and ensuring that requests are authenticated.
 * It extends `PassportStrategy(Strategy)` from `@nestjs/passport` and `passport-jwt`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for `JwtStrategy`.
   * @param {ConfigService} configService - Injected `ConfigService` instance.
   *        Used to access application configuration, specifically the JWT secret key.
   * @param {UsersService} usersService - Injected `UsersService` instance.
   *        Used to retrieve user information based on the userId extracted from the JWT payload.
   */
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      /**
       * Configures how the JWT is extracted from the incoming `request`.
       * Here, it uses an extractor function that looks for the JWT in the 'Authentication' cookie.
       * `ExtractJwt.fromExtractors` - Creates an extractor that tries multiple extractors in order.
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          // Extracts the JWT from the 'Authentication' cookie of the request. Added by libs/common/src/auth/jwt-auth.guard
          return request?.Authentication;
        },
      ]),
      /**
       * Specifies the secret key used to verify the JWT signature.
       * The `secretOrKey` is obtained from the application configuration via `ConfigService`.
       * This key must match the secret used to sign the JWT.
       */
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload.
   * This method is automatically called by Passport after verifying the JWT signature and decoding the payload.
   * It receives the decoded JWT payload and uses the `userId` from the payload to fetch the user from the `UsersService`.
   * @async
   * @param {TokenPayload} payload - The decoded JWT payload. It should contain a 'userId' property as defined in TokenPayload interface.
   * @returns {Promise<User>} A Promise that resolves to the user object if the user is found and authentication is successful.
   * @throws {UnauthorizedException} If the user cannot be found or any other error occurs during user retrieval, indicating invalid JWT or user.
   */
  async validate({ userId }: TokenPayload): Promise<User> {
    try {
      const user = await this.usersService.getUser({
        _id: new Types.ObjectId(userId),
      });
      return user;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
