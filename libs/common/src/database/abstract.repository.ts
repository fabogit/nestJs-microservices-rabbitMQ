import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

/**
 * Abstract base repository class providing common database operations.
 * This class is intended to be extended by concrete repositories for specific Mongoose models.
 * It encapsulates common CRUD operations and transaction management, promoting code reuse and consistency.
 *
 * @typeparam TDocument The Mongoose document type that extends AbstractDocument.
 */
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  /**
   * Abstract logger instance. Must be initialized in the concrete repository class.
   * @protected
   * @abstract
   * @readonly
   * @type {Logger}
   */
  protected abstract readonly logger: Logger;

  /**
   * Constructor for the AbstractRepository class.
   * @param {Model<TDocument>} model The Mongoose model associated with the document type.
   * @param {Connection} connection The Mongoose connection to be used for database operations.
   */
  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  /**
   * Creates a new document in the database.
   * @async
   * @param {Omit<TDocument, '_id'>} document The document data to be created, excluding the '_id' field which is auto-generated.
   * @param {SaveOptions} [options] Optional save options to be passed to Mongoose save method.
   * @returns {Promise<TDocument>} A Promise that resolves to the newly created document.
   */
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(), // Generate a new ObjectId for the document
    });
    return (await createdDocument.save(options)) // Save the document to the database
      .toJSON() as unknown as TDocument; // Convert Mongoose document to plain JSON object and assert type
  }

  /**
   * Finds a single document in the database based on the provided filter query.
   * @async
   * @param {FilterQuery<TDocument>} filterQuery The filter query to select the document.
   * @returns {Promise<TDocument>} A Promise that resolves to the found document.
   * @throws {NotFoundException} If no document is found matching the filter query.
   */
  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true }); // Find one document matching the query, return plain JavaScript object

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery); // Log a warning if document is not found
      throw new NotFoundException('Document not found.'); // Throw NotFoundException if document is not found
    }

    return document; // Return the found document
  }

  /**
   * Finds a single document and updates it based on the provided filter query and update data.
   * @async
   * @param {FilterQuery<TDocument>} filterQuery The filter query to select the document to update.
   * @param {UpdateQuery<TDocument>} update The update operations to apply to the document.
   * @returns {Promise<TDocument>} A Promise that resolves to the updated document.
   * @throws {NotFoundException} If no document is found matching the filter query.
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true, // Return plain JavaScript object
      new: true, // Return the modified document rather than the original
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery); // Log a warning if document is not found
      throw new NotFoundException('Document not found.'); // Throw NotFoundException if document is not found
    }

    return document; // Return the updated document
  }

  /**
   * Updates or inserts a document based on the filter query.
   * If a document matching the filter query exists, it's updated; otherwise, a new document is inserted.
   * @async
   * @param {FilterQuery<TDocument>} filterQuery The filter query to determine if a document exists for update or insertion.
   * @param {Partial<TDocument>} document The document data to update or insert.
   * @returns {Promise<TDocument>} A Promise that resolves to the updated or inserted document.
   */
  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true, // Return plain JavaScript object
      upsert: true, // Enable upsert option (insert if not found)
      new: true, // Return the modified document after update/insert
    });
  }

  /**
   * Finds multiple documents based on the provided filter query.
   * @async
   * @param {FilterQuery<TDocument>} filterQuery The filter query to select documents.
   * @returns {Promise<TDocument[]>} A Promise that resolves to an array of found documents.
   */
  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true }); // Find documents matching the query, return plain JavaScript objects
  }

  /**
   * Starts a new Mongoose transaction.
   * @async
   * @returns {Promise<ClientSession>} A Promise that resolves to a ClientSession object, representing the started transaction.
   */
  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession(); // Start a new session
    session.startTransaction(); // Start a transaction within the session
    return session; // Return the session object
  }
}
