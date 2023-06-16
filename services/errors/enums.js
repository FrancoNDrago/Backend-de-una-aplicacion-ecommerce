const EErrors = {
    PRODUCTS: {
        PRODUCT_NOT_FOUND: 'PROD-1',
        PRODUCT_EXIST: 'PROD-2',
        NOT_OWNER: 'PROD-3'
    },

    CARTS: {
        CART_NOT_FOUND: 'CART-1',
        CART_EXIST: 'CART-2',
        PRODUCT_NOT_IN_CART: 'CART-3',
        IS_PRODUCT_OWNER: 'CART-4'
    },

    USERS: {
        USER_ID_NOT_FOUND: 'USER-1',
        USER_EMAIL_NOT_FOUND: 'USER-2',
        INVALID_PASSWORD: 'USER-3',
        SAME_PASSWORD: 'USER-4',
        FILES_NOT_FOUND: 'USER-5',
        MISSING_DOCUMENTS: 'user-6'
    },

    MESSAGES: {
        USER_NOT_FOUND: 'MSG-1'
    },

    TICKETS: {
        TICKET_EXIST: 'TCK-1',
    },

    GENERICS: {
        ID_TYPE_NOT_VALID: 'GRL-1',
        ID_CANT_CHANGE: 'GRL-2',
        MISSING_REQUIRED_DATA: 'GRL-3',
    }
}

export default EErrors;