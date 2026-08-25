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
    codigoPostal: string;
    usuario: string;
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
    mestatus:any;
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
    profundidad:number;
    urlGuia: string;
    entregaSucursal: boolean;
    horaRecolecta: string;
    fechaRecoleccion: string;
  }
   export interface detalleSubasta {
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
  }

  export interface Imagen {
  idImagen: number;
  url: string;
 }
  