export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string;
          document_id: string;
          id: string;
          last_message_preview: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_id: string;
          id?: string;
          last_message_preview?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_id?: string;
          id?: string;
          last_message_preview?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      document_chunks: {
        Row: {
          chunk_index: number;
          content: string;
          created_at: string;
          document_id: string;
          embedding: string | null;
          id: string;
          page_number: number | null;
          token_count: number | null;
        };
        Insert: {
          chunk_index: number;
          content: string;
          created_at?: string;
          document_id: string;
          embedding?: string | null;
          id?: string;
          page_number?: number | null;
          token_count?: number | null;
        };
        Update: {
          chunk_index?: number;
          content?: string;
          created_at?: string;
          document_id?: string;
          embedding?: string | null;
          id?: string;
          page_number?: number | null;
          token_count?: number | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          created_at: string;
          excerpt: string | null;
          file_name: string;
          id: string;
          key_points: string[] | null;
          page_count: number | null;
          quiz: Json | null;
          status: "failed" | "processing" | "ready";
          storage_path: string;
          summary: string | null;
          title: string;
          updated_at: string;
          user_id: string;
          word_count: number | null;
        };
        Insert: {
          created_at?: string;
          excerpt?: string | null;
          file_name: string;
          id?: string;
          key_points?: string[] | null;
          page_count?: number | null;
          quiz?: Json | null;
          status?: "failed" | "processing" | "ready";
          storage_path: string;
          summary?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
          word_count?: number | null;
        };
        Update: {
          created_at?: string;
          excerpt?: string | null;
          file_name?: string;
          id?: string;
          key_points?: string[] | null;
          page_count?: number | null;
          quiz?: Json | null;
          status?: "failed" | "processing" | "ready";
          storage_path?: string;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
          word_count?: number | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          chat_id: string;
          content: string;
          created_at: string;
          id: string;
          role: "assistant" | "user";
          sources: Json | null;
        };
        Insert: {
          chat_id: string;
          content: string;
          created_at?: string;
          id?: string;
          role: "assistant" | "user";
          sources?: Json | null;
        };
        Update: {
          chat_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          role?: "assistant" | "user";
          sources?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_document_chunks: {
        Args: {
          filter_document_id: string;
          match_count?: number;
          query_embedding: string;
        };
        Returns: {
          chunk_index: number;
          content: string;
          id: string;
          page_number: number | null;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
