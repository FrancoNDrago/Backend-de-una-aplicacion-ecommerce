import userModel from "./models/user.model.js";
import cartModel from "./models/cart.model.js";

class UserDbDAO{

    constructor(){}

    getUsers(){
        return userModel.find();
    }

    getExpiredUsers(expirationDate){
        return userModel.find({
            $or:[
                {last_connection:{
                    $lte:expirationDate
                }},
                {last_connection:{
                    $eq:null
                }}
            ]
        });
    }

    getUserByEmail(email){
        return userModel.findOne({email});
    }
    
    getUserById(id){
        return userModel.findById(id);
    }

    async addUser(userToAdd){
        let cart = await cartModel.create({});

        userToAdd.cart = cart["_id"];

        return userModel.create(userToAdd);
    }
    
    updateUserPassword(id, new_password){
        return userModel.updateOne({_id:id}, {password: new_password});
    }

    updateUserRol(id, new_rol){
        return userModel.updateOne({_id:id}, {rol: new_rol});
    }

    setLastConnection(id, last_connection){
        if(!!!last_connection) last_connection = new Date();
        
        return userModel.updateOne({_id:id}, {last_connection});
    }

    addDocument(id, documents){
        return userModel.updateOne({_id:id},{ $push: {documents: {$each: documents}}});
    }

    deleteUser(id){
        return userModel.findOneAndDelete({_id:id});
    }

    deleteExpiredUsers(expirationDate){
        return userModel.deleteMany({
            $or:[
                {last_connection:{
                    $lte:expirationDate
                }},
                {last_connection:{
                    $eq:null
                }}
            ]
        });
    }
}

export default UserDbDAO;