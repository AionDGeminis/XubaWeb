
export interface GanadorInfo {
    id?: number;
    apellido: string;
    apuesta: number;
    cantidadApuestas: number;
    claveEstatus: string;
    correo: string;
    creado: Date;
    estatus: string;
    idComprador: number;
    idSubasta: number;
    nombre: string;
    numGuia: string;
    ofertas: any[];
    telefono: string;
}

export function initDataGanadorInfo() {
    return {
        id: -1,
        apellido: '',
        apuesta: 0,
        cantidadApuestas: 0,
        claveEstatus: '',
        correo: '',
        creado: new Date(),
        estatus: '',
        idComprador: -1,
        idSubasta: -1,
        nombre: '',
        numGuia: '',
        ofertas: [],
        telefono: '',
    }
}
