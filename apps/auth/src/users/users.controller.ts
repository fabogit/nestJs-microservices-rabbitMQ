import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserReq } from './dto/create-user.req';
import { UsersService } from './users.service';
import { User } from './models/user.schema';

/**
 * Controller for handling user-related actions within the authentication context.
 * This controller is responsible for managing user registration and potentially other user management tasks
 * specifically within the authentication domain, under the `/auth/users` route.
 * @Controller('auth/users') Sets the base route for this controller to `/auth/users`.
 */
@Controller('auth/users')
export class UsersController {
  /**
   * Constructor for `UsersController`.
   * @param {UsersService} usersService - Injected `UsersService` instance.
   *        Provides the business logic for user-related operations like user creation.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint to create a new user.
   * @Post() Defines this method as handling POST requests to '/auth/users'.
   * @Body() `request` - Data transfer object in the `request` body containing user creation details.
   *        The `CreateUserReq` DTO is used to validate and structure the incoming user creation `request` data.
   * @returns {Promise<User>} A Promise that resolves to the newly created `User` object.
   */
  @Post()
  async createUser(@Body() request: CreateUserReq): Promise<User> {
    return this.usersService.createUser(request);
  }
}
