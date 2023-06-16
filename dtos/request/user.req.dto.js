import { createHash } from "../../utils.js";

class UserDTO{
    constructor(user){
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.password = createHash(user.password);
        this.rol = user.rol || "user";
        this.cart = user.cart;
        this.documents = user.documents || [];
        this.last_connection = user.last_connection;
        this.profile_picture = user.profile_picture;
    }
}
  
export default UserDTO;