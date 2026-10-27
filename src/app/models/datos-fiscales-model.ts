export interface RegistroDatosFiscales {
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
    iva: number;
    tipoFacturacion?: string;
}

export function initDataRegistroDatosFiscales(): RegistroDatosFiscales {
    return {
        tipoPersona: '',
        pais: '',
        razonSocial: '',
        rfc: '',
        regimenFiscal: '',
        usoCfdi: '',
        correoElectronico: '',
        calle: '',
        numeroExterior: '',
        numeroInterior: '',
        codigoPostal: '',
        colonia: '',
        ciudad: '',
        municipio: '',
        estado: '',
        iva: 0,
        tipoFacturacion: '0',
    }
}