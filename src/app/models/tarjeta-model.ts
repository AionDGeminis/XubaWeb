export interface Tarjeta {
    holder_name: string,
    holder_lastname: string,
    card_number: string,
    expiration_month: string,
    expiration_year: string,
    cvv2: string,
    mail: string,
    phone: string,
}


export function initDataTarjeta(): Tarjeta {
    return {
        holder_name: '',
        holder_lastname: '',
        card_number: '',
        expiration_month: '',
        expiration_year: '',
        cvv2: '',
        mail: '',
        phone: '',
    };
}