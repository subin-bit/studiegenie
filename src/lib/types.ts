import type { Database, Json } from "@/types/database";

export type AppDocument = Database["public"]["Tables"]["documents"]["Row"];
export type AppChat = Database["public"]["Tables"]["chats"]["Row"];
export type AppMessage = Database["public"]["Tables"]["messages"]["Row"];

export type QuizQuestion = {
  answer: string;
  explanation: string;
  options: string[];
  question: string;
};

export type StudyPack = {
  keyPoints: string[];
  quiz: QuizQuestion[];
  summary: string;
};

export type MessageSource = {
  chunkIndex: number;
  excerpt: string;
  id: string;
  pageNumber: number | null;
  similarity: number;
};

export type StoredMessage = AppMessage & {
  sources: Json | null;
};
