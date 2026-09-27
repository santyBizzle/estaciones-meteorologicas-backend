import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export interface AnomalyAnalysisResult {
  hayAnomalia: boolean;
  nivelRiesgo: 'CRITICO' | 'ALTO' | 'MEDIO' | 'NINGUNO';
  resumen: string;
  mensajeTelegram: string;
}

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(private readonly configService: ConfigService) {}

  async analizarMediciones(dataMediciones: any[]): Promise<AnomalyAnalysisResult | null> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const modelName = this.configService.get<string>('GEMINI_MODEL', 'gemini-3.8-flash');

    if (!apiKey || apiKey === 'tu_gemini_api_key_aqui') {
      this.logger.warn('GEMINI_API_KEY no configurada en el .env');
      return null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Eres un experto meteorólogo e ingeniero ambiental que supervisa una red de estaciones meteorológicas en tiempo real.
Analiza las siguientes mediciones recientes recolectadas de los sensores:

${JSON.stringify(dataMediciones, null, 2)}

INSTRUCCIONES DE EVALUACIÓN:
1. Revisa los valores de cada tipo de medición (Temperatura, Humedad, Presión, Velocidad del Viento, Radiación, Calidad de Aire COV, Altitud).
2. Identifica si hay alguna ANOMALÍA O SITUACIÓN DE RIESGO como:
   - Heladas o temperaturas extremadamente bajas/altas.
   - Caídas bruscas de presión atmosférica o tormentas inminentes.
   - Ráfagas peligrosas de viento.
   - Picos de radiación solar insalubres.
   - Contaminación o mala calidad del aire (COV elevados).
   - Datos corruptos o imposibles físicamente para la métrica dada.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "hayAnomalia": boolean,
  "nivelRiesgo": "CRITICO" | "ALTO" | "MEDIO" | "NINGUNO",
  "resumen": "Resumen conciso del hallazgo o anomalía",
  "mensajeTelegram": "Mensaje formateado en HTML compatible con Telegram (utiliza únicamente <b>, <i>, <code> y saltos de línea \\n; NUNCA utilices la etiqueta <br>). Mantén un tono técnico, formal y claro, detallando la estación, valores fuera de rango y recomendaciones técnicas."
}
`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      this.logger.log(`Respuesta de Gemini 3.8 Flash: ${responseText}`);

      const result: AnomalyAnalysisResult = JSON.parse(responseText);
      return result;
    } catch (error) {
      this.logger.error('Error al procesar el análisis de IA con Gemini:', error);
      return null;
    }
  }

  async responderChat(promptUsuario: string, contextoEstaciones?: any[]): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const modelName = this.configService.get<string>('GEMINI_MODEL', 'gemini-3.8-flash');

    if (!apiKey || apiKey === 'tu_gemini_api_key_aqui') {
      return 'Por favor configura tu GEMINI_API_KEY en el archivo .env del backend para activar el asistente de IA.';
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
Eres el Asistente Técnico de Inteligencia Artificial para la Red de Estaciones Meteorológicas.
Tu trabajo es responder las preguntas del usuario sobre las condiciones meteorológicas actuales, análisis ambiental y recomendaciones técnicas o agrícolas.

CONTEXTO DE TELEMETRÍA DE LAS ESTACIONES METEOROLÓGICAS:
${contextoEstaciones && contextoEstaciones.length > 0 ? JSON.stringify(contextoEstaciones, null, 2) : 'Sin telemetría reciente.'}

PREGUNTA O INSTRUCCIÓN DEL USUARIO:
"${promptUsuario}"

INSTRUCCIONES DE RESPUESTA:
- Utiliza un lenguaje estrictamente profesional, formal, técnico y conciso.
- NO utilices emojis ni expresiones informales.
- Cita los datos de las estaciones con precisión cuando estén disponibles.
`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: systemPrompt,
      });

      return response.text || 'No se obtuvo respuesta del modelo de IA.';
    } catch (error) {
      this.logger.error('Error en responderChat de Gemini:', error);
      return 'Ocurrió un error al comunicarse con Gemini IA. Por favor verifica tus credenciales o intenta más tarde.';
    }
  }
}
