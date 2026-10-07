export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    imgPerfil: string;
    creado?: Date;
    telefono: string;
    mensaje: string;
    correo: string;
    contra: string;
    auth: boolean;
    stars: number;
    registrado: boolean;
    subastasActivas: number;
    codigoPostal: string;
    usuario: string;
    token: string;
}

export function initDataUsuario() {
    return {
        id: -1,
        nombre: '',
        apellido: '',
        imgPerfil: '',
        creado: new Date(),
        telefono: '',
        mensaje: '',
        correo: '',
        contra: '',
        auth: false,
        stars: 0,
        registrado: false,
        subastasActivas: 0,
        codigoPostal: '',
        usuario: '',
        token: '',
    }
}