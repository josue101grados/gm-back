// import { ConfigService } from '@nestjs/config';
import { Injectable, HttpException, Inject, forwardRef } from '@nestjs/common';
// import { ElasticsearchService } from '@nestjs/elasticsearch';
// import { SearchResponse } from 'elasticsearch';
// import { FunnelsService } from 'modules/funnels/funnels.service';
// import * as ora from 'ora';
// import { Funnel } from 'modules/funnels/funnel.entity';
// import { FunnelLead } from './elasticsearch.dto';
// import { ApiResponse } from '@elastic/elasticsearch';
// import { get } from 'lodash';
// import moment = require('moment');
// import { SearchEventsData } from 'modules/events/dto/SearchEventsData.dto';

@Injectable()
export class SearchService {
  //   private instanceSlug;
  //   constructor(
  //     private configService: ConfigService,
  //     private readonly client: ElasticsearchService,
  //     @Inject(forwardRef(() => FunnelsService))
  //     private funnelsService: FunnelsService,
  //   ) {
  //     this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  //     this.client.ping().catch(err => {
  //       throw new HttpException(
  //         {
  //           status: 'error',
  //           message: 'Unable to reach Elasticsearch cluster',
  //         },
  //         500,
  //       );
  //     });
  //   }
  //   /**
  //    * Rebuils Leads Index
  //    * @param spin
  //    */
  //   async rebuildLeadsIndex(spin: ora.Ora) {
  //     const indexName = 'leads';
  //     const exists = await this.client.indices.exists({
  //       index: indexName,
  //     });
  //     if (exists.body) {
  //       await this.client.indices.delete({ index: indexName });
  //       spin.succeed('Index Leads Deleted');
  //     }
  //     await this.client.indices.create({
  //       index: indexName,
  //       body: {
  //         mappings: {
  //           properties: {
  //             id: {
  //               type: 'integer',
  //               index: false,
  //             },
  //             instance: { type: 'keyword' },
  //             opportunityName: { type: 'keyword' },
  //             campaign: { type: 'text' },
  //             modelId: { type: 'integer' },
  //             model: { type: 'keyword' },
  //             family: { type: 'keyword' },
  //             dealerDealership: { type: 'text' },
  //             dealerGroupId: { type: 'integer' },
  //             dealerGroup: { type: 'keyword' },
  //             dealerGroupDerivedLink: { type: 'text' },
  //             document: { type: 'keyword' },
  //             date: { type: 'date' },
  //             creationDate: { type: 'date' },
  //             status: { type: 'keyword' },
  //             isValid: { type: 'boolean' },
  //             email: { type: 'keyword' },
  //             source: { type: 'text' },
  //             names: { type: 'text' },
  //             lastNames: { type: 'text' },
  //             name1: { type: 'text' },
  //             name2: { type: 'text' },
  //             lastName1: { type: 'text' },
  //             lastName2: { type: 'text' },
  //             phone: { type: 'text' },
  //             workPhone: { type: 'text' },
  //             mobile: { type: 'text' },
  //             city: { type: 'text' },
  //             vin: { type: 'keyword' },
  //             createdAt: { type: 'date' },
  //             funnelId: { type: 'integer' },
  //             sourcedLeadId: {
  //               type: 'integer',
  //               index: false,
  //             },
  //             clickOnWhatsapp: { type: 'boolean' },
  //             clickOnWhatsappDate: { type: 'date' },
  //             clickOnCallUs: { type: 'boolean' },
  //             clickOnCallUsDate: { type: 'date' },
  //             clickOnHeader: { type: 'boolean' },
  //             clickOnHeaderDate: { type: 'date' },
  //             clickOnModel: { type: 'boolean' },
  //             clickOnModelDate: { type: 'date' },
  //             clickOnFindUs: { type: 'boolean' },
  //             clickOnFindUsDate: { type: 'date' },
  //             emailType: { type: 'keyword' },
  //             inxaitDownloadAt: { type: 'date' },
  //             smsSent: { type: 'boolean' },
  //             emailSent: { type: 'boolean' },
  //             sendDate: { type: 'date' },
  //             openDate: { type: 'date' },
  //             clickDate: { type: 'date' },
  //             bouncedDate: { type: 'date' },
  //             eventId: { type: 'integer' },
  //             eventUserId: { type: 'integer' },
  //             eventUserFullName: { type: 'text' },
  //             eventType: { type: 'keyword' },
  //             eventExceptionReason: { type: 'text' },
  //             eventStatus: { type: 'keyword' },
  //             eventStartDate: { type: 'date' },
  //             eventEndDate: { type: 'date' },
  //             eventRequestedDate: { type: 'date' },
  //             eventNotInterestedReason: { type: 'keyword' },
  //             eventCancellationReason: { type: 'text' },
  //             eventEstimatedPurchaseDate: { type: 'keyword' },
  //             eventRequiresFinancing: { type: 'boolean' },
  //             eventFirstVehicle: { type: 'boolean' },
  //             eventHasAnotherChevrolet: { type: 'boolean' },
  //             eventOtherBrandConsidering: { type: 'boolean' },
  //             eventComments: { type: 'text' },
  //             eventAppointmentFulfilled: { type: 'boolean' },
  //             eventDerived: { type: 'boolean' },
  //             eventTimesReagent: { type: 'integer' },
  //             eventSaleStatus: { type: 'keyword' },
  //             eventMoneyToBuy: { type: 'double' },
  //             eventSellerName: { type: 'text' },
  //             eventSellerLastName: { type: 'text' },
  //             eventCreatedAt: { type: 'date' },
  //             eventQuoteAsked: { type: 'boolean' },
  //             eventCreditRequested: { type: 'boolean' },
  //             eventCreditApproved: { type: 'boolean' },
  //             eventPurchasePostponed: { type: 'boolean' },
  //             eventReservation: { type: 'boolean' },
  //             eventDifferentIdSale: { type: 'boolean' },
  //             eventBilled: { type: 'boolean' },
  //           },
  //         },
  //       },
  //     });
  //     spin.succeed('Index Leads Created');
  //     await this.client.indices.putSettings({
  //       index: indexName,
  //       body: {
  //         'index.blocks.read_only_allow_delete': null,
  //       },
  //     });
  //   }
  //   /**
  //    * Rebuils Leads Index
  //    * @param spin
  //    */
  //   async indexLeadsWithFunnel(spin: ora.Ora) {
  //     let skip = 0;
  //     const take = 500;
  //     let funnels = [];
  //     let count = 0;
  //     do {
  //       funnels = await this.funnelsService.getLeadsWithFunnel(skip, take);
  //       for (const funnel of funnels) {
  //         spin.info(`Indexing Lead ${funnel.lead.opportunityName}`);
  //         await this.indexLeadFunnel(funnel);
  //       }
  //       skip += take;
  //       count += funnels.length;
  //     } while (funnels.length > 0);
  //     spin.info(`Indexed Leads: ${count}`);
  //   }
  //   /**
  //    * Index a Lead Funnel
  //    * @param funnel
  //    */
  //   async indexLeadFunnel(funnel: Funnel) {
  //     let data = {
  //       id: funnel.lead.id,
  //       instance: this.instanceSlug,
  //       opportunityName: funnel.lead.opportunityName,
  //       campaign: get(funnel, 'lead.campaign.name', null),
  //       modelId: get(funnel, 'lead.model.id', null),
  //       model: get(funnel, 'lead.model.model', null),
  //       family: get(funnel, 'lead.model.family', null),
  //       dealerDealership: get(funnel, 'lead.dealerDealership.name', null),
  //       dealerGroupId: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.id',
  //         null,
  //       ),
  //       dealerGroup: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.name',
  //         null,
  //       ),
  //       dealerGroupDerivedLink: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.derivedLink',
  //         null,
  //       ),
  //       document: funnel.lead.document,
  //       date: funnel.lead.date,
  //       creationDate: funnel.lead.creationDate,
  //       status: funnel.lead.status,
  //       isValid: funnel.lead.isValid,
  //       email: funnel.lead.email,
  //       source: funnel.lead.source,
  //       names: funnel.lead.names,
  //       lastNames: funnel.lead.lastNames,
  //       name1: funnel.lead.name1,
  //       name2: funnel.lead.name2,
  //       lastName1: funnel.lead.lastName1,
  //       lastName2: funnel.lead.lastName2,
  //       phone: funnel.lead.phone,
  //       workPhone: funnel.lead.workPhone,
  //       mobile: funnel.lead.mobile,
  //       city: funnel.lead.city ? funnel.lead.city.name : null,
  //       vin: funnel.lead.vin,
  //       createdAt: funnel.lead.createdAt,
  //       funnelId: funnel.id,
  //       sourcedLeadId: funnel.sourcedLead ? funnel.sourcedLead.id : null,
  //       clickOnWhatsapp: funnel.clickOnWhatsapp,
  //       clickOnWhatsappDate: funnel.clickOnWhatsappDate,
  //       clickOnCallUs: funnel.clickOnCallUs,
  //       clickOnCallUsDate: funnel.clickOnCallUsDate,
  //       clickOnFindUs: funnel.clickOnFindUs,
  //       clickOnFindUsDate: funnel.clickOnFindUsDate,
  //       clickOnHeader: funnel.clickOnHeader,
  //       clickOnHeaderDate: funnel.clickOnHeaderDate,
  //       clickOnModel: funnel.clickOnModel,
  //       clickOnModelDate: funnel.clickOnModelDate,
  //       emailType: funnel.emailType,
  //       inxaitDownloadAt: funnel.inxaitDownloadAt,
  //       smsSent: funnel.sms,
  //       emailSent: funnel.email,
  //       sendDate: funnel.sendDate,
  //       openDate: funnel.openDate,
  //       clickDate: funnel.clickDate,
  //       bouncedDate: funnel.bouncedDate,
  //     };
  //     const events = await funnel.events;
  //     if (events && events.length > 0) {
  //       const event = events[events.length - 1];
  //       const eventData = {
  //         eventId: event.id,
  //         eventUserId: event.userId,
  //         eventUserFullName: event.userFullName,
  //         eventType: event.type,
  //         eventExceptionReason: event.exceptionReason,
  //         eventStatus: event.status,
  //         eventNotInterestedReason: event.notInterestedReason,
  //         eventStartDate: event.startDate,
  //         eventEndDate: event.endDate,
  //         eventRequestedDate: event.requestedDate,
  //         eventCancellationReason: event.cancellationReason,
  //         eventEstimatedPurchaseDate: event.estimatedPurchaseDate,
  //         eventRequiresFinancing: event.requiresFinancing,
  //         eventFirstVehicle: event.firstVehicle,
  //         eventHasAnotherChevrolet: event.hasAnotherChevrolet,
  //         eventOtherBrandConsidering: event.otherBrandConsidering,
  //         eventComments: event.comments,
  //         eventAppointmentFulfilled: event.appointmentFulfilled,
  //         eventDerived: event.derived,
  //         eventTimesReagent: event.timesReagent,
  //         eventSaleStatus: event.saleStatus,
  //         eventMoneyToBuy: event.moneyToBuy,
  //         eventSellerName: event.sellerName,
  //         eventSellerLastName: event.sellerLastName,
  //         eventCreatedAt: event.createdAt,
  //         eventQuoteAsked: event.quoteAsked,
  //         eventCreditRequested: event.creditRequested,
  //         eventCreditApproved: event.creditApproved,
  //         eventPurchasePostponed: event.purchasePostponed,
  //         eventReservation: event.reservation,
  //         eventDifferentIdSale: event.differentIdSale,
  //         eventBilled: event.billed,
  //       };
  //       data = { ...data, ...eventData };
  //     }
  //     return await this.client.index({
  //       id: `${this.instanceSlug}-${funnel.id}`,
  //       index: 'leads',
  //       // type: '_doc', // uncomment this line if you are using {es} ≤ 6
  //       body: data,
  //     });
  //   }
  //   /**
  //    * Search a Lead Funnel
  //    * @param funnel
  //    */
  //   async searchLeadFunnel(
  //     search: string,
  //   ): Promise<ApiResponse<SearchResponse<FunnelLead>>> {
  //     // should is OR and must is AND
  //     // we may need to split search or add several fields to serach by specific fields
  //     return await this.client.search({
  //       index: 'leads',
  //       body: {
  //         size: 10, // bring the first 10 occurrences
  //         query: {
  //           bool: {
  //             should: [
  //               {
  //                 match: {
  //                   document: search,
  //                 },
  //               },
  //               {
  //                 match: {
  //                   email: search,
  //                 },
  //               },
  //               {
  //                 match: {
  //                   names: search,
  //                 },
  //               },
  //               {
  //                 match: {
  //                   lastNames: search,
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     });
  //   }
  //   /**
  //    * Search a Lead Funnel to download for inxait
  //    */
  //   async searchLeadFunnelToDownload() {
  //     const { body } = await this.client.sql.query({
  //       body: {
  //         query: `SELECT *
  //           FROM "leads"
  //           WHERE "emailType" LIKE 'live_store'
  //           AND "inxaitDownloadAt" IS NULL
  //           ORDER BY "createdAt" ASC`,
  //       },
  //     });
  //     let data = body.rows.map(row => {
  //       const obj = {};
  //       for (let i = 0; i < row.length; i++) {
  //         obj[body.columns[i].name] = row[i];
  //       }
  //       return obj;
  //     });
  //     if (body.cursor) {
  //       let cursorResponse = await this.client.sql.query({
  //         body: {
  //           cursor: body.cursor,
  //         },
  //       });
  //       do {
  //         const cursorData = cursorResponse.body.rows.map(row => {
  //           const obj = {};
  //           for (let i = 0; i < row.length; i++) {
  //             obj[body.columns[i].name] = row[i];
  //           }
  //           return obj;
  //         });
  //         data = [...data, ...cursorData];
  //         cursorResponse = await this.client.sql.query({
  //           body: {
  //             cursor: body.cursor,
  //           },
  //         });
  //       } while (cursorResponse.body.cursor);
  //     }
  //     return data;
  //   }
  //   /**
  //    * Search a Lead for consierge or callcenter dealer
  //    */
  //   async findOneFunnelByDocumentOrPhone(
  //     documentOrPhone,
  //     dealerGroup = null,
  //     derived = null,
  //   ) {
  //     let and = '';
  //     let orderBy = ' ORDER BY creationDate DESC';
  //     // for dealers get the leads of the dealer
  //     if (dealerGroup) {
  //       // eslint-disable-next-line prettier/prettier
  //       and = ` AND dealerGroup = '${dealerGroup.name}' `;
  //       // for consierge get leads creationDate from 120 days ago and get the oldest without event
  //     } else {
  //       and = ` AND creationDate >= (TODAY() - INTERVAL 120 DAYS) AND (eventId IS NULL OR eventStatus = 'COMPLETADO' OR eventStatus = 'CANCELADO' OR eventStatus = 'CADUCADO')`;
  //       // TODO: maybe consider in the future more than one event or CANCELED
  //       orderBy = ' ORDER BY creationDate ASC';
  //     }
  //     if (derived !== null) {
  //       if (parseInt(derived, 10) === 1) {
  //         and += ` AND eventDerived = true `;
  //       } else {
  //         and += ` AND eventDerived = false `;
  //       }
  //     }
  //     const query = `
  //       SELECT *
  //       FROM leads
  //       WHERE emailType = 'live_store'
  //       ${and}
  //       AND (
  //         QUERY('email:*${documentOrPhone}*')
  //         OR QUERY('document:*${documentOrPhone}*')
  //         OR QUERY('phone:*${documentOrPhone}*')
  //         OR QUERY('workPhone:*${documentOrPhone}*')
  //         OR QUERY('mobile:*${documentOrPhone}*')
  //       )
  //       ${orderBy}
  //       `;
  //     const { body } = await this.client.sql.query({
  //       body: {
  //         query,
  //       },
  //     });
  //     const data = body.rows.map(row => {
  //       const obj = {};
  //       for (let i = 0; i < row.length; i++) {
  //         obj[body.columns[i].name] = row[i];
  //       }
  //       return obj;
  //     });
  //     if (data) {
  //       return data;
  //     } else {
  //       return null;
  //     }
  //   }
  //   /**
  //    * Updates leads funnel in bulk
  //    */
  //   async bulkUpdateLeadFunnel(funnelIds: number[], doc) {
  //     const data = funnelIds.map(funnelId => [
  //       {
  //         update: {
  //           _id: `${this.instanceSlug}-${funnelId}`,
  //           _index: 'leads',
  //         },
  //       },
  //       doc,
  //     ]);
  //     return await this.client.bulk({
  //       body: data.reduce((a, b) => a.concat(b)),
  //     });
  //   }
  //   /**
  //    * Updates one lead funnel
  //    */
  //   async updateLeadFunnel(funnel: Funnel) {
  //     let data = {
  //       opportunityName: funnel.lead.opportunityName,
  //       campaign: get(funnel, 'lead.campaign.name', null),
  //       modelId: get(funnel, 'lead.model.id', null),
  //       model: get(funnel, 'lead.model.model', null),
  //       family: get(funnel, 'lead.model.family', null),
  //       dealerDealership: get(funnel, 'lead.dealerDealership.name', null),
  //       dealerGroupId: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.id',
  //         null,
  //       ),
  //       dealerGroup: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.name',
  //         null,
  //       ),
  //       dealerGroupDerivedLink: get(
  //         funnel,
  //         'lead.dealerDealership.dealerCity.dealerGroup.derivedLink',
  //         null,
  //       ),
  //       document: funnel.lead.document,
  //       date: funnel.lead.date,
  //       creationDate: funnel.lead.creationDate,
  //       status: funnel.lead.status,
  //       isValid: funnel.lead.isValid,
  //       email: funnel.lead.email,
  //       source: funnel.lead.source,
  //       names: funnel.lead.names,
  //       lastNames: funnel.lead.lastNames,
  //       name1: funnel.lead.name1,
  //       name2: funnel.lead.name2,
  //       lastName1: funnel.lead.lastName1,
  //       lastName2: funnel.lead.lastName2,
  //       phone: funnel.lead.phone,
  //       workPhone: funnel.lead.workPhone,
  //       mobile: funnel.lead.mobile,
  //       city: funnel.lead.city ? funnel.lead.city.name : null,
  //       vin: funnel.lead.vin,
  //       createdAt: funnel.lead.createdAt,
  //       funnelId: funnel.id,
  //       sourcedLeadId: funnel.sourcedLead ? funnel.sourcedLead.id : null,
  //       clickOnWhatsapp: funnel.clickOnWhatsapp,
  //       clickOnWhatsappDate: funnel.clickOnWhatsappDate,
  //       clickOnCallUs: funnel.clickOnCallUs,
  //       clickOnCallUsDate: funnel.clickOnCallUsDate,
  //       clickOnFindUs: funnel.clickOnFindUs,
  //       clickOnFindUsDate: funnel.clickOnFindUsDate,
  //       clickOnHeader: funnel.clickOnHeader,
  //       clickOnHeaderDate: funnel.clickOnHeaderDate,
  //       clickOnModel: funnel.clickOnModel,
  //       clickOnModelDate: funnel.clickOnModelDate,
  //       emailType: funnel.emailType,
  //       inxaitDownloadAt: funnel.inxaitDownloadAt,
  //       smsSent: funnel.sms,
  //       emailSent: funnel.email,
  //       sendDate: funnel.sendDate,
  //       openDate: funnel.openDate,
  //       clickDate: funnel.clickDate,
  //       bouncedDate: funnel.bouncedDate,
  //     };
  //     const events = await funnel.events;
  //     if (events && events.length > 0) {
  //       const event = events[events.length - 1];
  //       const evenData = {
  //         eventId: event.id,
  //         eventUserId: event.userId,
  //         eventUserFullName: event.userFullName,
  //         eventType: event.type,
  //         eventExceptionReason: event.exceptionReason,
  //         eventStatus: event.status,
  //         eventNotInterestedReason: event.notInterestedReason,
  //         eventStartDate: event.startDate,
  //         eventEndDate: event.endDate,
  //         eventRequestedDate: event.requestedDate,
  //         eventCancellationReason: event.cancellationReason,
  //         eventEstimatedPurchaseDate: event.estimatedPurchaseDate,
  //         eventRequiresFinancing: event.requiresFinancing,
  //         eventFirstVehicle: event.firstVehicle,
  //         eventHasAnotherChevrolet: event.hasAnotherChevrolet,
  //         eventOtherBrandConsidering: event.otherBrandConsidering,
  //         eventComments: event.comments,
  //         eventAppointmentFulfilled: event.appointmentFulfilled,
  //         eventDerived: event.derived,
  //         eventTimesReagent: event.timesReagent,
  //         eventSaleStatus: event.saleStatus,
  //         eventMoneyToBuy: event.moneyToBuy,
  //         eventSellerName: event.sellerName,
  //         eventSellerLastName: event.sellerLastName,
  //         eventCreatedAt: event.createdAt,
  //         eventQuoteAsked: event.quoteAsked,
  //         eventCreditRequested: event.creditRequested,
  //         eventCreditApproved: event.creditApproved,
  //         eventPurchasePostponed: event.purchasePostponed,
  //         eventReservation: event.reservation,
  //         eventDifferentIdSale: event.differentIdSale,
  //         eventBilled: event.billed,
  //       };
  //       data = { ...data, ...evenData };
  //     }
  //     return await this.client.update({
  //       id: `${this.instanceSlug}-${funnel.id}`,
  //       index: 'leads',
  //       body: {
  //         doc: data,
  //       },
  //     });
  //   }
  //   /**
  //    * Updates one lead funnel with inxait data
  //    */
  //   async updateLeadFunnelInxaitData(funnel: Funnel) {
  //     return await this.client.update({
  //       id: `${this.instanceSlug}-${funnel.id}`,
  //       index: 'leads',
  //       body: {
  //         doc: {
  //           smsSent: funnel.sms,
  //           emailSent: funnel.email,
  //           sendDate: funnel.sendDate,
  //           openDate: funnel.openDate,
  //           clickDate: funnel.clickDate,
  //           bouncedDate: funnel.bouncedDate,
  //         },
  //       },
  //     });
  //   }
  //   /**
  //    * Search Events
  //    */
  //   async searchEvents(searchEventFilters: SearchEventsData) {
  //     const {
  //       from,
  //       to,
  //       expert,
  //       dealerGroup,
  //       model,
  //       date,
  //       funnelId,
  //       type,
  //       status,
  //       instance,
  //     } = searchEventFilters;
  //     let query = 'SELECT * FROM leads WHERE eventId IS NOT NULL';
  //     const conditions = [];
  //     if (from) {
  //       const fromDate = moment(from);
  //       conditions.push(
  //         ` eventStartDate >= '${fromDate.format('YYYY-MM-DD')}T00:00:00' `,
  //       );
  //     }
  //     if (to) {
  //       const toDate = moment(to);
  //       conditions.push(
  //         ` eventEndDate <= '${toDate.format('YYYY-MM-DD')}T23:59:59' `,
  //       );
  //     }
  //     if (expert) {
  //       conditions.push(` eventUserId = ${expert} `);
  //     }
  //     if (dealerGroup) {
  //       conditions.push(` dealerGroupId = ${dealerGroup} `);
  //     }
  //     if (date) {
  //       const startDate = moment(date);
  //       conditions.push(` eventStartDate = '${startDate.toISOString()}' `);
  //     }
  //     if (model) {
  //       conditions.push(` model = '${model}' `);
  //     }
  //     if (funnelId) {
  //       conditions.push(` funnelId = '${funnelId}' `);
  //     }
  //     if (type) {
  //       conditions.push(` eventType = '${type}' `);
  //     }
  //     if (status) {
  //       conditions.push(` eventStatus = '${status}' `);
  //     }
  //     if (instance) {
  //       conditions.push(` instance = '${instance}' `);
  //     }
  //     if (conditions.length > 0) {
  //       query += ' AND ';
  //     }
  //     query += conditions.join('AND');
  //     query += ' ORDER BY eventUserId ASC, eventStartDate ASC';
  //     // console.log('query', query);
  //     const { body } = await this.client.sql.query({
  //       body: {
  //         query,
  //       },
  //     });
  //     const data = body.rows.map(row => {
  //       const obj = {};
  //       for (let i = 0; i < row.length; i++) {
  //         obj[body.columns[i].name] = row[i];
  //       }
  //       return obj;
  //     });
  //     console.log('Elastic: ', data.length);
  //     return data;
  //   }
}
