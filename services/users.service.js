import fs from 'fs';

import { UsersFty } from '../daos/factory.js';
import UserDTO from '../dtos/response/user.res.dto.js';
import { __dirname, createHash } from '../utils.js';
import config from '../config/config.js';

import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';
import { faltaDocumentacion } from './errors/info/users.error.info.js';

class UserService{
    constructor(){
        this.persistanceEngine = new UsersFty();
    }

    async getUsers(){
        let users = await this.persistanceEngine.getUsers();

        return users.map(user=>new UserDTO(user))
    }

    getUserByEmail(email){
        return this.persistanceEngine.getUserByEmail(email);
    }

    getUserById(id){
        return this.persistanceEngine.getUserById(id);
    }

    addUser(userToAdd){
        return this.persistanceEngine.addUser(userToAdd);
    }

    updateUserPassword(id, new_password){
        const password = createHash(new_password);
        
        return this.persistanceEngine.updateUserPassword(id, password);
    }

    async changeRol(id){
        const user = await this.persistanceEngine.getUserById(id);
        let new_rol;

        if(user.rol.toUpperCase() === 'PREMIUM'){
            new_rol = 'user';
        }else if (user.rol.toUpperCase() === 'USER') {
            new_rol = 'premium';
        }

        let documents = {
            identificacion: fs.existsSync(`${__dirname}/public/documents/${id}/Identificacion.pdf`),
            domicilio: fs.existsSync(`${__dirname}/public/documents/${id}/Comprobante de Domicilio.pdf`),
            estado_cuenta: fs.existsSync(`${__dirname}/public/documents/${id}/Comprobante de Estado de Cuenta.pdf`)
        }

        if((!documents.identificacion || !documents.domicilio || !documents.estado_cuenta) && new_rol === 'premium'){
            CustomError.createError({
                name: "Falta documentacion",
                cause: faltaDocumentacion(documents),
                message: `Faltan cargar documentacion necesaria para el cambio de rol.`,
                code: EErrors.USERS.MISSING_DOCUMENTS
            });
        }

        await this.persistanceEngine.updateUserRol(id, new_rol);

        return new_rol;
    }

    setLastConnection(id){
        return this.persistanceEngine.setLastConnection(id, new Date());
    }

    addDocument(id, documents){
        return this.persistanceEngine.addDocument(id, documents);
    }

    async deleteUser(id){
        let deleted = await this.persistanceEngine.getUserById(id);

        await this.persistanceEngine.deleteUser(id);

        return deleted;
    }

    async deleteExpiredUsers(){
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


        let expiredUsers = await this.persistanceEngine.getExpiredUsers(expirationDate);

        await this.persistanceEngine.deleteExpiredUsers(expirationDate);

        return expiredUsers;
    }
}

export default UserService;