import { faker } from '@faker-js/faker/locale/es';

import ProductController from "../../controllers/products.controller.js";
import CartDTO from '../../dtos/response/cart.res.dto.js';
import CartDTOReq from '../../dtos/request/cart.req.dto.js';
import CartProductDTO from '../../dtos/cartProduct.dto.js';
import { generateProduct } from "./products.mock.js";

const productController = new ProductController();

export const generateCartProduct = ()=>{
    return new CartProductDTO({
        product:generateProduct(),
        quantity: faker.number.int({min: 1, max: 500})
    })
}

export const generateCartproducts = qty=>{
    let cartProducts = [];

    for (let i = 0; i < qty; i++) {
        cartProducts.push(generateCartProduct());
    }

    return cartProducts;
}

export const generateCart = ()=>{
    return new CartDTO({
        _id: faker.string.alphanumeric(10),
        products: generateCartproducts(Math.random()*20)
    })
}

export const generateCarts = qty=>{
    let carts = [];

    for (let i = 0; i < qty; i++) {
        carts.push(generateCart());
    }

    return carts;
}


export const generateCartProductForReq = async ()=>{
    const products = await productController.getProducts({limit:1000});
    const productsId = products.products.map(product=>String(product._id))

    return new CartProductDTO({
        product:productsId[Math.floor(Math.random()*productsId.length)],
        quantity: faker.number.int({min: 0, max:20})
    })
}

export const generateCartproductsForReq = async (qty=10)=>{
    let cartProducts = [];

    for (let i = 0; i < qty; i++) {
        let exist = false;
        let productToAdd = await generateCartProductForReq();
        
        cartProducts.forEach((product, index)=>{
            if(product.product === productToAdd.product){
                exist = index;
            }
        })

        if(!!exist){
            cartProducts[exist].quantity += productToAdd.quantity;
        }else{
            cartProducts.push(productToAdd);
        }
    }

    return cartProducts;
}

export const generateCartForReq = async (qty)=>{
    let realQty = qty || Math.random()*20;

    return new CartDTOReq({
        products: await generateCartproductsForReq(realQty)
    })
}

export const generateCartsForReq = async (qty)=>{
    let carts = [];

    for (let i = 0; i < qty; i++) {
        carts.push(await generateCartForReq());
    }

    return carts;
}

export const getRandomProductOnDB = async ()=>{
    const products = await productController.getProducts({limit:1000});
    const productsId = products.products.map(product=>String(product._id))

    return productsId[Math.floor(Math.random()*productsId.length)]
}