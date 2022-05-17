import { Injectable } from '@nestjs/common';
import { trim, toLower, startsWith, endsWith } from 'lodash';
// var QuickEmailVerification = require('quickemailverification');
import * as QuickEmailVerification from 'quickemailverification';
import { ConfigService } from '@nestjs/config';
import { InvalidPhonesService } from 'modules/invalidPhones/invalidPhones.service';
import { SourcedLead } from 'modules/leads/sourcedLead.entity';
import { Lead } from 'modules/leads/lead.entity';
import { parse, format, subMonths, getMonth, getYear } from 'date-fns';
import * as Excel from 'exceljs';
import { isObject, isString } from 'util';
import { addMonths, addDays } from 'date-fns';

export enum PhoneTypes {
  HOME = 'home',
  MOBILE = 'mobile',
}

export type Row = string[];

export interface ValidationError {
  row: Row;
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class UtilitiesService {
  public duplicatedPeriod = 7;
  public colorsOldRecords = [
    { fromPercent: 0.05, toPercent: 1.0, color: '0FBF2C' },
    { fromPercent: 0.048, toPercent: 0.0499, color: '93F01E' },
    { fromPercent: 0.045, toPercent: 0.0479, color: 'E6FF90' },
    { fromPercent: 0.043, toPercent: 0.0449, color: 'F9FC2A' },
    { fromPercent: 0.04, toPercent: 0.0429, color: 'FAE09E' },
    { fromPercent: 0.038, toPercent: 0.0399, color: 'F7AA10' },
    { fromPercent: 0.0, toPercent: 0.0379, color: 'DE0505' },
  ];
  instanceSlug: string;
  constructor(
    private configService: ConfigService,
    private invalidPhonesService: InvalidPhonesService,
  ) {
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }

  /**
   * Cleans document from special characters
   * @param document Document to Validate
   * @param instanceSlug Instance Slug
   */
  cleanDocument(document: string, instanceSlug: string): string {
    if (document) {
      document = this.convertToString(document);
      if (!isString(document)) {
        return document;
      }
      document = document.replace('`', `'`); // str_replace('`', "'", utf8_encode(document));
      document = trim(document.replace(/[^(\x20-\x7F)]*/, ''), '').trim();
      document = document.replace(' ', '');
      document = document.replace(' ', '').replace('-', '');

      if (
        instanceSlug === 'ec' &&
        (document.length === 9 || document.length === 12) &&
        !isNaN(Number(document))
      ) {
        document = '0' + document;
      }
    }
    return document;
  }

  /**
   * Cleans special characters from text
   * @param text Text to clean
   */
  cleanSpaceSpecialCharacter(text: string) {
    text.replace(
      /[^(\x20-\x7F\xc3\x81\xc3\x89\xc3\x8d\xc3\x93\xc3\x9a\xc3\xa1\xc3\xa9\xc3\xad\xc3\xb3\xc3\xba\xc3\x91\xc3\xb1)]*/,
      '',
    );
    text = trim(trim(text, `'`));
    return text;
  }

  get12MonthsFromNowPeriods() {
    const today = new Date();
    const to = new Date();
    const from = subMonths(today, 12);
    const periods = [];
    let buildPeriod = true;
    let periodMonth = getMonth(from) + 1; // month in database starts in 1, in havascript is 0
    let periodYear = getYear(from);
    let periodMonthString = periodMonth < 10 ? `0${periodMonth}` : periodMonth;
    while (buildPeriod) {
      periods.push(`${periodYear}-${periodMonthString}`);

      if (`${periodYear}-${periodMonthString}` == format(to, 'yyyy-MM')) {
        buildPeriod = false;
      }

      if (periodMonth == 12) {
        periodMonth = 1;
        periodYear++;
      } else {
        periodMonth++;
      }

      periodMonthString = periodMonth < 10 ? `0${periodMonth}` : periodMonth;
    }

    return periods;
  }

  /**
   * Validates if text has the word test
   * @param text Text to validate
   */
  containtsTest(text: string): boolean {
    let contains = false;

    if (toLower(text) === 'test') {
      contains = true;
    }

    if (toLower(text).indexOf(' test ') >= 0) {
      contains = true;
    }

    if (startsWith(toLower(text), 'test')) {
      contains = true;
    }

    if (endsWith(toLower(text), 'test')) {
      contains = true;
    }

    return contains;
  }

  convertToString(number: any) {
    if (number === undefined || number === null) {
      return null;
    }

    if (isObject(number)) {
      return number;
    }

    if (!isNaN(number)) {
      return `${number}`;
    }

    return number;
  }

  /**
   * Validates Phone and normalize
   * @param phoneNumber Phone Number to validate
   * @param instanceSlug Instance Slug
   * @param type Type Home or Mobile
   */
  async validatePhone(
    phoneNumber: string,
    instanceSlug: string | null = 'ec',
    type: string | null = null,
  ): Promise<{
    isValid: boolean;
    phone: string;
    type: string;
  }> {
    let validation = {
      isValid: false,
      phone: '',
      type: '',
    };

    phoneNumber = this.convertToString(phoneNumber);

    if (!phoneNumber || !isString(phoneNumber)) {
      return validation;
    }

    let phone = phoneNumber.replace('[s+]', '');

    // Ecuador
    if (instanceSlug === 'ec') {
      let existPhoneInvalid = await this.existPhoneInvalid(phone);
      if (existPhoneInvalid) {
        validation = {
          isValid: false,
          phone: '',
          type: '',
        };
      } else if (
        phone.substr(0, 4) === '(01)' &&
        (phone.length === 14 || phone.length === 13) &&
        (phone.substr(5, 2) === '09' || phone.substr(5, 1) === '9')
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 9, phone.length),
          type: 'mobile',
        };
      } else if (
        phone.substr(0, 4) === '(01)' &&
        (phone.length === 13 || phone.length === 12) &&
        (phone.substr(5, 9) !== '09' || phone.substr(5, 1) !== '9')
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 8, phone.length),
          type: 'home',
        };
      } else if (phone.substr(0, 2) === '09' && phone.length === 10) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(1, 9),
          type: 'mobile',
        };
      } else if (phone.substr(0, 1) === '9' && phone.length === 9) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(0, 9),
          type: 'mobile',
        };
      } else if (
        phone.substr(0, 4) === '+593' &&
        (phone.length === 13 || phone.length === 14) &&
        (phone.substr(4, 2) === '09' || phone.substr(4, 1) === '9')
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 9, phone.length),
          type: 'mobile',
        };
      } else if (
        phone.substr(0, 3) === '593' &&
        (phone.length === 13 || phone.length === 12) &&
        (phone.substr(3, 2) === '09' || phone.substr(3, 1) === '9')
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 9, phone.length),
          type: 'mobile',
        };
      } else if (
        phone.substr(0, 1) === '0' &&
        phone.substr(1, 1) !== '9' &&
        phone.length === 9
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(1, 9),
          type: 'home',
        };
      } else if (
        phone.substr(0, 1) !== '0' &&
        phone.substr(0, 1) !== '9' &&
        phone.length === 8
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(0, 8),
          type: 'home',
        };
      } else if (
        phone.substr(0, 4) === '+593' &&
        phone.length === 13 &&
        phone.substr(4, 2) !== '09'
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 8, phone.length),
          type: 'home',
        };
      } else if (
        phone.substr(0, 4) === '+593' &&
        phone.length === 12 &&
        phone.substr(4, 1) !== '9'
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 8, phone.length),
          type: 'home',
        };
      } else if (
        phone.substr(0, 3) === '593' &&
        phone.length === 12 &&
        phone.substr(3, 2) !== '09'
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 8, phone.length),
          type: 'home',
        };
      } else if (
        phone.substr(0, 3) === '593' &&
        phone.length === 11 &&
        phone.substr(3, 1) !== '9'
      ) {
        validation = {
          isValid: true,
          phone: '593' + phone.substr(phone.length - 8, phone.length),
          type: 'home',
        };
      } else {
        validation = {
          isValid: false,
          phone: '',
          type: '',
        };
      }

      existPhoneInvalid = await this.existPhoneInvalid(validation.phone);

      if (existPhoneInvalid) {
        validation = {
          isValid: false,
          phone: '',
          type: '',
        };
      }
    }

    // Colombia
    if (instanceSlug === 'co') {
      if (phone.length === 0) {
        validation = {
          isValid: true,
          phone,
          type,
        };
      } else {
        if (phone.substr(0, 1) === '+') {
          phone = phone.substr(1, phone.length);
        }

        if (phone.substr(0, 2) !== '57') {
          validation = {
            isValid: true,
            phone: '57' + phone.substr(0, phone.length),
            type,
          };
        } else {
          validation = {
            isValid: true,
            phone: '57' + phone.substr(2, phone.length),
            type,
          };
        }
      }
    }

    return validation;
  }

  /**
   * CHecks if exists phone invalid in the database
   * @param phone Phone Number to check
   */
  async existPhoneInvalid(phone: string): Promise<boolean> {
    const existPhoneInvalid = await this.invalidPhonesService.findOne({
      where: {
        phone,
      },
    });

    return existPhoneInvalid ? true : false;
  }

  /**
   * Vaidates document with Ecuador algorithm
   * @param id ID
   */
  validateDocument(
    id: string,
  ): {
    isValid: boolean;
    message: string;
  } {
    const validation = {
      message: '',
      isValid: true,
    };
    if (id) {
      const num = id.length;
      let suma = 0;
      let residuo = 0;
      let pri = false;
      let pub = false;
      let nat = false;
      const numeroProvincias = 24;
      let modulo = 11;

      if (num >= 10) {
        // Verifico que el campo no contenga letras
        let ok = 1;
        for (let i = 0; i < num && ok === 1; i++) {
          const n = +id.charAt(i);
          if (isNaN(n)) {
            ok = 0;
          }
        }
        if (ok === 0) {
          validation.isValid = false;
          validation.message = 'No puede ingresar caracteres en el número';
          return validation;
        }

        // Valido que los dos primeros digitos correspondan a un numero de provincia valido
        const provincia = +(+id.substr(0, 2));
        if (provincia < 1 || provincia > numeroProvincias) {
          validation.isValid = false;
          validation.message =
            'El código de la provincia (dos primeros dígitos) es inválido';
        }

        // Almacenamos todos los digitos de la cedula
        const d1 = +id.substr(0, 1);
        const d2 = +id.substr(1, 1);
        const d3 = +id.substr(2, 1);
        const d4 = +id.substr(3, 1);
        const d5 = +id.substr(4, 1);
        const d6 = +id.substr(5, 1);
        const d7 = +id.substr(6, 1);
        const d8 = +id.substr(7, 1);
        const d9 = +id.substr(8, 1);
        const d10 = +id.substr(9, 1);

        let p1 = 0;
        let p2 = 0;
        let p3 = 0;
        let p4 = 0;
        let p5 = 0;
        let p6 = 0;
        let p7 = 0;
        let p8 = 0;
        let p9 = 0;

        /* El tercer digito es: */
        /* 9 para sociedades privadas y extranjeros   */
        /* 6 para sociedades publicas https://www.jybaro.com/blog/cedula-de-identidad-ecuatoriana/#actualizacion20170714 */
        /* menor que 6 (0;1,2,3,4,5) para personas naturales */

        if (d3 === 7 || d3 === 8) {
          validation.isValid = false;
          validation.message = 'El tercer dígito ingresado es inválido';
        }

        if (validation.isValid) {
          /* Solo para personas naturales (modulo 10) */
          if (
            (d3 <= 6 && num === 10) ||
            (d3 === 6 && num === 13 && id.substr(10, 3) === '001')
          ) {
            nat = true;
            p1 = d1 * 2;
            if (p1 >= 10) {
              p1 -= 9;
            }
            p2 = d2 * 1;
            if (p2 >= 10) {
              p2 -= 9;
            }
            p3 = d3 * 2;
            if (p3 >= 10) {
              p3 -= 9;
            }
            p4 = d4 * 1;
            if (p4 >= 10) {
              p4 -= 9;
            }
            p5 = d5 * 2;
            if (p5 >= 10) {
              p5 -= 9;
            }
            p6 = d6 * 1;
            if (p6 >= 10) {
              p6 -= 9;
            }
            p7 = d7 * 2;
            if (p7 >= 10) {
              p7 -= 9;
            }
            p8 = d8 * 1;
            if (p8 >= 10) {
              p8 -= 9;
            }
            p9 = d9 * 2;
            if (p9 >= 10) {
              p9 -= 9;
            }
            modulo = 10;
          } else if (d3 === 6 && num === 13) {
            /* Solo para sociedades publicas (modulo 11) */
            /* Aqui el digito verficador esta en la posicion 9, en las otras 2 en la pos. 10 */
            pub = true;
            p1 = d1 * 3;
            p2 = d2 * 2;
            p3 = d3 * 7;
            p4 = d4 * 6;
            p5 = d5 * 5;
            p6 = d6 * 4;
            p7 = d7 * 3;
            p8 = d8 * 2;
            p9 = 0;
            modulo = 11;
          } else if (d3 === 9) {
            /* Solo para entidades privadas (modulo 11) */
            pri = true;
            p1 = d1 * 4;
            p2 = d2 * 3;
            p3 = d3 * 2;
            p4 = d4 * 7;
            p5 = d5 * 6;
            p6 = d6 * 5;
            p7 = d7 * 4;
            p8 = d8 * 3;
            p9 = d9 * 2;
            modulo = 11;
          }

          suma = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          residuo = suma % modulo;

          /* Si residuo=0, dig.ver.=0, caso contrario 10 - residuo*/
          const digitoVerificador = residuo === 0 ? 0 : modulo - residuo;

          /* Ahora comparamos el elemento de la posicion 10 con el dig. ver.*/
          if (pub) {
            if (digitoVerificador !== d9) {
              validation.message =
                'El RUC de la empresa del sector público es incorrecto.';
              validation.isValid = false;
            }
            /* El ruc de las empresas del sector publico terminan con 0001*/
            if (+(id.substr(9, 4) !== '0001')) {
              validation.message =
                'El RUC de la empresa del sector público debe terminar con 0001';
              validation.isValid = false;
            }
          } else if (pri) {
            if (digitoVerificador !== d10) {
              validation.message =
                'El RUC de la empresa del sector privado es incorrecto.';
              validation.isValid = false;
            }
            if (+(id.substr(10, 3) !== '001')) {
              validation.message =
                'El RUC de la empresa del sector privado debe terminar con 001';
              validation.isValid = false;
            }
          } else if (nat) {
            if (digitoVerificador !== d10) {
              validation.message =
                'El número de cédula de la persona natural es incorrecto.';
              validation.isValid = false;
            }
            if (id.length > 10 && +(id.substr(10, 3) !== '001')) {
              validation.message =
                'El RUC de la persona natural debe terminar con 001';
              validation.isValid = false;
            }
          }
        } else {
          validation.message =
            'El numero de identificación ingresado no es valido para el Ecuador';
          validation.isValid = false;
        }
        return validation;
      } else {
        validation.message =
          'El numero de identificación ingresado no es valido para el Ecuador';
        validation.isValid = false;
        return validation;
      }
    } else {
      validation.isValid = false;
      validation.message = 'No tiene documento';
      return validation;
    }
  }

  async validateEmail(
    email: string,
  ): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const quickValidationErrors = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      invalid_email: 'Specified email has invalid email address syntax',
      // eslint-disable-next-line @typescript-eslint/camelcase
      invalid_domain: 'Domain name does not exist',
      // eslint-disable-next-line @typescript-eslint/camelcase
      rejected_email: 'SMTP server rejected email. Email does not exist',
      // eslint-disable-next-line @typescript-eslint/camelcase
      accepted_email: 'SMTP server accepted email address',
      // eslint-disable-next-line @typescript-eslint/camelcase
      no_connect: 'SMTP server connection failure',
      // eslint-disable-next-line @typescript-eslint/camelcase
      timeout: 'Session time out occurred at SMTP server',
      // eslint-disable-next-line @typescript-eslint/camelcase
      unavailable_smtp: 'SMTP server is not available to process request',
      // eslint-disable-next-line @typescript-eslint/camelcase
      unexpected_error: 'An unexpected error has occurred',
      // eslint-disable-next-line @typescript-eslint/camelcase
      no_mx_record: 'Could not get MX records for domain',
      // eslint-disable-next-line @typescript-eslint/camelcase
      temporarily_blocked: 'Email is temporarily greylisted',
      // eslint-disable-next-line @typescript-eslint/camelcase
      exceeded_storage:
        'SMTP server rejected email. Exceeded storage allocation',
    };
    // tslint:disable-next-line:max-line-length
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const validation = {
      message: '',
      isValid: true,
    };

    const quickEmailVerificationKey = this.configService.get(
      'QUICK_EMAIL_VERIFICATION_KEY',
    );
    const validateEmails = this.configService.get('GM_VALIDATE_EMAILS');
    if (quickEmailVerificationKey) {
      const client = QuickEmailVerification.client(
        quickEmailVerificationKey,
      ).quickemailverification();

      // verify with QuickEmailVerification and validate email syntax before sending to QEV
      if (email && emailRegexp.test(email)) {
        // only if validation is actived in dev otherwise email is always valid
        if (validateEmails) {
          try {
            const validationPromise = new Promise(resolve => {
              client.verify(email, (err, response) => {
                if (err) {
                  validation.isValid = false;
                  validation.message = `${email} - ${err}`;
                } else {
                  validation.isValid = response.body.result === 'valid';
                  validation.message = validation.isValid
                    ? null
                    : `QEV Error: ${
                        quickValidationErrors[response.body.reason]
                      }`;
                }
                resolve();
              });
            });
            await validationPromise;
          } catch (e) {
            validation.isValid = false;
            validation.message = `${email} - ${e}`;
          }
        } else {
          validation.isValid = true;
        }
      } else {
        validation.isValid = false;
        validation.message = 'Invalid Email Syntax';
      }
    }

    return validation;
  }

  /**
   * Temporal Function to normalize names
   * @param record Lead | SourcedLead
   */
  normalizeNames(record: Lead | SourcedLead) {
    if (record.names) {
      const [name1, name2] = record.names.split(' ');
      record.name1 = name1;
      record.name2 = name2;
    } else {
      record.name1 = record.names;
    }
    if (record.lastNames) {
      const [lastName1, lastName2] = record.lastNames.split(' ');
      record.lastName1 = lastName1;
      record.lastName2 = lastName2;
    } else {
      record.lastName1 = record.lastNames;
    }
  }

  /**
   * Parse date and tim
   * @param dateString Date to parse
   * @param returnNullIfInvalid The function will return null when the date is invalid
   */
  parseDateString(
    dateString: string,
    returnNullIfInvalid = false,
  ): Date | null {
    if (!dateString) {
      return null;
    }

    // creationDate seems to come in the format "M/d/yyyy  HH:MM:SS"
    // but we only care for the part before the spaces
    const parts = dateString.split(' ');
    let format = 'M/d/yy';
    // Check several formats
    let result = parse(parts[0], 'M/d/yy', new Date());
    if (result.toString() === 'Invalid Date') {
      format = 'M/d/yyyy';
      result = parse(parts[0], 'M/d/yyyy', new Date());
    }
    if (result.toString() === 'Invalid Date') {
      format = 'd/M/yy';
      result = parse(parts[0], 'd/M/yy', new Date());
    }
    if (result.toString() === 'Invalid Date') {
      format = 'd/M/yyyy';
      result = parse(parts[0], 'd/M/yyyy', new Date());
    }

    // verify final format including time
    if (result.toString() !== 'Invalid Date') {
      let timeformat = 'HH:mm';
      if (parts.length > 1) {
        const timparts = parts[1].split(':');
        if (timparts.length > 2) {
          timeformat = 'HH:mm:ss';
        }
      }
      format = parts.length > 1 ? `${format} ${timeformat}` : format;
      result = parse(dateString, format, new Date());
    }

    if (result.toString() === 'Invalid Date' && returnNullIfInvalid) {
      return null;
    }

    return result;
  }

  parseDMYDateString(dateString: string, returnNullIfInvalid = false): Date {
    // Add timezone to date so parse wont assume it's on UTC-0
    const dateWithTimezone = `${dateString} -05`;
    let result = parse(
      dateWithTimezone,
      'd/M/yyyy hh:mm:ss aaaa x',
      new Date(),
    );
    if (result.toString() === 'Invalid Date') {
      // Check for dates without hh:mm:ss aaaa and 2 digit years
      result = parse(dateWithTimezone, 'd/M/yy x', new Date());
    }
    if (result.toString() === 'Invalid Date') {
      // Check for dates without hh:mm:ss aaaa
      result = parse(dateWithTimezone, 'd/M/yyyy x', new Date());
    }
    if (returnNullIfInvalid && result.toString() === 'Invalid Date') {
      return null;
    }
    return result;
  }

  parseMDYDateString(dateString: string, returnNullIfInvalid = false): Date {
    const result = parse(dateString, 'M/d/yy', new Date());
    if (returnNullIfInvalid && result.toString() === 'Invalid Date') {
      return null;
    }
    return result;
  }

  parseNumberString(numberString: string): number {
    const numberWithoutExtras = numberString.replace('S/', '').replace(',', '');
    return Number(numberWithoutExtras);
  }

  /**
   * Create Errors File Locally
   * @param fileDestination File Destination to Create File
   * @param errors Errors array
   * @param errorHeaders Errors Header Row
   */
  async createErrorsFile(
    fileDestination: string,
    errors: ValidationError[],
    errorHeaders: string[],
  ) {
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: fileDestination,
    });
    const worksheet = workbook.addWorksheet('Errores');
    worksheet.addRow(errorHeaders);
    for (const err of errors) {
      worksheet.addRow([err.rowNumber, err.errors.join(' '), ...err.row]);
    }
    worksheet.commit();
    await workbook.commit();
  }

  getTemporalExpirationPasswordDate() {
    // The new created users have their password with just 4 days to change it
    const timeToExpirePasswordInDays = 4;

    const credentialsExpireAt = addDays(new Date(), timeToExpirePasswordInDays);

    return credentialsExpireAt;
  }

  getExpirationPasswordDate() {
    const timeToExpirePasswordInMonths = 6;

    const credentialsExpireAt = addMonths(
      new Date(),
      timeToExpirePasswordInMonths,
    );

    return credentialsExpireAt;
  }

  getCutOffDateAndWeek() {
    const todaysDay = new Date().getDay();
    let isTheSameWeek = false;
    let cutOffDay = 0;
    // Verify if is the same week or not, based on the Cut Off Day of the instance
    switch (this.instanceSlug) {
      case 'cl':
        isTheSameWeek = todaysDay >= 2 && todaysDay <= 6;
        cutOffDay = 1; // Monday is the cut off day
        break;
      case 'pe':
        isTheSameWeek = todaysDay >= 3 && todaysDay <= 6;
        cutOffDay = 2; // Tuesday is the cut off day
        break;
      default:
        isTheSameWeek = todaysDay === 5 || todaysDay === 6;
        cutOffDay = 4; // By default, to EC and CO is Thursday
        break;
    }

    return {
      cutOffDay,
      isTheSameWeek,
    };
  }
}
