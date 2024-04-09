import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.STRIPE_SECRET);


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

        return session;
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
                console.log('Payment was successful', event);
                console.log('metadata', event.data.object.metadata);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }

}
