
export interface ComprobantePago {
    estatus: string;
    fecha: string;
    idTransaction: string;
    metodoPago: string;
    cliente: string;
    correo: string;
    ordenXuba: string;
    total: number;
    subtotal: number;
    envio: number;
    nombreArticulo: string;
    idArticulo: number;
    descripcion: string;
    cantidad: number;
    noAutorizacion: string;
}


export function initDataComprobantePago(): ComprobantePago {
    return {
        estatus: '',
        fecha: '',
        idTransaction: '',
        metodoPago: '',
        cliente: '',
        correo: '',
        ordenXuba: '',
        total: 0,
        subtotal: 0,
        envio: 0,
        nombreArticulo: '',
        idArticulo: 0,
        descripcion: '',
        cantidad: 1,
        noAutorizacion: ''
    }
}
