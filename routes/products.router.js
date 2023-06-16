import { Router } from "express";

import { handlePolicies, uploader } from "../utils.js";
import ProductController from "../controllers/products.controller.js";

const productsRouter = Router();

const productController = new ProductController();

productsRouter.get("/", async (req, res, next)=>{
    try {
        const limit = req.query.limit;
        const page = req.query.page;
        const query = req.query.query;
        const sort = req.query.sort;

        const products = await productController.getProducts(limit, page, query, sort);

        res.send({
            status: "success",
            payload: products.products,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink
        });
    } catch (error) {
        next(error);
    }
})

productsRouter.get("/:pid", async (req, res, next)=>{
    try {
        const pid = req.params.pid;
        
        let product = await productController.getProduct(pid);
    
        res.send({status:"success", payload:product});
    } catch (error) {
        next(error);
    }
})

productsRouter.post("/", handlePolicies(["ADMIN"]), uploader.array("thumbnails"), async (req, res, next)=>{
    try {
        let product = req.body;
        
        if(!!req.files){
            req.files.forEach(file => product.thumbnails.push("img/"+file.filename));
        }

        let addedProduct = await productController.addProduct(product);
        await broadcastProducts(req.io.sockets);

        res.send({status:"success", message:`Producto cargado exitosamente. ID: ${addedProduct?.id || addedProduct?._id}`});
    } catch (error) {
        next(error);
    }
})

productsRouter.put("/:pid", handlePolicies(["ADMIN"]), uploader.array("thumbnails"), async (req, res, next)=>{
    try {
        let productId = req.params.pid;
        let product = req.body;

        if(!!req.files){
            req.files.forEach(file => product.thumbnails.push('img/'+file.filename));
        }

        await productController.updateProduct(productId, product);

        await broadcastProducts(req.io.sockets);

        res.send({status:"success", message:`Producto modificado exitosamente. ID: ${productId}`});
    } catch (error) {
        next(error);
    }
})

productsRouter.delete('/:pid', handlePolicies(['ADMIN', 'PREMIUM']), async (req, res, next)=>{
    try {
        const productId = req.params.pid;

        const deletedProduct = await productController.deleteProduct(productId, req.user);

        if(!!deletedProduct.owner){
            const emailBody = `<h1>Uno de sus Productos fue eliminado</h1>
            <p>Estimado ${deletedProduct.owner.first_name} ${deletedProduct.owner.last_name}, le enviamos este mail para informarle que su producto "${deletedProduct.title}" [${deletedProduct.code}] fue eliminado de la plataforma.
            Si cree que esto es un error por favor pongase en contacto con nosotros a traves de nuestra plataforma.</p>
            <h4>Dun-shop</h4>`;

            req.mailer.sendMail({
                from: 'Proyecto final <noreplay@mail.com.ar',
                to: deletedProduct.owner.email,
                subject: 'Producto eliminado',
                html: emailBody,
                attachments:[]
            })
        }
        await broadcastProducts(req.io.sockets);

        res.send({status:'success', message:`Producto eliminado exitosamente. ID: ${productId}`});
    } catch (error) {
        next(error);
    }
})


async function broadcastProducts(sockets){
    let products = await productController.getProducts();
    sockets.emit("products_update", products);
}

export default productsRouter;