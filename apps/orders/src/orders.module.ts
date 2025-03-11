import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import {
  AuthModule,
  BILLING_SERVICE,
  DatabaseModule,
  RmqModule,
} from '@app/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { Order, OrderSchema } from './models/order.schema';

/**
 * Module for managing orders within the application.
 * This module aggregates functionalities related to order creation, retrieval, and processing.
 * It configures auth guards for jwt, database interaction, RabbitMQ communication for billing, and input validation via Joi.
 * @exports {OrdersModule} Exports the `OrdersModule` class, making it available for import in other modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Defines validation schema for environment variables using Joi
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/orders/.env',
    }),
    // Common module to handle jwt cookies
    AuthModule,
    DatabaseModule,
    // Registers Mongoose module for the Order entity and schema
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    // Registers RmqModule for RabbitMQ communication with the billing service
    RmqModule.register({ name: BILLING_SERVICE }),
  ],
  controllers: [OrdersController],
  // Declares the OrdersService and OrdersRepository to provide business logic and data access for orders
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
