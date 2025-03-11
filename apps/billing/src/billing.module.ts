import { Module } from '@nestjs/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from '@app/common';

/**
 * Module for handling billing functionalities within the application.
 * This module is responsible for configuring the billing microservice, including environment variable validation,
 * integration with authentication services, and setting up RabbitMQ for message queue communication.
 * It aggregates controllers and services related to billing processes.
 * @exports {BillingModule} Exports the `BillingModule` class, making it available for import in other modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_BILLING_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/billing/.env',
    }),
    AuthModule,
    RmqModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
