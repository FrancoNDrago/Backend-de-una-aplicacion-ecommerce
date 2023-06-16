import { Router } from 'express';
import fs from 'fs';

import ProductController from '../controllers/products.controller.js';
import CartController from '../controllers/carts.controller.js';
import UserController from '../controllers/users.controller.js';
import MessageDbDAO from '../daos/message.db.dao.js';
import { __dirname, handlePolicies } from '../utils.js';
import config from '../config/config.js';


const viewsRouter = Router();

const productController = new ProductController();
const cartController = new CartController();
const userController = new UserController();
const messageDB = new MessageDbDAO();

viewsRouter.get('/', async (req, res, next)=>{
    try {
        res.status(301).redirect('/products');
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/products', async (req, res, next)=>{
    try {
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const query = req.query.query || '';
        const sort = req.query.sort || 1;

        const products = await productController.getProducts({limit, page, query, sort});

        products.payload = products.products;

        products.pagination = {
            active: true,
            prevLink: products.prevLink,
            pagesLinks: [],
            nextLink: products.nextLink
        };

        let numLinkPages = (products.totalPages > 5) ? 5 : products.totalPages;
        let midPageDif = 1;

        for (let i = 1; i <= numLinkPages; i++) {
            let actualPage;                                     
            let middleCicle = Math.ceil(numLinkPages/2);        
            let middlePage = products.page;                     

            if(products.page < middleCicle){
                middleCicle = products.page;
            }else if(products.page > (products.totalPages-middleCicle)){
                middleCicle = numLinkPages-(products.totalPages-products.page);
            }

            if(i < middleCicle){
                actualPage = (middlePage-middleCicle)+midPageDif;
                midPageDif++;
            }else if(i === middleCicle){
                actualPage = middlePage;
                midPageDif=1;
            }else{
                actualPage = middlePage+midPageDif;
                midPageDif++;
            }

            let pageLink = {
                page:actualPage,
                link:`/products?limit=${limit}&page=${actualPage}&sort=${sort}&query=${query}`,
                active: products.page === actualPage
            }

            products.pagination.pagesLinks.push(pageLink);
        }

        if(products.totalPages <= 1) products.pagination.active = false;

        res.render('products/products', {products});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/products/abm', privateView, handlePolicies(["ADMIN", "PREMIUM"]), async (req, res, next)=>{
    try {
        let query = {};
        if(req.session.user.rol.toUpperCase() == "PREMIUM") query = {owner: req.session.user._id};

        const products = await productController.getProducts({query: JSON.stringify(query)});
        
        res.render('products/productsTable', {products});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/products/abm/:opt', privateView, handlePolicies(["ADMIN", "PREMIUM"]), async (req, res, next)=>{
    try {
        const opt = req.params.opt;
        const pid = req.query.pid;
        let product;

        if(!!pid){
            product = await productController.getProduct(pid);

            product.thumbnails = product.thumbnails.map(thumbnail => (thumbnail.match(/^img/i)) ? '../'+thumbnail : thumbnail);    
        }

        res.render('products/productForm', {product, opt});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/products/:pid', privateView, async (req, res, next)=>{
    try {
        const productId = req.params.pid;

        let product = await productController.getProduct(productId);

        product.thumbnails = product.thumbnails.map(thumbnail => (thumbnail.match(/^img/i)) ? '../'+thumbnail : thumbnail);

        let isOwner = (String(product.owner) === String(req.user._id)) || (req.user.rol.toUpperCase() === 'ADMIN');

        res.render('products/productDetail', {product, isOwner});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/realtimeproducts', async (req, res, next)=>{
    try {
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const query = req.query.query || '';
        const sort = req.query.sort || 1;
    
        const products = await productController.getProducts({limit, page, query, sort});

        res.render('products/realTimeProducts', {products:products.products});
    } catch (error) {
        next(error);
    }

})

viewsRouter.get('/carts/:cid', privateView, async (req, res, next)=>{
    try {
        const cartId = req.params.cid;

        let cart = await cartController.getCart(cartId);

        cart.products.map(prod=>{
            prod.totalPrice = (prod.product.price*prod.quantity).toFixed(2);
            
            return prod;
        })

        res.render('carts/cart', {cart, cartId});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/register', publicView, (req, res)=>{
    const validation = Number(req.query.validation);
    let message = '';

    switch(validation){
        case 0:
            message = "Surgio un error al registrar al usuario, por favor intentelo de nuevo.";
        case 1:
            message = "Ya existe un usuario con ese e-mail.";
    }

    res.render('sessions/register', {message});
})

viewsRouter.get('/login', publicView, (req, res)=>{
    const validation = Number(req.query.validation);
    const isLogout = Number(req.query.logout);
    const isRegister = Number(req.query.register);
    let message = '';

    switch (validation) {
        case 0:
            message = 'No se encontro usuario con esas credenciales. Por favor vuelva a intentar.';
            break;
        case 1:
            message = 'Solo usuarios registrados pueden acceder a esta pagina, por favor inicie sesión.';
            break;
        case 2:
            message = 'La contraseña ingresada es incorrecta. Por favor vuelva a intentar.';
            break;
        case 3:
            message = 'Contraseña restablecida exitosamente. Por favor inicie sesión.'
            break;
    }

    if(!!isRegister) message = 'Registro exitoso, por favor inicie sesión para comenzar.';    
    if(!!isLogout) message = 'Por favor inicie sesión nuevamente para poder utilizar la totalidad de funciones.';
    
    res.render('sessions/login', {message});
})

viewsRouter.get('/recover', publicView, (req, res)=>{
    const email = req.query.email;
    const user = req.query.user;
    const timestamp = req.query.timestamp;

    res.render('sessions/recover', {email, user, timestamp});
})

viewsRouter.get('/profile', privateView, (req, res)=>{
    res.render('users/ownProfile');
})

viewsRouter.get('/profile/:uid', async (req, res, next)=>{
    try {
        const uid = req.params.uid;
        const user = await userController.getUserById(uid).lean();

        res.render('users/userProfile', {user});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/users/documents', privateView, (req, res)=>{
    const documents = {
        identificacion: fs.existsSync(`${__dirname}/public/documents/${req.session.user._id}/Identificacion.pdf`),
        domicilio: fs.existsSync(`${__dirname}/public/documents/${req.session.user._id}/Comprobante de Domicilio.pdf`),
        estado_cuenta: fs.existsSync(`${__dirname}/public/documents/${req.session.user._id}/Comprobante de Estado de Cuenta.pdf`)
    }

    res.render('users/userDocuments', {documents});
})

viewsRouter.get('/users/abm', async(req, res, next)=>{
    try {
        const expirationOffset = config.users_expiration_offset;
        let expirationUnit;
        const expirationDate = new Date();

        switch(config.users_expiration_unit){
            case 'days':
                expirationUnit = 24*60*60*1000;
                break;
            case 'hours':
                expirationUnit = 60*60*1000;
                break;
            case 'minutes':
                expirationUnit = 60*1000;
                break;
            case 'seconds':
                expirationUnit = 1000;
                break;
            case 'miliseconds':
                expirationUnit = 1;
                break;
        }

        expirationDate.setTime(expirationDate.getTime()-(expirationUnit*expirationOffset));

        let users = await userController.getUsers();

        users = users.map(user => {
            user.rol = user.rol.toLowerCase();
            user.rol = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);

            user.isExpired = user.last_connection <= expirationDate;
            user.hasConnected = user.last_connection === undefined;
            user.showExpiredIcon = user.isExpired || user.hasConnected;

            return user;
        });

        res.render('users/usersTable', {users});
    } catch (error) {
        next(error);
    }
})

viewsRouter.get('/chat', privateView, handlePolicies(['USER']), async (req, res)=>{
    let messages = await messageDB.getMessages();

    res.render('chat', {messages});
})


function privateView(req, res, next){       
    if(!!!req.session.passport?.user) return res.redirect('/login?validation=1');

    next();
}

function publicView(req, res, next){        
    if(!!req.session.passport?.user) return res.redirect('/profile');

    next();
}

export default viewsRouter;