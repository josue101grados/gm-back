import { Injectable, Logger, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AgentConversation } from '../agentConversation.entity';
import { Conversation } from '../conversation.entity';
import moment = require('moment');

@Injectable()
export class AivoService {
  private readonly logger = new Logger(AivoService.name);
  private instanceName;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(AgentConversation)
    private agentConversationRepository: Repository<AgentConversation>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {
    this.instanceName = this.configService.get('GM_INSTANCE_NAME');
  }

  /**
   * Imports Data from Aivo API
   */
  async importAivoData() {
    const aivoUrl = 'https://api.aivo.co/api/v1/';
    const aivoAnalyticsUrl = 'https://analytics.aivo.co/api/v1/';
    const aivoEmail = this.configService.get('AIVO_EMAIL');
    const aivoPassword = this.configService.get('AIVO_PASSWORD');
    const aivoXToken = this.configService.get('AIVO_X_TOKEN');
    const importAivoData = this.configService.get('GM_IMPORT_AIVO_DATA');

    if (importAivoData) {
      try {
        const loginResponse = await this.httpService
          .post(`${aivoUrl}user/login-simple`, {
            email: aivoEmail,
            password: aivoPassword,
          })
          .toPromise();

        if (loginResponse.status === 200) {
          const bearerToken = loginResponse.data.Authorization;
          const to = moment();
          const from = moment().subtract(1, 'day');

          const agentConversationsResponse = await this.httpService
            .get(`${aivoAnalyticsUrl}live/public/conversation/list`, {
              headers: {
                'Authorization': bearerToken,
                'X-Token': aivoXToken,
              },
              params: {
                from: from.format('YYYY-MM-DD HH:mm:ss'),
                to: to.format('YYYY-MM-DD HH:mm:ss'),
                country: this.instanceName,
              },
            })
            .toPromise();

          if (agentConversationsResponse.status === 200) {
            const agentConversations = agentConversationsResponse.data;

            this.logger.log(
              `Starting to import ${
                agentConversations.length
              } Aivo Agent Conversations from ${from.format(
                'YYYY-MM-DD HH:mm:ss',
              )} to ${to.format('YYYY-MM-DD HH:mm:ss')}`,
            );

            let importedConversations = 0;

            for (const conversation of agentConversations) {
              // Check if lead was already imported
              const existsConversation = await this.agentConversationRepository.findOne(
                {
                  where: {
                    conversationId: conversation.conversation_id,
                  },
                },
              );

              if (!existsConversation) {
                this.logger.log(
                  `Importing Aivo Agent Conversation: ${conversation.conversation_id}`,
                );

                const newConversation = new AgentConversation();
                newConversation.conversationId = conversation.conversation_id;
                newConversation.botId = conversation.bot_id;
                newConversation.queueddatetime = conversation.queueddatetime;
                newConversation.startdatetime = conversation.startdatetime;
                newConversation.enddatetime = conversation.enddatetime;
                newConversation.sessionTime = conversation.session_time;
                newConversation.waitTime = conversation.wait_time;
                newConversation.groupId = conversation.group.id;
                newConversation.groupName = conversation.group.name;
                newConversation.groupDescription =
                  conversation.group.description;
                newConversation.protocolId = conversation.protocol.id;
                newConversation.protocolName = conversation.protocol.name;
                newConversation.userId = conversation.user.id;
                newConversation.userFirstName = conversation.user.first_name;
                newConversation.userLastName = conversation.user.last_name;
                newConversation.userPhone = conversation.user.phone;
                newConversation.userCreatedAt = conversation.user.created_at;
                newConversation.userExtraInformation =
                  conversation.user.extra_information;
                newConversation.agentId = conversation.agent.id;
                newConversation.agentName = conversation.agent.name;
                newConversation.agentNickName = conversation.agent.nick_name;
                newConversation.agentEmail = conversation.agent.email;
                newConversation.agentPicture = conversation.agent.picture;
                newConversation.reasonId = conversation.reason.id;
                newConversation.reasonDescription =
                  conversation.reason.description;
                newConversation.feedbackId = conversation.feedback.id;
                newConversation.feedbackName = conversation.feedback.name;
                newConversation.feedbackValue = conversation.feedback.value;
                newConversation.closedById = conversation.closed_by.id;
                newConversation.closedByName = conversation.closed_by.name;
                newConversation.locationId = conversation.location.id;
                newConversation.locationCity = conversation.location.city;
                newConversation.locationCountry = conversation.location.country;
                newConversation.locationIp = conversation.location.ip;
                newConversation.platformId = conversation.platform.id;
                newConversation.platformName = conversation.platform.name;
                newConversation.platformVersion = conversation.platform.version;
                newConversation.browserId = conversation.browser.id;
                newConversation.browserName = conversation.browser.name;
                newConversation.browserVersion = conversation.browser.version;
                await this.agentConversationRepository.save(newConversation);
                importedConversations++;
              }
            }

            this.logger.log(
              `Finished Importing ${importedConversations} Aivo Agent Conversations`,
            );
          }

          // Chat Bot Report
          // https://documenter.getpostman.com/view/3861613/RznELJjd?version=latest#a42cd331-5663-4227-9c89-904ffac4d5bb
          let importedConversations = 0;
          let page = 1;
          let conversationListResponse;

          do {
            conversationListResponse = await this.httpService
              .get(`${aivoUrl}stats/conversation/complete-list`, {
                headers: {
                  'Authorization': bearerToken,
                  'X-Token': aivoXToken,
                },
                params: {
                  from: from.format('YYYY-MM-DD HH:mm:ss'),
                  to: to.format('YYYY-MM-DD HH:mm:ss'),
                  country: this.instanceName,
                  orderBy: 'duration',
                  sort: 'desc',
                  page,
                },
              })
              .toPromise();

            if (conversationListResponse.status === 200) {
              const conversationList = conversationListResponse.data.current;
              this.logger.log(
                `Starting to import ${
                  conversationList.length
                } Aivo Conversations from ${from.format(
                  'YYYY-MM-DD HH:mm:ss',
                )} to ${to.format('YYYY-MM-DD HH:mm:ss')}`,
              );

              for (const conversation of conversationList) {
                // Check if lead was already imported
                const existsConversation = await this.conversationRepository.findOne(
                  {
                    where: {
                      conversationId: conversation.id,
                    },
                  },
                );

                if (!existsConversation) {
                  this.logger.log(
                    `Importing Aivo Conversation: ${conversation.id}`,
                  );

                  const newConversation = new Conversation();
                  newConversation.conversationId = conversation.id;
                  newConversation.tags = Array.isArray(conversation.tags)
                    ? conversation.tags.join(',')
                    : conversation.tags;
                  newConversation.date = conversation.date;
                  newConversation.duration = conversation.duration;
                  newConversation.userId = conversation.user.id;
                  newConversation.userHash = conversation.user.hash;
                  newConversation.userName = conversation.user.name;
                  newConversation.userMail = conversation.user.mail;
                  newConversation.interactionsTotal =
                    conversation.interactions.total;
                  newConversation.interactionsFeedback =
                    conversation.interactions.feedback;
                  newConversation.resolutionId = conversation.resolution.id;
                  newConversation.resolutionName = conversation.resolution.name;
                  newConversation.locationCountry =
                    conversation.location.country;
                  newConversation.locationRegion = conversation.location.region;
                  newConversation.locationCity = conversation.location.city;
                  newConversation.sourceChannelId =
                    conversation.source.channel.id;
                  newConversation.sourceChannelName =
                    conversation.source.channel.name;
                  newConversation.sourceMediaId = conversation.source.media.id;
                  newConversation.sourceMediaName =
                    conversation.source.media.name;
                  newConversation.sourceCondition =
                    conversation.source.condition.value;
                  newConversation.sourceUrl = conversation.source.url;
                  newConversation.device = conversation.device;
                  newConversation.surveyAnswered = conversation.survey.answered;
                  newConversation.surveyType = conversation.survey.type;
                  newConversation.surveyValuation =
                    conversation.survey.valuation;
                  newConversation.surveyValue = conversation.survey.value;
                  await this.conversationRepository.save(newConversation);
                  importedConversations++;
                }
              }
            }
            page++;
          } while (page <= conversationListResponse.data.metadata.pages);

          this.logger.log(
            `Finished Importing ${importedConversations} Aivo Conversations`,
          );
        }
      } catch (e) {
        this.logger.error(`Error Importing Aivo Data: ${e}`);
      }
    }
  }
}
