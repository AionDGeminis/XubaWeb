export enum ReclamoEstatus {
    EsperaRevision = 1, 
    EnProceso = 2,    
    Reembolso = 3,
    NoProcede = 4,
    NoEfectuado = 5,
    EnvioPagado = 1002,
    Enviado = 1003,
    Entregado = 1004,
}

export enum ReclamoEstatusCve {
    EsperaRevision = 'EDR', 
    EnProceso = 'PRO',    
    Reembolso = 'REE',
    NoProcede = 'NPC',
    NoEfectuado = 'NFO',
    EnvioPagado = 'ENP',
    Enviado = 'ENV',
    Entregado = 'ENT',
}