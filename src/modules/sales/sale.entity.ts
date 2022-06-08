import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { City } from '../cities/city.entity';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { Model } from '../models/model.entity';
import { Lead } from '../leads/lead.entity';
import { Zone } from '../zones/zone.entity';

@Entity({
  name: 'sales',
})
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column({ length: 255, comment: 'Nº de Identificación del Vehículo' })
  vin: string;

  @Column({ length: 20, comment: 'Número del Cupón', nullable: true })
  couponNumber: string;

  @Column('boolean', { default: false, comment: 'Validación' })
  validation: boolean;

  @Column({ type: 'timestamp', comment: 'Fecha de Registro' })
  registerDate: Date;

  @Column({ length: 255, comment: 'Zona', nullable: true })
  zoneName: string;

  @ManyToOne(
    type => Zone,
    zone => zone.sales,
  )
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ length: 255, comment: 'Región', nullable: true })
  region: string;

  @Column({ length: 255, comment: 'Provincia', nullable: true })
  province: string;

  @Column({ length: 255, comment: 'Cuenta', nullable: true })
  dealerDealershipName: string;

  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.sales,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @Column({ length: 255, comment: 'Concesionario', nullable: true })
  dealership: string;

  @Column({ length: 255, comment: 'Cuenta BAC', nullable: true })
  dealershipBac: string;

  @Column({ type: 'timestamp', comment: 'Fecha para Reportes', nullable: true })
  reportsDate: Date;

  @Column({ comment: 'DIAS', nullable: true })
  days: number;

  @Column({ length: 100, comment: 'ZVSK', nullable: true })
  zvks: string;

  @Column({ length: 10, comment: 'MY', nullable: true })
  my: string;

  @Column({ length: 100, comment: 'KMAT', nullable: true })
  kmat: string;

  @Column({ length: 255, nullable: true })
  @Index('IDX_sales_model')
  modelName: string;

  @ManyToOne(
    type => Model,
    model => model.sales,
  )
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @Column({ length: 255, comment: 'AEADE', nullable: true })
  aeade: string;

  @Column({ length: 255, comment: 'SEGMENTO', nullable: true })
  segment: string;

  @Column({ length: 255, comment: 'FAMILIA', nullable: true })
  family: string;

  @Column({ length: 255, comment: 'TIPO DE VEHICULO', nullable: true })
  vehicleType: string;

  @Column({ length: 255, comment: 'color', nullable: true })
  color: string;

  @Column({ length: 255, comment: 'CLAVE', nullable: true })
  keySaleType: string;

  @Column({ length: 255, comment: 'VALID FLOTA', nullable: true })
  validFleet: string;

  @Column({
    type: 'timestamp',
    comment: 'Fecha de Cancelación',
    nullable: true,
  })
  cancellationDate: Date;

  @Column({
    type: 'timestamp',
    comment: 'Fecha de la Factura Retail',
    nullable: true,
  })
  retailInvoiceDate: Date;

  @Column({ length: 255, comment: 'Tipo Financiamiento', nullable: true })
  financeType: string;

  @Column({ length: 255, comment: 'Forma de Pago', nullable: true })
  paymentMethod: string;

  @Column({ length: 255, comment: 'Cia Leasing / Financiera', nullable: true })
  leasingFinancial: string;

  @Column({ length: 13, comment: 'CI Vendedor', nullable: true })
  salesmanDocument: string;

  @Column({ length: 255, comment: 'Vendedor', nullable: true })
  salesman: string;

  @Column({ length: 20, comment: 'Estatus del Cupón', nullable: true })
  couponStatus: string;

  @Column({
    length: 30,
    comment: 'Número de la Factura Retail',
    nullable: true,
  })
  retailInvoiceNumber: string;

  @Column('boolean', { default: false, comment: 'Chevystar Activado' })
  chevystar: boolean;

  @Column({ length: 30, comment: 'Clave de la Flota', nullable: true })
  keyFleet: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    comment: 'Valor Neto',
    nullable: true,
  })
  netValue: number;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    comment: 'Valor Total',
    nullable: true,
  })
  totalValue: number;

  @Column({ length: 100, comment: 'Tipo de Venta', nullable: true })
  salesType: string;

  @Column({ length: 100, comment: 'Uso', nullable: true })
  vehicleUse: string;

  @Column({ length: 255, comment: 'Zona2', nullable: true })
  zone2: string;

  @Column({ type: 'timestamp', comment: 'Fecha de Entrega', nullable: true })
  deliveryDate: Date;

  @Column({ length: 255, comment: 'Creado por', nullable: true })
  createdBy: string;

  @Column({ type: 'timestamp', comment: 'Creación: fecha', nullable: true })
  createdDate: Date;

  @Column({ length: 255, comment: 'Marca Vehículo anterior', nullable: true })
  previousVehicleBrand: string;

  @Column({ length: 255, comment: 'Modelo Vehículo anterior', nullable: true })
  previousVehicleModel: string;

  @Column({ comment: 'Año del Vehículo anterior', nullable: true })
  previousVehicleYear: number;

  @Column({ length: 255, comment: 'Causa de la Anulación', nullable: true })
  cancellationCause: string;

  @Column({ length: 255, comment: 'Compañía de Seguros', nullable: true })
  insuranceCompany: string;

  @Column({ length: 255, comment: 'Razón Social de la Cuenta', nullable: true })
  businessName: string;

  @Column({ length: 13, comment: 'Cédula de Identificación' })
  document: string;

  @Column({ length: 255, comment: 'Contacto', nullable: true })
  contact: string;

  @Column({ length: 20, comment: 'Género', nullable: true })
  gender: string;

  @Column({ type: 'datetime', comment: 'Fecha de Nacimiento', nullable: true })
  birthDate: Date;

  @Column({ length: 40, comment: 'Teléfono', nullable: true })
  phone: string;

  @Column({ length: 40, comment: 'Teléfono Residencia', nullable: true })
  homePhone: string;

  @Column({ length: 40, comment: 'Teléfono Movil', nullable: true })
  mobile: string;

  @Column({ length: 255, comment: 'Address', nullable: true })
  address: string;

  @Column({ length: 255, comment: 'E-mail', nullable: true })
  email: string;

  @Column({ length: 255, comment: 'Ciudad', nullable: true })
  cityName: string;

  @ManyToOne(
    type => City,
    city => city.sales,
  )
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ length: 255, comment: 'País', nullable: true })
  country: string;

  @Column({ comment: 'Año', nullable: true })
  vehicleYear: number;

  @Column({ length: 100, comment: 'Código del Punto de Venta', nullable: true })
  dealershipCode: string;

  @Column({
    length: 255,
    comment: 'Cuenta: ID exclusivo externo',
    nullable: true,
  })
  dealershipId: string;

  @Column({ comment: 'Duplicado', nullable: true })
  duplicated: number;

  @Column({ length: 255, comment: 'Nombre1', nullable: true })
  name1: string;

  @Column({ length: 255, comment: 'Nombre2', nullable: true })
  name2: string;

  @Column({ length: 255, comment: 'Apellido1', nullable: true })
  lastName1: string;

  @Column({ length: 255, comment: 'Apellido2', nullable: true })
  lastName2: string;

  @Column('boolean', { default: null })
  nameIsValid: boolean;

  @Column('boolean', { default: null })
  phoneIsValid: boolean;

  @Column('boolean', { default: null })
  emailIsValid: boolean;

  @Column('boolean', { default: null })
  documentIsValid: boolean;

  @Column({ length: 255, nullable: true })
  invalidEmailReason: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  instanceSlug: string;

  @Column('boolean', { default: null, nullable: true })
  isChevyPlan: boolean;

  @Column('boolean', { default: null, nullable: true })
  isFleet: boolean;

  @ManyToOne(
    () => Lead,
    leads => leads.overallSales120,
  )
  @JoinColumn({ name: 'overallLead120Id' })
  overallLead120: Lead;

  @ManyToOne(
    () => Lead,
    leads => leads.franchiseSales120,
  )
  @JoinColumn({ name: 'franchiseLead120Id' })
  franchiseLead120: Lead;

  @ManyToOne(
    () => Lead,
    leads => leads.overallSales360,
  )
  @JoinColumn({ name: 'overallLead360Id' })
  overallLead360: Lead;

  @ManyToOne(
    () => Lead,
    leads => leads.franchiseSales360,
  )
  @JoinColumn({ name: 'franchiseLead360Id' })
  franchiseLead360: Lead;

  @ManyToOne(
    () => Lead,
    leads => leads.overallSalesXTime,
  )
  @JoinColumn({ name: 'overallLeadXTimeId' })
  overallLeadXTime: Lead;

  @ManyToOne(
    () => Lead,
    leads => leads.franchiseSalesXTime,
  )
  @JoinColumn({ name: 'franchiseLeadXTimeId' })
  franchiseLeadXTime: Lead;

  @ManyToOne(
    type => Lead,
    lead => lead.sales,
  )
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(
    type => Lead,
    overallLead => overallLead.overallSales,
  )
  @JoinColumn({ name: 'overallLeadId' })
  overallLead: Lead;

  @Column('boolean', { default: null, comment: 'Válido para Club Presidente' })
  isValid: boolean;

  @Column('boolean', { default: null, comment: 'Válido para Overall' })
  isValidOverall: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}
