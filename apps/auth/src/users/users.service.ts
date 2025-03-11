import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserReq } from './dto/create-user.req';
import { User } from './models/user.schema';

/**
 * Injectable service for managing user accounts and authentication.
 * This service is responsible for user creation, email validation during registration,
 * password hashing, and user validation during login. It interacts with the `UsersRepository`
 * to persist and retrieve user data from the database.
 */
@Injectable()
export class UsersService {
  /**
   * Constructor for `UsersService`.
   * @param {UsersRepository} usersRepository - Injected `UsersRepository` instance.
   *        Provides data access methods for User entities, abstracting database interactions.
   */
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Creates a new user account.
   * This method first validates the user creation request to ensure the `email` is not already registered.
   * Then, it hashes the user's password using bcrypt before creating the user record in the database.
   * @async
   * @param {CreateUserReq} request - Data transfer object containing user registration details (email, password, etc.).
   * @returns {Promise<User>} A Promise that resolves to the newly created `User` object.
   * @throws {UnprocessableEntityException} If a user with the provided `email` already exists.
   */
  async createUser(request: CreateUserReq): Promise<User> {
    await this.validateCreateUserRequest(request);
    const user = await this.usersRepository.create({
      ...request,
      // Hash the password before saving to the database
      password: await bcrypt.hash(request.password, 10),
    });
    return user;
  }

  /**
   * Validates the user creation request to prevent duplicate email registration.
   * It checks if a user with the given `email` already exists in the database.
   * @private
   * @async
   * @param {CreateUserReq} request - The user creation request object containing the `email` to validate.
   * @returns {Promise<void>} A Promise that resolves if the `email` is unique.
   * @throws {UnprocessableEntityException} If a user with the provided `email` already exists, indicating `email` duplication.
   */
  private async validateCreateUserRequest(
    request: CreateUserReq,
  ): Promise<void> {
    let user: User;
    try {
      user = await this.usersRepository.findOne({
        email: request.email,
      });
    } catch (err) {
      // Error during database lookup is ignored, treat as user not found initially
    }

    if (user) {
      // If a user with the email is found, it means the email is already taken
      throw new UnprocessableEntityException('Email already exists.');
    }
  }

  /**
   * Validates user credentials (email and password) for login.
   * This method retrieves a user by `email` and then compares the provided `password` with the stored hashed password using bcrypt.
   * @async
   * @param {string} email - The `email` address of the user attempting to log in.
   * @param {string} password - The `password` provided by the user for login.
   * @returns {Promise<User>} A Promise that resolves to the User object if credentials are valid.
   * @throws {UnauthorizedException} If the provided `password` does not match the stored hashed password or if the user is not found.
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  /**
   * Retrieves a user from the database based on partial user information.
   * This method allows fetching a `User` document using any properties of the `User` entity as a filter.
   * @async
   * @param {Partial<User>} getUserArgs - Partial User object used as a filter to find a user (e.g., can be used to find by ID or email).
   * @returns {Promise<User>} A Promise that resolves to the User object matching the provided arguments, or undefined if not found.
   */
  async getUser(getUserArgs: Partial<User>): Promise<User> {
    return this.usersRepository.findOne(getUserArgs);
  }
}
