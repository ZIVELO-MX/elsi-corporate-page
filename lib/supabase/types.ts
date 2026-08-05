// Generated contract for the initial Supabase migration.
// Refresh with: supabase gen types typescript --local > lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      certificates: {
        Row: { id: string; enrollment_id: string; status: Database["public"]["Enums"]["certificate_status"]; storage_path: string | null; issued_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; enrollment_id: string; status?: Database["public"]["Enums"]["certificate_status"]; storage_path?: string | null; issued_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; enrollment_id?: string; status?: Database["public"]["Enums"]["certificate_status"]; storage_path?: string | null; issued_at?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      contact_leads: {
        Row: { id: string; full_name: string; email: string; phone: string | null; company: string | null; message: string; source: string; status: Database["public"]["Enums"]["lead_status"]; turnstile_verified: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; full_name: string; email: string; phone?: string | null; company?: string | null; message: string; source?: string; status?: Database["public"]["Enums"]["lead_status"]; turnstile_verified?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string; email?: string; phone?: string | null; company?: string | null; message?: string; source?: string; status?: Database["public"]["Enums"]["lead_status"]; turnstile_verified?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      courses: {
        Row: { id: string; slug: string; title: string; short_description: string; description: string | null; duration_hours: number | null; audience: string | null; syllabus: Json; modality: Database["public"]["Enums"]["course_modality"]; location: string | null; starts_at: string | null; enrollment_link: string | null; price_cents: number; currency: string; content_status: Database["public"]["Enums"]["content_status"]; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; title: string; short_description: string; description?: string | null; duration_hours?: number | null; audience?: string | null; syllabus?: Json; modality?: Database["public"]["Enums"]["course_modality"]; location?: string | null; starts_at?: string | null; enrollment_link?: string | null; price_cents?: number; currency?: string; content_status?: Database["public"]["Enums"]["content_status"]; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; slug?: string; title?: string; short_description?: string; description?: string | null; duration_hours?: number | null; audience?: string | null; syllabus?: Json; modality?: Database["public"]["Enums"]["course_modality"]; location?: string | null; starts_at?: string | null; enrollment_link?: string | null; price_cents?: number; currency?: string; content_status?: Database["public"]["Enums"]["content_status"]; is_active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      enrollments: {
        Row: { id: string; user_id: string; course_id: string; source: Database["public"]["Enums"]["enrollment_source"]; status: Database["public"]["Enums"]["enrollment_status"]; enrolled_at: string; completed_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; course_id: string; source?: Database["public"]["Enums"]["enrollment_source"]; status?: Database["public"]["Enums"]["enrollment_status"]; enrolled_at?: string; completed_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; course_id?: string; source?: Database["public"]["Enums"]["enrollment_source"]; status?: Database["public"]["Enums"]["enrollment_status"]; enrolled_at?: string; completed_at?: string | null; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "enrollments_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] }];
      };
      outbox_events: {
        Row: { id: string; aggregate_type: string; aggregate_id: string | null; event_type: string; payload: Json; status: Database["public"]["Enums"]["outbox_status"]; attempts: number; available_at: string; locked_at: string | null; processed_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; aggregate_type: string; aggregate_id?: string | null; event_type: string; payload?: Json; status?: Database["public"]["Enums"]["outbox_status"]; attempts?: number; available_at?: string; locked_at?: string | null; processed_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; aggregate_type?: string; aggregate_id?: string | null; event_type?: string; payload?: Json; status?: Database["public"]["Enums"]["outbox_status"]; attempts?: number; available_at?: string; locked_at?: string | null; processed_at?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      page_sections: {
        Row: { id: string; section_key: string; title: string; body: Json; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; section_key: string; title: string; body?: Json; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; section_key?: string; title?: string; body?: Json; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: { id: string; full_name: string | null; role: Database["public"]["Enums"]["app_role"]; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; role?: Database["public"]["Enums"]["app_role"]; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string | null; role?: Database["public"]["Enums"]["app_role"]; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      solution_items: {
        Row: { id: string; solution_id: string; title: string; body: Json; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; solution_id: string; title: string; body?: Json; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; solution_id?: string; title?: string; body?: Json; sort_order?: number; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "solution_items_solution_id_fkey"; columns: ["solution_id"]; isOneToOne: false; referencedRelation: "solutions"; referencedColumns: ["id"] }];
      };
      solutions: {
        Row: { id: string; slug: string; title: string; summary: string; body: Json; content_status: Database["public"]["Enums"]["content_status"]; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; title: string; summary: string; body?: Json; content_status?: Database["public"]["Enums"]["content_status"]; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; slug?: string; title?: string; summary?: string; body?: Json; content_status?: Database["public"]["Enums"]["content_status"]; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      testimonials: {
        Row: { id: string; quote: string; author_name: string; author_role: string | null; image_path: string | null; consent_reference: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; quote: string; author_name: string; author_role?: string | null; image_path?: string | null; consent_reference?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; quote?: string; author_name?: string; author_role?: string | null; image_path?: string | null; consent_reference?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_contact_lead: {
        Args: {
          p_full_name: string;
          p_email: string;
          p_message: string;
          p_phone?: string | null;
          p_company?: string | null;
          p_source?: string;
          p_turnstile_verified?: boolean;
        };
        Returns: string;
      };
    };
    Enums: { app_role: "student" | "admin"; certificate_status: "pending" | "available"; content_status: "fixture" | "verified"; course_modality: "online" | "in_person"; enrollment_source: "internal" | "external" | "stripe"; enrollment_status: "in_progress" | "completed"; lead_status: "new" | "contacted" | "closed"; outbox_status: "pending" | "processing" | "processed" | "failed" };
    CompositeTypes: Record<string, never>;
  };
};
