import { GoogleGenAI } from "@google/genai";
import { assertGeminiConfigured } from "@/lib/env";
import {
  RoadmapAIResponseSchema,
  type BusinessProfileInput,
  type RoadmapAIResponse,
} from "@/lib/validations/roadmap";
import {
  buildAssistantSystemPrompt,
  buildRoadmapSystemPrompt,
  buildRoadmapUserPrompt,
} from "@/lib/ai/prompts";
import type { AIMessage, Roadmap } from "@/types/database";

export class GeminiServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
  }
}

function createGeminiClient() {
  const { geminiApiKey, geminiModel } = assertGeminiConfigured();
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  return { ai, geminiModel };
}

export async function generateBusinessRoadmapWithAI(
  input: BusinessProfileInput
): Promise<RoadmapAIResponse> {
  try {
    const { ai, geminiModel } = createGeminiClient();

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: "user",
          parts: [{ text: buildRoadmapUserPrompt(input) }],
        },
      ],
      config: {
        systemInstruction: buildRoadmapSystemPrompt(),
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new GeminiServiceError(
        "Layanan AI tidak mengembalikan respons teks. Silakan coba beberapa saat lagi.",
        502
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw new GeminiServiceError(
        "Respons AI tidak berformat JSON yang valid. Silakan klik Coba Lagi.",
        502
      );
    }

    const validated = RoadmapAIResponseSchema.parse(parsedJson);
    return validated;
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Konfigurasi Google Gemini API") ||
      message.includes("GEMINI_API_KEY")
    ) {
      throw new GeminiServiceError(message, 500);
    }

    if (
      message.toLowerCase().includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit")
    ) {
      throw new GeminiServiceError(
        "Layanan AI sedang sibuk (batas permintaan API tercapai). Silakan tunggu sekitar 1 menit lalu coba kembali.",
        429
      );
    }

    throw new GeminiServiceError(
      "Gagal menyusun roadmap bisnis dari layanan AI. Silakan periksa kembali input Anda dan coba lagi.",
      502
    );
  }
}

export async function generateAssistantReplyWithAI(params: {
  userMessage: string;
  history: Pick<AIMessage, "role" | "content">[];
  linkedRoadmap?: Roadmap | null;
}): Promise<string> {
  try {
    const { ai, geminiModel } = createGeminiClient();

    const contents = [
      ...params.history.slice(-10).map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      })),
      {
        role: "user" as const,
        parts: [{ text: params.userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents,
      config: {
        systemInstruction: buildAssistantSystemPrompt(params.linkedRoadmap),
        temperature: 0.5,
      },
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      throw new GeminiServiceError(
        "Asisten AI belum dapat memberikan jawaban. Silakan coba kirim ulang pesan Anda.",
        502
      );
    }

    return replyText;
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Konfigurasi Google Gemini API") ||
      message.includes("GEMINI_API_KEY")
    ) {
      throw new GeminiServiceError(message, 500);
    }

    if (
      message.toLowerCase().includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit")
    ) {
      throw new GeminiServiceError(
        "Layanan AI sedang mengalami antrean tinggi. Silakan coba lagi beberapa saat.",
        429
      );
    }

    throw new GeminiServiceError(
      "Terjadi kendala saat menghubungi AI Business Assistant. Silakan coba kembali.",
      502
    );
  }
}

