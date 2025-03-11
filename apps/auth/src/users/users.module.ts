import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

/**
 * Module for managing user-related functionalities within the application.
 * This module is responsible for encapsulating user account management, including user creation, retrieval, and validation.
 * It configures Mongoose for database interaction with the `User` entity, sets up controllers for API endpoints,
 * and provides services and repositories for business logic and data access.
 * @exports {UsersModule} Exports the `UsersModule` class, making it available for import in other modules.
 * @exports {UsersService} Exports the `UsersService` class, allowing other modules to utilize user-related functionalities.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
