import { faker } from "@faker-js/faker/locale/es";

import UserDTO from '../../dtos/request/user.req.dto.js';
import { generateCart } from './carts.mock.js';

const randomRol = ()=>{
    let roles = ['user', 'premium', 'admin'];
    let randomIndex = Math.round(Math.random()*roles.length);

    return roles[randomIndex];
}

export const generateUser = ()=>{
    return new UserDTO({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({min: 15, max:67}),
        password: faker.internet.password(16),
        rol: randomRol(),
        cart: generateCart()
    })
}

export const generateUsers = qty=>{
    let users = [];

    for (let i = 0; i < qty; i++) {
        users.push(generateUser());
    }

    return users;
}