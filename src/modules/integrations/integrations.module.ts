import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AivoService } from './aivo/aivo.service';
import { AgentConversation } from './agentConversation.entity';
import { Conversation } from './conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentConversation]),
    TypeOrmModule.forFeature([Conversation]),
    HttpModule,
  ],
  providers: [AivoService],
  exports: [AivoService],
})
export class IntegrationsModule {}
