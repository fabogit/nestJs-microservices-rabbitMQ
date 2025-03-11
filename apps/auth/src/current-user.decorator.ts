import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './users/models/user.schema';

/**
 * Helper function to extract the current `user` object from the execution `context`.
 * This function checks the `context` type (HTTP or RPC) and retrieves the `user` object accordingly.
 * It is designed to be used internally by the `CurrentUser` decorator but can also be used directly if needed.
 * @param {ExecutionContext} context The execution `context` provided by NestJS, representing the current execution environment.
 * @returns {User} The `User` object representing the current `user`, if available in the `context`. Returns `undefined` if not found or in an unsupported `context` type.
 * It assumes that the user object is attached to the request object in HTTP context (e.g., by authentication guards) or in the data object for RPC context.
 */
export const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
  if (context.getType() === 'rpc') {
    return context.switchToRpc().getData().user;
  }
  // If the context type is not HTTP or RPC, return undefined as user context cannot be determined.
  return undefined;
};

/**
 * Custom parameter decorator to inject the current `user` into route handler parameters.
 * This decorator leverages the `getCurrentUserByContext` function to retrieve the current user from the execution `context`
 * and injects it as a parameter in controllers or resolvers. It works for both HTTP and RPC contexts.
 * @CurrentUser() Decorator to be used on handler method parameters to inject the current `user`.
 * @returns {ParameterDecorator} A parameter decorator function that can be applied to handler method parameters.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
