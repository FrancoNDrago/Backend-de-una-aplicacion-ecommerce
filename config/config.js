import dotenv from "dotenv";
import options from "../process.js";

dotenv.config({
    path: options.mode.toUpperCase()==="DEVELOPMENT" ? "./.env.development":"./.env.production"
});

export default {
    mode: options.mode.toUpperCase(),
    debug: options.d,

    host: process.env.HOST,
    port: options.p || process.env.PORT,
    login_strategy: process.env.LOGIN_STRATEGY,
    persistance_engine: (options.persistance) ? options.persistance : process.env.PERSISTANCE_ENGINE,
    
    users_expiration_offset: process.env.USERS_EXPIRATION_OFFSET || 2,
    users_expiration_unit: process.env.USERS_EXPIRATION_UNIT || "days",
    
    session_secret: process.env.SESSION_SECRET,
    
    mongo_url: process.env.MONGO_URL,

    gitHub_AppId: process.env.GITHUB_APP_ID,
    gitHub_ClientId: process.env.GITHUB_CLIENT_ID,
    gitHub_ClientSecret: process.env.GITHUB_CLIENT_SECRET,
    gitHub_CallbackURL: process.env.GITHUB_CALLBACK_URL,

    jwt_private_key: process.env.JWT_PRIVATE_KEY,

    google_app_password: process.env.GOOGLE_APP_PASSWORD,

    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_sms_number: process.env.TWILIO_SMS_NUMBER,

    stripe_public_key: process.env.STRIPE_PUBLIC_KEY,
    stripe_private_key: process.env.STRIPE_PRIVATE_KEY
}