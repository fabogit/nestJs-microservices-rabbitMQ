import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { USER_VALIDATE } from '../constants/events';
import { AUTH_SERVICE } from '../constants/services';

/**
 * Injectable guard implementing JWT (JSON Web Token) based authentication for NestJS applications.
 * This guard is designed to protect both HTTP endpoints and microservice RPC endpoints by verifying the validity of a JWT.
 * It utilizes a microservice client (`ClientProxy`) to communicate with an authentication service (`AUTH_SERVICE`) for token validation.
 *
 * @implements {CanActivate} Implements the NestJS {@link CanActivate} interface, allowing it to act as a route guard.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Constructor for `JwtAuthGuard`.
   * @param {ClientProxy} authClient - Injected `ClientProxy` for the `AUTH_SERVICE` microservice.
   *        This client is used to send a message to the authentication service to validate the JWT.
   *        @Inject(AUTH_SERVICE) - Inject decorator to obtain the `ClientProxy` configured for `AUTH_SERVICE` from dependency injection.
   */
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  /**
   * Determines whether the current request is authorized to access the route.
   * This method is the core of the guard. It extracts the JWT from the execution `context` (either HTTP request cookies or RPC data),
   * sends it to the authentication service for validation, and handles the response.
   *
   * @param {ExecutionContext} context The execution context provided by NestJS, containing details about the current request and handler.
   * @returns {boolean | Promise<boolean> | Observable<boolean>}
   *          - `true` if the request is authorized (JWT is valid and user is authenticated).
   *          - `false` or an Observable/Promise that resolves to `false` if the request is unauthorized.
   *          - An Observable that emits `true` or `false` upon JWT validation completion from the AUTH_SERVICE.
   * @throws {UnauthorizedException} If the JWT is invalid or not provided, or if the authentication service indicates that the token is invalid.
   *
   * **Workflow:**
   * 1. **Extract JWT:** Calls {@link getAuthentication} to extract the JWT from the context (either from HTTP cookies or RPC data).
   * 2. **Send for Validation:** Uses the injected `authClient` to send a 'USER_VALIDATE' message to the AUTH_SERVICE microservice, including the JWT as payload.
   * 3. **Handle Response:**
   *    - **Success (tap):** On successful validation by the AUTH_SERVICE, the response (user information) is added to the execution context using {@link addUser}, making it available to route handlers via `@CurrentUser()` decorator.
   *    - **Error (catchError):** If the AUTH_SERVICE returns an error (e.g., JWT invalid, user not found), it catches the error and throws an {@link UnauthorizedException}, denying access to the route.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authenticationJwt = this.getAuthentication(context); // Extract JWT from the context
    return this.authClient
      .send(USER_VALIDATE, {
        // Send 'USER_VALIDATE' message to AUTH_SERVICE with JWT payload
        Authentication: authenticationJwt,
      })
      .pipe(
        tap((response) => {
          // On successful validation response from AUTH_SERVICE
          this.addUser(response, context);
        }),
        catchError(() => {
          // On error response from AUTH_SERVICE (JWT invalid or validation failed)
          throw new UnauthorizedException();
        }),
      );
  }

  /**
   * Extracts the JWT from the execution `context` based on the type (HTTP or RPC).
   * For HTTP requests, it looks for the JWT in the 'Authentication' cookie.
   * For RPC requests, it looks for the JWT in the `data` payload under the 'Authentication' key.
   *
   * @private
   * @param {ExecutionContext} context The execution context.
   * @returns {string} The extracted JWT string.
   * @throws {UnauthorizedException} If no JWT is found in the appropriate location for the context type.
   */
  private getAuthentication(context: ExecutionContext): string {
    let authentication: string;
    if (context.getType() === 'rpc') {
      // For RPC context, extract JWT from data payload
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      // For HTTP context, extract JWT from cookies
      authentication = context.switchToHttp().getRequest()
        .cookies?.Authentication;
    }
    if (!authentication) {
      // If no JWT found in either context, throw UnauthorizedException
      throw new UnauthorizedException('No value provided for Authentication');
    }
    return authentication; // Return the extracted JWT
  }

  /**
   * Adds the `user` object (received from the authentication service) to the execution `context`.
   * This makes the authenticated user available for injection into route handlers using the `@CurrentUser()` decorator.
   * The `user` object is added to either the HTTP requ`est object or the RPC `data` object, depending on the `context` type.
   *
   * @private
   * @param {any} user The `user` object received from the authentication service upon successful JWT validation.
   * @param {ExecutionContext} context The execution `context`.
   * @returns {void}
   */
  private addUser(user: any, context: ExecutionContext): void {
    if (context.getType() === 'rpc') {
      // For RPC context, add user to the data payload
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      // For HTTP context, add user to the request object
      context.switchToHttp().getRequest().user = user;
    }
  }
}
