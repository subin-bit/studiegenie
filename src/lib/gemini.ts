import { GoogleGenAI } from "@google/genai";
import type { MessageSource, QuizQuestion, StudyPack } from "@/lib/types";
import {
  buildChatPrompt,
  buildEli5Prompt,
  buildStudyPackPrompt,
  buildTranslationPrompt,
} from "@/lib/prompts";
import { getServerEnv } from "@/lib/server-env";
import { safeJsonParse } from "@/lib/supa-utils";

const CHAT_MODEL = "gemini-2.5-flash";
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768;

const quizSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      answer: { type: "string" },
      explanation: { type: "string" },
      options: {
        type: "array",
        items: { type: "string" },
      },
      question: { type: "string" },
    },
    required: ["question", "options", "answer", "explanation"],
  },
};

const studyPackSchema = {
  type: "object",
  properties: {
    keyPoints: {
      type: "array",
      items: { type: "string" },
    },
    quiz: quizSchema,
    summary: { type: "string" },
  },
  required: ["summary", "keyPoints", "quiz"],
};

function getAi() {
  return new GoogleGenAI({ apiKey: getServerEnv().geminiApiKey });
}

export async function embedTexts(texts: string[]) {
  const allEmbeddings: number[][] = [];
  const ai = getAi();

  for (let index = 0; index < texts.length; index += 12) {
    const batch = texts.slice(index, index + 12);
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: {
        outputDimensionality: EMBEDDING_DIMENSION,
      },
    });

    for (const embedding of response.embeddings ?? []) {
      allEmbeddings.push(embedding.values ?? []);
    }
  }

  return allEmbeddings;
}

export async function generateStudyPack({
  text,
  title,
}: {
  text: string;
  title: string;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildStudyPackPrompt(title, text),
    config: {
      responseMimeType: "application/json",
      responseSchema: studyPackSchema,
      temperature: 0.35,
    },
  });

  const studyPack = safeJsonParse<StudyPack>(response.text ?? "");

  if (!studyPack) {
    throw new Error("Gemini returned an invalid study pack.");
  }

  return studyPack;
}

export async function generateChatAnswer({
  contextBlocks,
  documentTitle,
  language,
  question,
  summary,
}: {
  contextBlocks: MessageSource[];
  documentTitle: string;
  language: string;
  question: string;
  summary: string | null;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildChatPrompt({
      contextBlocks,
      documentTitle,
      language,
      question,
      summary,
    }),
    config: {
      temperature: 0.4,
    },
  });

  return (response.text ?? "").trim();
}

export async function generateEli5({
  language,
  studyPack,
  title,
}: {
  language: string;
  studyPack: StudyPack;
  title: string;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildEli5Prompt({ language, studyPack, title }),
    config: {
      temperature: 0.55,
    },
  });

  return (response.text ?? "").trim();
}

export async function translateSummary({
  language,
  studyPack,
  title,
}: {
  language: string;
  studyPack: StudyPack;
  title: string;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildTranslationPrompt({
      language,
      mode: "summary",
      studyPack,
      title,
    }),
  });

  return (response.text ?? "").trim();
}

export async function translateKeyPoints({
  language,
  studyPack,
  title,
}: {
  language: string;
  studyPack: StudyPack;
  title: string;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildTranslationPrompt({
      language,
      mode: "key_points",
      studyPack,
      title,
    }),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: { type: "string" },
      },
    },
  });

  return safeJsonParse<string[]>(response.text ?? "") ?? studyPack.keyPoints;
}

export async function translateQuiz({
  language,
  studyPack,
  title,
}: {
  language: string;
  studyPack: StudyPack;
  title: string;
}) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildTranslationPrompt({
      language,
      mode: "quiz",
      studyPack,
      title,
    }),
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  return safeJsonParse<QuizQuestion[]>(response.text ?? "") ?? studyPack.quiz;
}
