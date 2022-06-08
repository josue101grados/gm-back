import { Injectable } from '@nestjs/common';
import { getXlsxStream } from 'xlstream';
import { UploadSourcesDto } from './dto/uploadSources.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationsService {
  instanceSlug: string;
  constructor(private configService: ConfigService) {
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }
  private async validateFileHeaders(
    filePath: string,
    expectedHeaders: {},
    headersRow = 1,
    startAtRow = 1,
  ) {
    const errors: string[] = [];
    try {
      const stream = await getXlsxStream({ filePath, sheet: 0 });
      let rowCount = 0;
      let startAtRowCounter = 1;
      // this will open the file and read just the first row, which should contain the appropiate headers
      for await (const rowData of stream) {
        if (startAtRowCounter === startAtRow) {
          rowCount += 1;
          if (rowCount === headersRow) {
            Object.keys(expectedHeaders).forEach(key => {
              if (expectedHeaders[key] !== rowData.raw.obj[key]) {
                errors.push(
                  `La celda ${key}${headersRow} debe contener "${expectedHeaders[key]}"`,
                );
              }
            });
          }
        }
        startAtRowCounter += 1;
      }
    } catch (e) {
      console.log(e);
      throw new Error('Hay un error en el formato del archivo que subiste');
    }
    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
  }

  async validateDirectUpload(filePath: string) {
    const DirectUploadsHeaders = {
      A: 'GM objetivo aceptado Fecha',
      B: 'GM objetivo Fecha de cierre',
      C: 'GM Objetivo Contactado Fecha',
      D: 'Puntaje',
      E: 'Clasificación del Puntaje',
      F: 'Comprometido',
      G: 'Actividad',
      H: 'Hora de la cita',
      I: 'Distribuidor original Código BAC',
      J: 'Tipo de campaña',
      K: 'Nombre de la campaña',
      L: 'Fecha de cierre',
      M: 'Comentarios',
      N: 'Fecha de creación',
      O: 'Cliente Tiempo Pref',
      P: 'Distribuidor',
      Q: 'Zona / Región',
      R: 'Distrito',
      S: 'Rastreo Hogar',
      T: 'Fecha de Creación',
      U: 'Hora de contacto',
      V: 'Fecha de Apertura del Lead',
      W: 'Horario de Cierre',
      X: 'Correo electrónico',
      Y: 'Marca',
      Z: 'Margen',
      AA: 'Campaña de Marketing',
      AB: 'Rastreo Móvil',
      AC: 'Modelo',
      AD: 'Año del modelo',
      AE: 'Oferta Realizada',
      AF: 'Versión',
      AG: 'Distribuidor',
      AH: 'Fase',
      AI: 'Estado de la etapa',
      AJ: 'Proveedor',
      AK: 'TD libro',
      AL: 'TD libro Fecha',
      AM: 'Test Drive Realizado',
      AN: 'Test Drive Realizado',
      AO: 'Test Drive Realizado',
      AP: 'Fecha Actualizada en Siebel',
      AQ: 'Fecha ganado',
      AR: 'Rastreo Trabajo',
      AS: 'Idioma preferido',
      AT: 'Tipo de Solicitud',
      AU: 'Nº de celda del contacto',
      AV: 'Dirección de correo electrónico del contacto',
      AW: 'Nº de teléfono particular del contacto',
      AX: 'Teléfono particular',
      AY: 'Teléfono móvil',
      AZ: 'Teléfono del trabajo',
      BA: 'Nº de teléfono del trabajo del contacto',
      BB: 'Distribuidor original Código BAC',
      BC: 'Prioridad',
      BD: 'Etapa de venta',
      BE: 'Etapa de venta',
      BF: 'ID de la oportunidad',
      BG: 'Fecha de la etapa de ventas',
      BH: 'Contacto',
      BI: 'Nº de oportunidad',
      BJ: 'Contacto de la oportunidad - Todos',
      BK: 'Contacto de la oportunidad - Sólo principal',
      BL: 'Equipo de la oportunidad - Todos',
      BM: 'Equipo de la oportunidad - Sólo principal',
      BN: 'Estatus',
      BO: 'Fecha de estado',
      BP: 'Fecha de prioridad ejecutiva',
      BQ: 'Prioridad ejecutiva',
      BR: 'Resumen de cierre',
      BS: 'Nuevo',
      BT: 'Indicador de prioridad',
      BU: 'Nombre de la oportunidad',
      BV: 'Fecha de cierre',
      BW: 'Tipo de oportunidad',
      BX: 'Cuenta',
      BY: 'RAZON DE NO CONTACTO',
      BZ: 'RAZON DE NO COMPRA',
      CA: 'Nº de cuenta',
      CB: 'Apellidos del contacto',
      CC: 'Descripción',
      CD: 'Comentarios del Cliente',
      CE: 'Cargo',
      CF: 'VIN/Número de Vehículo',
      CG: 'ID del cliente',
      CH: 'Nombre del contacto',
      CI: 'Razón ganar/perder',
      CJ: 'Compromisos',
      CK: 'Fecha de creación',
      CL: 'Canal',
      CM: 'Método de venta',
      CN: 'Principal',
      CO: 'Etapa de venta',
      CP: 'Organización',
      CQ: 'Equipo de ventas',
      CR: 'Equipo de ventas',
      CS: 'Oportunidad principal',
    };
    await this.validateFileHeaders(filePath, DirectUploadsHeaders);
  }

  async validateSales(filePath: string) {
    const SalesHeaders = {
      A: 'Nº de Identificación del Vehículo',
      B: 'Número del Cupón',
      C: 'Validación',
      D: 'Fecha de Registro',
      E: 'Zona',
      F: 'Región',
      G: 'Provincia',
      H: 'Concesionario',
      I: 'Cuenta',
      J: 'Cuenta BAC',
      K: 'Fecha para Reportes',
      L: 'DIAS',
      M: 'ZVSK',
      N: 'MY',
      O: 'KMAT',
      P: 'DESCRIPCION',
      Q: 'AEADE',
      R: 'SEGMENTO',
      S: 'FAMILIA',
      T: 'TIPO DE VEHICULO',
      U: 'COLOR',
      V: 'CLAVE',
      W: 'VALID FLOTA',
      X: 'Fecha de Cancelación',
      Y: 'Fecha de la Factura Retail',
      Z: 'Tipo Financiamiento',
      AA: 'Forma de Pago',
      AB: 'Cia Leasing / Financiera',
      AC: 'CI Vendedor',
      AD: 'Vendedor',
      AE: 'Estatus del Cupón',
      AF: 'Número de la Factura Retail',
      AG: 'Chevystar Activado',
      AH: 'Clave de la Flota',
      AI: 'Valor Neto',
      AJ: 'Valor Total',
      AK: 'Tipo de Venta',
      AL: 'Uso',
      AM: 'Zona2',
      AN: 'Fecha de Entrega',
      AO: 'Creado por',
      AP: 'Creación: fecha',
      AQ: 'Marca Vehículo anterior',
      AR: 'Modelo Vehículo anterior',
      AS: 'Año del Vehículo anterior',
      AT: 'Causa de la Anulación',
      AU: 'Compañía de Seguros',
      AV: 'Razón Social de la Cuenta',
      AW: 'Cédula de Identificación',
      AX: 'Contacto',
      AY: 'Género',
      AZ: 'Fecha de Nacimiento',
      BA: 'Teléfono',
      BB: 'Teléfono Residencia',
      BC: 'Teléfono Movil',
      BD: 'Dirección',
      BE: 'E-mail',
      BF: 'Ciudad',
      BG: 'País',
      BH: 'Año',
      BI: 'Código del Punto de Venta',
      BJ: 'Cuenta: ID exclusivo externo',
      BK: 'Duplicado',
    };
    await this.validateFileHeaders(filePath, SalesHeaders);
  }

  async validateNotContactedLeads(filePath: string) {
    const NotContactedLeadsHeaders = {
      A: 'Año',
      B: 'Mes',
      C: 'País',
      D: 'Cod Bac',
      E: 'Dealer',
      F: 'Bac',
      G: 'Observaciones',
      H: 'Fecha Última Gestión',
      I: 'Hora Última Gestión',
      J: 'Fecha Creación',
      K: 'Fecha Siebel',
      L: 'Modelo',
      M: 'Nombre de Oportunidad',
      N:
        '1. ¿Fue contactado por el concesionario para gestionar su interés en la compra del vehículo?',
      O:
        'SI ¿Qué tan satisfecho se encuentra con la atención recibida por el concesionario?  Siendo 0 nada sa',
      P: 'Medio',
      Q: 'SI ¿En cuánto tiempo fue contactado?',
      R: 'Palabra clave',
      S:
        'NO ¿Desea ser contactado por otro concesionario, para seguir su proceso de compra?',
      T:
        'NO . ¿Cuál de las siguientes opciones, representa de mejor manera, la respuesta brindada anteriormen',
      U: 'No Contactado',
      V: 'Dias Diferencia',
    };
    const headerIsAtRow = 2; // It ignores the empty rows
    await this.validateFileHeaders(
      filePath,
      NotContactedLeadsHeaders,
      1,
      headerIsAtRow,
    );
  }

  async validateLiveStore(filePath: string) {
    const LiveStoreHeaders = {
      K: 'Fecha de Gestión',
      L: 'Intento de Llamada',
      M: 'Contacto Efectivo',
      N: 'Financiamiento',
      O: 'Status',
      P: 'Asesor Asignado',
    };
    const headerIsAtRow = 1; // It ignores the empty rows
    await this.validateFileHeaders(
      filePath,
      LiveStoreHeaders,
      1,
      headerIsAtRow,
    );
  }

  async validateSources(filePath: string, source: UploadSourcesDto['source']) {
    const ecExpectedHeaders: {
      [key in UploadSourcesDto['source']]: object;
    } = {
      FACEBOOK: {
        A: 'ID',
        B: 'Fecha hora',
        C: 'Cedula',
        D: 'Provincia',
        E: 'Ciudad',
        F: 'Concesionario',
        G: 'Modelo',
        H: 'Telefono',
        I: 'Correo',
        J: 'Nombre',
        K: 'Apellido',
        L: 'Fecha',
        M: 'Fecha estimada de compra',
      },
      DDP_FACEBOOK: {
        A: 'ID',
        B: 'Fecha hora',
        C: 'Cedula',
        D: 'Provincia',
        E: 'Ciudad',
        F: 'Concesionario',
        G: 'Modelo',
        H: 'Telefono',
        I: 'Correo',
        J: 'Nombre',
        K: 'Apellido',
        L: 'Fecha',
        M: 'Fecha estimada de compra',
      },
      CALL_CENTER: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
      RRSS: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
      GENERIC: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
    };
    const coExpectedHeaders: {
      [key in UploadSourcesDto['source']]: object;
    } = {
      FACEBOOK: {
        A: 'ID',
        B: 'Fecha hora',
        C: 'Cedula',
        D: 'Ciudad',
        E: 'Concesionario',
        F: 'Telefono',
        G: 'Correo',
        H: 'Nombre',
        I: 'Apellido',
        J: 'Fecha',
        K: 'Modelo',
        L: 'Fecha estimada de compra',
      },
      DDP_FACEBOOK: {
        A: 'ID',
        B: 'Fecha hora',
        C: 'Cedula',
        D: 'Ciudad',
        E: 'Vitrina',
        F: 'Telefono',
        G: 'Correo',
        H: 'Nombre',
        I: 'Apellido',
        J: 'Fecha',
        K: 'Modelo',
        L: 'Bac',
        M: 'Fecha estimada de compra',
      },
      CALL_CENTER: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
      RRSS: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
      GENERIC: {
        A: '#',
        B: 'Nombres',
        C: 'Apellidos',
        D: 'CI',
        E: 'Celular',
        F: 'Email',
        G: 'Ciudad',
        H: 'Concesionario',
        I: 'Modelo',
        J: 'Fecha Registro',
        K: 'Fecha Estimada de Compra',
        L: 'Comentarios',
        M: 'Terminos y condiciones',
      },
    };
    const headersRow =
      source === 'FACEBOOK' || source === 'DDP_FACEBOOK' ? 2 : 1;
    if (this.instanceSlug === 'ec') {
      await this.validateFileHeaders(
        filePath,
        ecExpectedHeaders[source],
        headersRow,
      );
    } else {
      await this.validateFileHeaders(
        filePath,
        coExpectedHeaders[source],
        headersRow,
      );
    }
  }

  async validateFunnel(filePath: string) {
    const FunnelHeaders = {
      A: 'opp_name',
      B: 'country',
      C: 'SMS o email',
      D: 'Enviado',
      E: 'Apertura',
      F: 'Click',
      G: 'Bounced',
    };
    await this.validateFileHeaders(filePath, FunnelHeaders);
  }
}
