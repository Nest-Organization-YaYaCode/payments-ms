import 'dotenv/config';
import * as joi from 'joi';

interface IEnv {
    PORT: number;
    STRIPE_SECRET: string;
    CLIENT_URL: string;
    STRIPE_WEBHOOK_SECRET: string;
    NATS_SERVICE_URL: string[];
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    CLIENT_URL: joi.string().required(),
    STRIPE_WEBHOOK_SECRET: joi.string().required(),
    NATS_SERVICE_URL: joi.array().items(joi.string()).required(),
}).unknown(true);

const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVICE_URL: process.env.NATS_SERVICE_URL?.split(','),
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envsVars: IEnv = value;

export const envs = {
    PORT: envsVars.PORT,
    STRIPE_SECRET: envsVars.STRIPE_SECRET,
    CLIENT_URL: envsVars.CLIENT_URL,
    STRIPE_WEBHOOK_SECRET: envsVars.STRIPE_WEBHOOK_SECRET,
    NATS_SERVICE_URL: envsVars.NATS_SERVICE_URL,
}
