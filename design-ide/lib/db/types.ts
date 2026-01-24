export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectPhase =
  | 'describe'
  | 'prototype'
  | 'iterate'
  | 'build'
  | 'export';

export type VariantFocusArea =
  | 'layout'
  | 'hierarchy'
  | 'density'
  | 'interaction'
  | 'expression';

export type MessageRole = 'user' | 'assistant' | 'tool';

export type FileType = 'component' | 'api' | 'database' | 'util' | 'config';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          github_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          github_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          github_id?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string | null;
          name: string | null;
          description: string | null;
          phase: ProjectPhase;
          design_brief: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          description?: string | null;
          phase?: ProjectPhase;
          design_brief?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          description?: string | null;
          phase?: ProjectPhase;
          design_brief?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      variants: {
        Row: {
          id: string;
          project_id: string | null;
          variant_id: string;
          name: string | null;
          description: string | null;
          focus_area: VariantFocusArea | null;
          code: string | null;
          rationale: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          variant_id: string;
          name?: string | null;
          description?: string | null;
          focus_area?: VariantFocusArea | null;
          code?: string | null;
          rationale?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          variant_id?: string;
          name?: string | null;
          description?: string | null;
          focus_area?: VariantFocusArea | null;
          code?: string | null;
          rationale?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          project_id: string | null;
          variant_id: string | null;
          element_selector: string | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          variant_id?: string | null;
          element_selector?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          variant_id?: string | null;
          element_selector?: string | null;
          comment?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          project_id: string | null;
          role: MessageRole;
          content: string | null;
          tool_calls: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          role: MessageRole;
          content?: string | null;
          tool_calls?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          role?: MessageRole;
          content?: string | null;
          tool_calls?: Json | null;
          created_at?: string;
        };
      };
      generated_files: {
        Row: {
          id: string;
          project_id: string | null;
          path: string | null;
          content: string | null;
          file_type: FileType | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          path?: string | null;
          content?: string | null;
          file_type?: FileType | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          path?: string | null;
          content?: string | null;
          file_type?: FileType | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Variant = Database['public']['Tables']['variants']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type GeneratedFile = Database['public']['Tables']['generated_files']['Row'];

// Insert types
export type InsertProject = Database['public']['Tables']['projects']['Insert'];
export type InsertVariant = Database['public']['Tables']['variants']['Insert'];
export type InsertFeedback = Database['public']['Tables']['feedback']['Insert'];
export type InsertMessage = Database['public']['Tables']['messages']['Insert'];
export type InsertGeneratedFile = Database['public']['Tables']['generated_files']['Insert'];
