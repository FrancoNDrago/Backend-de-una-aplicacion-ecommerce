import mongoose from "mongoose";
import cartModel from "./cart.model.js";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: String,
    email: {
        type: String,
        required: true,
        unique:true
    },
    age: Number,
    password: String,
    rol: {
        type: String,
        default: "user"
    },
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"carts"
    },
    documents:{
        type:[{
            name: String,
            reference: String
        }]
    },
    last_connection: Date,
    profile_picture: {
        type: String,
        default: "img/profiles/default_profile_picture.jpg"
    }
})

userSchema.post("findOneAndDelete", async function(doc, next){
    await cartModel.findOneAndDelete({_id:doc.cart});

    next();
})

userSchema.pre("deleteMany", async function(){
    const users = await this.model.find(this.getFilter());
    const cartsToDelete = [];

    users.forEach(user=>{
        cartsToDelete.push(user.cart);
    })

    await cartModel.deleteMany({_id: {$in: cartsToDelete}});
})

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;