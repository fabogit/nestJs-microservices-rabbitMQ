import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

/**
 * Mongoose schema definition for the `User` document.
 * This schema defines the structure and properties of `User` documents stored in MongoDB.
 * It extends `AbstractDocument` to inherit common fields.
 * @Schema({ versionKey: false }) Decorator that defines this class as a Mongoose schema and disables the version key (__v) in documents.
 */
@Schema({ versionKey: false })
export class User extends AbstractDocument {
  /**
   * Email address of the user.
   * @Prop() Decorator that defines this property as a field in the Mongoose schema.
   * @type {string}
   */
  @Prop()
  email: string;

  /**
   * Password of the user.
   * @Prop() Decorator that defines this property as a field in the Mongoose schema.
   * @type {string}
   */
  @Prop()
  password: string;
}

/**
 * Mongoose `SchemaFactory` for the `User` class.
 * Creates a Mongoose Schema object based on the `User` class definition.
 * This schema is then used by `MongooseModule` to define models and interact with the database.
 * @SchemaFactory.createForClass(User) Static method that generates a Mongoose Schema from the `User` class.
 */
export const UserSchema = SchemaFactory.createForClass(User);
