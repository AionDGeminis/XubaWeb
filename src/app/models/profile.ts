export interface ConsultaDatosUsuarioDTO {
    idUsuario: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    stars: string;
    usuario: string;
    genero: string;
    imgPerfil: string;
    fechaNacimiento: Date | string;
    estatus: string;
    idOrganizacion: string;
    interes: string;
    customer_id: string;
    suspendido: boolean;
    cancelado: boolean;
    cuentaClabe: string;
    creado: Date | string;
    direcciones: DireccionesUsuarioDTO[];
    datosSubastas: DatosSubastasUsuarioDTO;
    datosFiscales: DatosFiscalesDTO;
    checkList: ConsultarCheckListRegistroDTO[];
}

export interface DatosFiscalesDTO {
    idUsuario: number;
    tipoPersona: string;
    pais: string;
    razonSocial: string;
    rfc: string;
    regimenFiscal: string;
    usoCfdi: string;
    correoElectronico: string;
    calle: string;
    numeroExterior: string;
    numeroInterior: string;
    codigoPostal: string;
    colonia: string;
    ciudad: string;
    municipio: string;
    estado: string;
    tipoFacturacion: string;
    contratoAceptado: boolean;
    fechaAceptacionContrato: Date | string;
}

export interface DireccionesUsuarioDTO {
    idDireccion: number;
    calle: string;
    colonia: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    predeterminada: boolean;
}

export interface DatosSubastasUsuarioDTO {
    subastasCreadas: number;
    subastasParticipantes: number;
    subastasGanadas: number;
}

export interface ConsultarCheckListRegistroDTO {
    label: string;
    verificado: boolean;
}

