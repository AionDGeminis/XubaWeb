import { Usuario } from "./usuario-model";

// src/app/models/subasta.model.ts
export interface ImagenSubasta {
  idSubasta: number;
  url: string;
}


export interface Subasta {
  id: number;
  caption: string;
  url: string;
  precio: number;
  idVendedor: number;
  descripcion: string;
  puja: number;
  apuesta: number;
  mimagenesSubasta: ImagenSubasta[];
  mestatus: any;
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
  direccion?: any;
  peso: number;
  largo: number;
  ancho: number;
  profundidad: number;
  urlGuia: string;
  entregaSucursal: boolean;
  horaRecolecta: string;
  fechaRecoleccion: string;
}

export interface DetalleSubasta {
  id: number;
  caption: string;
  descripcion: string;
  ofertaActual: number;
  valorOferta: number;
  largo: number;
  ancho: number;
  profundidad: number;
  peso: number;
  marca: string;
  modelo: string;
  nuevo: boolean;
  idVendedor: number;
  usuarioVendedor: string;
  fotoVendedor: string;
  estado: string;
  municipio: string;
  codigoPostal: string;
  tiempoVence: string;
  vistas: number;
  ofertas: number;
  imagenes: Imagen[];
  compraDirecta: boolean;
  precio: number;
  esMiSubasta: boolean;
  urlGuia: string;
  cveStatus: string;
}

export interface Imagen {
  idImagen: number;
  url: string;
}

export function initDataDetalleSubasta(): DetalleSubasta {
  return {
    id: -1,
    cveStatus: '',
    caption: '',
    descripcion: '',
    ofertaActual: 0,
    valorOferta: 0,
    largo: 0,
    ancho: 0,
    profundidad: 0,
    peso: 0,
    marca: '',
    modelo: '',
    nuevo: true,
    idVendedor: 0,
    usuarioVendedor: '',
    fotoVendedor: '',
    estado: '',
    municipio: '',
    codigoPostal: '',
    tiempoVence: '',
    vistas: 0,
    ofertas: 0,
    imagenes: [],
    compraDirecta: false,
    precio: 0,
    esMiSubasta: false,
    urlGuia: ''
  };
}



