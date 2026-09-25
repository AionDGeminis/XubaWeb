export interface RegistrarSubasta {
    caption: string;
    url: string;
    precio: number | null;
    descripcion: string;
    apuesta: number;
    premium: boolean;
    compraDirecta: boolean;
    valorOferta: number | null;
    peso: number | null;
    largo: number | null;
    ancho: number | null;
    profundidad: number | null;
    nuevo: boolean;
    horas: number | null;
    idDireccion: number;
    marca: string;
    modelo: string;
    entregaSucursal: boolean;
    horaRecolecta: string;
    imagenes: RegistrarSubastaImagen[];
}

export interface RegistrarSubastaImagen {
    base64: string;
}

export function initDataRegistrarSubasta(): RegistrarSubasta {
    return {
        caption: '',
        url: '',
        precio: null,
        descripcion: '',
        apuesta: 0,
        premium: false,
        compraDirecta: false,
        valorOferta: 0,
        peso: null,
        largo: null,
        ancho: null,
        profundidad: null,
        nuevo: false,
        horas: null,
        idDireccion: 0,
        marca: '',
        modelo: '',
        entregaSucursal: false,
        horaRecolecta: '',
        imagenes: []
    };
}