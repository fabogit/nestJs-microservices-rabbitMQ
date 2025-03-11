import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a new user.
 * This class defines the structure and validation rules for the request body
 * expected when creating a user, typically used in user registration endpoints.
 * It uses class-validator decorators to enforce constraints on the input data.
 */
export class CreateUserReq {
  /**
   * Email address of the user.
   * @IsEmail() Decorator that validates if the provided value is a valid email address format.
   * @type {string}
   */
  @IsEmail()
  email: string;

  /**
   * Password for the user account.
   * @IsString() Decorator that validates if the provided value is a string.
   * @IsNotEmpty() Decorator that validates if the string is not empty.
   * These decorators ensure that the password is provided and is of the correct type.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
