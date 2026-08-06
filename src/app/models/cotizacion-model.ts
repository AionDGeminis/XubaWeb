export interface CotizacionPaqueteriaModel {
    codigoPostalOrigen: string,
    ciudadOrigen: string,
    codigoPostalDestino: string,
    ciudadDestino: string,
    peso: number,
    logitud: number,
    ancho: number,
    altura: number,
    fechaEnvio: string //2025-07-11T04:07:24.805Z
}
export interface RecoleccionModel {
  idSubasta: number;
  nombre: string;
  telefono: string;
  correo: string;
  codigoPostal: string;
  ciudad: string;
  direccion1: string;
  direccion2: string;
  numeroGuia: string;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  horarecolecta: string;
}