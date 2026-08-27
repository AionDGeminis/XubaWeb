export interface PerfilVendedor{
    idVendedor: number,
    nombre: string,
    usuario: string,
    imgPerfil: string,
    calificacion: number,
    municipio: string,
    estado: string,
    subastasCreadas: number,
    subastasConcretadas: number,
    seguidores: number,
    antiguedad: string,
    siguiendo: boolean,
    subastasExpress: SubastaActiva[];
    subastasActivas:  SubastaActiva[];
}

export interface SubastaActiva{
    id: number,
    url: string,
    caption: string,
    descripcion: string,
    premium: boolean,
    nuevo: boolean,
    apuesta: number,
    tiempoVence: string;
    venceSegundos?: number;
    short_desc?: string;

}
