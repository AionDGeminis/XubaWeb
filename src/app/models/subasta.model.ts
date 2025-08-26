// src/app/models/subasta.model.ts
export interface ImagenSubasta {
    idSubasta: number;
    url: string;
  }
  
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
  }
  
  export interface Subasta {
    id: number;
    caption: string;
    url: string;
    precio: number;
    idVendedor:number;
    descripcion:string;
    puja:number;
    apuesta: number;
    mimagenesSubasta: ImagenSubasta[];
    mestatus:string;
    musuarios: Usuario;
    creado: string;
    dia: number;
    mes: number;
    anio: number;
    hora: number;
    minuto: number;
    segundo: number;
    horas: number;
    estatus: string;
    comisionBanco: number;
    comisionXuba: number;
    flete: number;
    comisionFlete: number;
    ganancia: number;
    premium: boolean;
    tipo: number;
    idGanador: number;
    compraDirecta: boolean;
    fechaVencimiento?: Date;
    tiempoVence: string;
    vencida: boolean;
    nuevo: boolean;
    venceSegundos?: number;
    short_desc?: string;
  }
  