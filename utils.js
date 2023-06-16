import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import winston from "winston";
import fs from "fs";
import config from "./config/config.js";


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        let path;

        switch (file.fieldname) {
            case 'profile_picture':
            case 'profile':
                path = `${__dirname}/public/img/profiles`;
                break;

            case 'thumbnails':
            case 'product':
                path = `${__dirname}/public/img/products`;
                break;
        
            case 'identificacion':
            case 'domicilio':
            case 'estado_cuenta':
            case 'document':
                path = `${__dirname}/public/documents/${req.params.uid}`;
                break;

            default:
                path = `${__dirname}/public/img`;
                break;
        }
            
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        cb(null, path);

    },
    filename:function(req, file, cb){
        let newFileName;

        console.log(file);
        switch (file.fieldname) {
            case "identificacion":
                newFileName = "Identificacion.pdf";
                break;

            case "domicilio":
                newFileName = "Comprobante de Domicilio.pdf";
                break;

            case "estado_cuenta":
                newFileName = "Comprobante de Estado de Cuenta.pdf";
                break;

            case "profile_picture":
            case "profile":
                const mimetypeArr = file.mimetype.split("/");
                const imgExtension = mimetypeArr[mimetypeArr.length-1];
                
                newFileName = `${req.body.first_name}-${req.body.last_name}.${imgExtension}`;
                break;

            default:
                newFileName = file.originalname;
                break;
        }

        cb(null, newFileName);
    }
})

export const uploader = multer({storage});

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const JWT_PRIVATE_KEY = config.jwt_private_key;

export const generateToken = (data)=>{
    return jwt.sign({data}, JWT_PRIVATE_KEY, {expiresIn:"24hs"});
}

export const authToken = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader) return res.status(401).send({status:"error", message: "Not authenticated"});

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_PRIVATE_KEY, (error, credentials)=>{
        if(error) return res.send(403).send({status:"error", message: "Not authorized"});

        req.user = credentials.user;
        next();
    })
}

const customLevelsOptions = {
    levels:{
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors:{
        fatal: 'red',
        error: 'red',
        warning: 'yellow',
        info: 'blue',
        http: 'grey',
        debug: 'grey'
    }
}
const transports = (config.mode == "DEVELOPMENT") ?
    [
        new winston.transports.Console({
            level: config.debug ? "debug" : "info",
            format: winston.format.combine(winston.format.colorize({colors: customLevelsOptions.colors}), winston.format.simple())
        })
    ]
    :
    [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(winston.format.colorize({colors: customLevelsOptions.colors}), winston.format.simple())
        }),
        new winston.transports.File({
            filename: "./shop.log",
            level: "error",
            format: winston.format.simple()
        })
    ]

const logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports
})

export const addLogger = (req, res, next)=>{
    req.logger = logger;
    req.logger.info(`Petición ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}`);
    next();
}

export const handlePolicies = policies => (req, res, next)=>{
    if(policies.includes("PUBLIC")) return next();

    if(!!!req.user) return res.status(401).send({status:"error", message:"Unauthorized"});

    if(!policies.includes(req.user.rol.toUpperCase())) return res.status(403).send({status:"error", message:"No tienes permisos suficientes."});

    next();
}