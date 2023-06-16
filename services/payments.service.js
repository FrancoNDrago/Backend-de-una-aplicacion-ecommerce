import Stripe from 'stripe';

import CartService from './carts.service.js';
import config from '../config/config.js';

class PaymentService{
    constructor(){
        this.paymentPlatform = new Stripe(config.stripe_private_key);
        this.cartService = new CartService();
    }

    async createPaymentIntentFromCart(cartId){
        const cart = await this.cartService.getCart(cartId, true);
     
        const paymentIntentInfo = {
            amount: 0,
            currency: 'usd',
            metadata:{
                userId: "ID DE MONGO",
                orderDetail: JSON.stringify({
                    producto: cantidad
                }, null, '\t'),
                address: JSON.stringify({
                    street: "Calle falsa",
                    postalCode: "8400",
                    externalNumber: "123"
                }, null, '\t')
            }
        }

        cart.products.forEach(product=>{
            paymentIntentInfo.amount += product.product.price;
        })

        return this.paymentPlatform.paymentIntents.create(paymentIntentInfo);
    }
}

export default PaymentService;