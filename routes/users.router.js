import { Router } from "express";

import config from "../config/config.js";
import UserController from "../controllers/users.controller.js";
import { __dirname, handlePolicies, uploader } from "../utils.js";

import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { fileNotFound } from "../services/errors/info/users.error.info.js";

const usersRouter = Router();

const userController = new UserController();

usersRouter.get('/', handlePolicies(['PREMIUM', 'ADMIN']), async(req, res, next)=>{
    try {
        const users = await userController.getUsers();

        res.send({status:'success', message:'Usuarios encontrados.', payload:users});
    } catch (error) {
        next(error);
    }
})

usersRouter.get('/premium/:uid', handlePolicies(['USER', 'PREMIUM', 'ADMIN']), async (req, res, next)=>{
    try {
        const uid = req.params.uid;

        let changeRol = await userController.changeRol(uid);

        if(req.session.user._id === uid) req.session.user.rol = changeRol;

        res.send({status:'success', message:`Rol del usuario modificado a ${changeRol.toUpperCase()}.`});
    } catch (error) {
        next(error);
    }
})

usersRouter.post('/:uid/documents', handlePolicies(['USER', 'PREMIUM', 'ADMIN']),
    uploader.fields([
        {name: 'document', maxCount: 3},
        {name: 'identificacion', maxCount: 1},
        {name: 'domicilio', maxCount: 1},
        {name: 'estado_cuenta', maxCount: 1}
    ]),
    async(req, res, next)=>{

    try {
        const uid = req.params.uid;
        const filesToAdd = [];

        if(!!!req.files){
            CustomError.createError({
                name: "No se envio ningun archivo",
                cause: fileNotFound(),
                message: `No se enviaron archivos adjuntos para ser guardados`,
                code: EErrors.USERS.FILES_NOT_FOUND
            });
        }

        if(!!req.files.document){
            req.files.document.forEach(async file=>{    
                let newDocument = {
                    name: 'document',
                    reference: `img/documents/${uid}/${file.filename}`
                }
        
                filesToAdd.push(newDocument);
            })
        }

        if(!!req.files.identificacion){
            let newDocument = {
                name: 'identificacion',
                reference: `img/documents/${uid}/${req.files.identificacion[0].filename}`
            }

            filesToAdd.push(newDocument);
        }
        if(!!req.files.domicilio){
            let newDocument = {
                name: 'domicilio',
                reference: `img/documents/${uid}/${req.files.domicilio[0].filename}`
            }

            filesToAdd.push(newDocument);
        }
        if(!!req.files.estado_cuenta){
            let newDocument = {
                name: 'estado_cuenta',
                reference: `img/documents/${uid}/${req.files.estado_cuenta[0].filename}`
            }

            filesToAdd.push(newDocument);
        }

        let loadDocuments = await userController.loadDocuments(uid, filesToAdd);

        res.send({status:'success', message:'Documento/s cargado/s con exito.'});
    } catch (error) {
        next(error);
    }
})

usersRouter.delete('/', async(req, res, next)=>{
    try {
        const deletedUsers = await userController.deleteExpiredUsers();
        
        deletedUsers.forEach(user=>{
            const emailBody = `<h1>Usuario de tienda eliminado</h1>
            <p>Estimado ${user.first_name} ${user.last_name}, le enviamos este mail para informarle que su usuario fue borrado de nuestra plataforma por inactividad,
             ya que supero el tiempo maximo (${config.users_expiration_offset} ${config.users_expiration_unit}) desde su ultima conexion a nuestra plataforma.
             Si desea reactivar su cuenta por favor pongase en contacto con nosotros a traves de nuestra pagina web.</p>
             <h4>Tienda</h4>`;
    
            req.mailer.sendMail({
                from: 'Proyecto final <noreplay@mail.com.ar',
                to: user.email,
                subject: 'Usuario eliminado',
                html: emailBody,
                attachments:[]
            })
        })

        res.send({status:'success', message:'Usuarios eliminados exitosamente.'});
    } catch (error) {
        next(error);
    }
})

usersRouter.delete('/:uid', async(req, res, next)=>{
    try {
        const uid = req.params.uid;

        let deletedUser = await userController.deleteUser(uid);

        const emailBody = `<h1>Usuario de tienda eliminado</h1>
        <p>Estimado ${deletedUser.first_name} ${deletedUser.last_name}, le enviamos este mail para informarle que su usuario fue borrado de nuestra plataforma.
         Si desea reactivar su cuenta por favor pongase en contacto con nosotros a travez de nuestra pagina web.</p>
         <p>Esperamos sepa entender. Cordiales saludos.</p>
         <h4>Tienda</h4>`;

        req.mailer.sendMail({
            from: 'Proyecto final <noreplay@mail.com.ar',
            to: deletedUser.email,
            subject: 'Usuario eliminado',
            html: emailBody,
            attachments:[]
        })

        res.send({status:'success', message:`Usuario eliminado con exito. ID ${uid}.`});
    } catch (error) {
        next(error);
    }
})

export default usersRouter;