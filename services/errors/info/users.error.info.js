export const idNotFound = (id)=>`No se encontro usuario con ID ${id}`;

export const emailNotFound = (email)=>`No se encontro usuario con el email ${email}`;

export const invalidPass = (email)=>`La contraseña ingresada no corresponde al email ${email}`;

export const samePass = ()=>`Debe indicar una contraseña distinta a la que tenia`;

export const fileNotFound = ()=>`No se encontraron archivos adjuntos`;

export const faltaDocumentacion = (documents)=>
`Falta cargar la siguiente documentacion: 
Identificación: ${(!!documents.identificacion) ? 'Ok' : 'X'}.
Comprobante de domicilio: ${(!!documents.domicilio) ? 'Ok' : 'X'}.
Comprobante de estado de cuenta: ${(!!documents.estado_cuenta) ? 'Ok' : 'X'}.`