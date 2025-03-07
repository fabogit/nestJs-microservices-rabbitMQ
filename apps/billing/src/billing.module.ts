import { Module } from '@nestjs/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_BILLING_QUEUE: Joi.string().required(),
      }),
    }),
    RmqModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
