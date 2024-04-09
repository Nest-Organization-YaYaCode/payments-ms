import 'dotenv/config';
import * as joi from 'joi';

interface IEnv {
    PORT: number;
    STRIPE_SECRET: string;
    CLIENT_URL: string;
    STRIPE_WEBHOOK_SECRET: string;
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    CLIENT_URL: joi.string().required(),
    STRIPE_WEBHOOK_SECRET: joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envsVars: IEnv = value;

export const envs = {
    PORT: envsVars.PORT,
    STRIPE_SECRET: envsVars.STRIPE_SECRET,
    CLIENT_URL: envsVars.CLIENT_URL,
    STRIPE_WEBHOOK_SECRET: envsVars.STRIPE_WEBHOOK_SECRET,
}
