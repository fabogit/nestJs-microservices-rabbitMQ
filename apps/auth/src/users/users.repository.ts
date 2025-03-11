import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { User } from './models/user.schema';

/**
 * Injectable repository for managing `User` entities in MongoDB.
 * Extends the `AbstractRepository` to inherit common database operations, specialized for the `User` model.
 * This repository provides data access methods specifically for interacting with the 'users' collection in the database.
 */
@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  /**
   * Logger instance for UsersRepository, used for logging repository operations and potential issues.
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(UsersRepository.name);

  /**
   * Constructor for `UsersRepository`.
   * @param {Model<User>} userModel - Injected Mongoose model for the `User` entity.
   *        This model is used to perform database operations on the 'users' collection.
   *        @InjectModel(User.name) - Inject decorator to obtain the `User` model from the Mongoose module.
   * @param {Connection} connection - Injected Mongoose connection.
   *        Provides the database connection instance for transaction management and other connection-level operations.
   *        @InjectConnection() - Inject decorator to obtain the default Mongoose connection.
   */
  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
