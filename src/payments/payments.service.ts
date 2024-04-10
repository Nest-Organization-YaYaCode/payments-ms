import { Inject, Injectable } from '@nestjs/common';
import { envs, NATS_SERVICES } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.STRIPE_SECRET);

    constructor(
        @Inject(NATS_SERVICES)
        private readonly client: ClientProxy
    ) {}


    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map(item => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
            // colocar el ID de la orden
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${envs.CLIENT_URL}/payments/success`,
            cancel_url: `${envs.CLIENT_URL}/payments/cancel`,
        });

        // return session;
        return {
            cancel_url: session.cancel_url,
            success_url: session.success_url,
            url: session.url,
        }
    }

    webhookStripe(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, envs.STRIPE_WEBHOOK_SECRET);
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
        }

        switch (event.type) {
            case 'charge.succeeded':
                const charge = event.data.object as Stripe.Charge;
                const payload = {
                    stripePaymentId: charge.id,
                    orderId: charge.metadata.orderId,
                    receiptUrl: charge.receipt_url,
                }
                // console.log('charge.succeeded', payload);
                this.client.emit('payment.succeeded', payload);

                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }

}
