import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendAlertMessage(message: string): Promise<boolean> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId || token === 'tu_telegram_bot_token_aqui') {
      this.logger.warn('Telegram BOT_TOKEN o CHAT_ID no están configurados en el .env');
      return false;
    }

    const sanitizedMessage = message
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n');

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: sanitizedMessage,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        this.logger.error(`Error al enviar mensaje por Telegram: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log('📢 Alerta enviada con éxito por Telegram!');
      return true;
    } catch (error) {
      this.logger.error('Error al conectar con la API de Telegram:', error);
      return false;
    }
  }
}
