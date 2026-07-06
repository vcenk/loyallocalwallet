// Database types for Local Loyalty Wallet.
//
// SHAPE MATCHES the Supabase type generator output so this file can be safely
// overwritten once a Supabase project (local stack or hosted) exists:
//
//   supabase gen types typescript --local > packages/db/src/database.types.ts
//   # or, against a linked/hosted project:
//   supabase gen types typescript --project-id <ref> > packages/db/src/database.types.ts
//
// Until then this is maintained by hand to match migration
// supabase/migrations/20260705120000_init_core_tenant_schema.sql.

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
      automations: {
        Row: {
          id: string;
          business_id: string;
          key: string;
          enabled: boolean;
          title: string;
          body: string;
          threshold_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          key: string;
          enabled?: boolean;
          title?: string;
          body?: string;
          threshold_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          key?: string;
          enabled?: boolean;
          title?: string;
          body?: string;
          threshold_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      automation_sends: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          automation_key: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          automation_key: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          automation_key?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          business_id: string;
          program_id: string | null;
          referrer_customer_id: string;
          referred_customer_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          program_id?: string | null;
          referrer_customer_id: string;
          referred_customer_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          program_id?: string | null;
          referrer_customer_id?: string;
          referred_customer_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          brand_color: string | null;
          google_review_url: string | null;
          welcome_bonus_stamps: number;
          timezone: string | null;
          country: string | null;
          currency: string | null;
          plan_key: string | null;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          brand_color?: string | null;
          google_review_url?: string | null;
          welcome_bonus_stamps?: number;
          timezone?: string | null;
          country?: string | null;
          currency?: string | null;
          plan_key?: string | null;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          brand_color?: string | null;
          google_review_url?: string | null;
          welcome_bonus_stamps?: number;
          timezone?: string | null;
          country?: string | null;
          currency?: string | null;
          plan_key?: string | null;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["user_role"];
          location_id: string | null;
          is_active: boolean;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["user_role"];
          location_id?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          location_id?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_members_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_members_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_programs: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          program_type: Database["public"]["Enums"]["program_type"];
          status: Database["public"]["Enums"]["program_status"];
          stamps_required: number | null;
          points_per_dollar: number | null;
          reward_title: string;
          reward_description: string | null;
          terms: string | null;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          program_type?: Database["public"]["Enums"]["program_type"];
          status?: Database["public"]["Enums"]["program_status"];
          stamps_required?: number | null;
          points_per_dollar?: number | null;
          reward_title: string;
          reward_description?: string | null;
          terms?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          program_type?: Database["public"]["Enums"]["program_type"];
          status?: Database["public"]["Enums"]["program_status"];
          stamps_required?: number | null;
          points_per_dollar?: number | null;
          reward_title?: string;
          reward_description?: string | null;
          terms?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      card_designs: {
        Row: {
          id: string;
          business_id: string;
          program_id: string;
          logo_url: string | null;
          icon_url: string | null;
          background_color: string | null;
          foreground_color: string | null;
          label_color: string | null;
          stamp_icon: string | null;
          pattern: string | null;
          apple_pass_type_identifier: string | null;
          google_class_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          program_id: string;
          logo_url?: string | null;
          icon_url?: string | null;
          background_color?: string | null;
          foreground_color?: string | null;
          label_color?: string | null;
          stamp_icon?: string | null;
          pattern?: string | null;
          apple_pass_type_identifier?: string | null;
          google_class_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          program_id?: string;
          logo_url?: string | null;
          icon_url?: string | null;
          background_color?: string | null;
          foreground_color?: string | null;
          label_color?: string | null;
          stamp_icon?: string | null;
          pattern?: string | null;
          apple_pass_type_identifier?: string | null;
          google_class_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_designs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_designs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: true;
            referencedRelation: "loyalty_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          marketing_consent: boolean;
          language: string | null;
          birth_month: number | null;
          birth_day: number | null;
          referral_code: string | null;
          first_seen_at: string;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          marketing_consent?: boolean;
          language?: string | null;
          birth_month?: number | null;
          birth_day?: number | null;
          referral_code?: string | null;
          first_seen_at?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          marketing_consent?: boolean;
          language?: string | null;
          birth_month?: number | null;
          birth_day?: number | null;
          referral_code?: string | null;
          first_seen_at?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      wallet_passes: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          program_id: string;
          platform: Database["public"]["Enums"]["pass_platform"];
          status: Database["public"]["Enums"]["pass_status"];
          serial_number: string;
          authentication_token: string | null;
          authentication_token_hash: string | null;
          google_object_id: string | null;
          current_stamps: number;
          current_points: number;
          rewards_available: number;
          message_body: string | null;
          message_link: string | null;
          message_updated_at: string | null;
          installed_at: string | null;
          uninstalled_at: string | null;
          last_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          program_id: string;
          platform: Database["public"]["Enums"]["pass_platform"];
          status?: Database["public"]["Enums"]["pass_status"];
          serial_number: string;
          authentication_token?: string | null;
          authentication_token_hash?: string | null;
          google_object_id?: string | null;
          current_stamps?: number;
          current_points?: number;
          rewards_available?: number;
          message_body?: string | null;
          message_link?: string | null;
          message_updated_at?: string | null;
          installed_at?: string | null;
          uninstalled_at?: string | null;
          last_updated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          program_id?: string;
          platform?: Database["public"]["Enums"]["pass_platform"];
          status?: Database["public"]["Enums"]["pass_status"];
          serial_number?: string;
          authentication_token?: string | null;
          authentication_token_hash?: string | null;
          google_object_id?: string | null;
          current_stamps?: number;
          current_points?: number;
          rewards_available?: number;
          message_body?: string | null;
          message_link?: string | null;
          message_updated_at?: string | null;
          installed_at?: string | null;
          uninstalled_at?: string | null;
          last_updated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_passes_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_passes_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_passes_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      stamp_events: {
        Row: {
          id: string;
          business_id: string;
          location_id: string | null;
          customer_id: string;
          program_id: string;
          wallet_pass_id: string | null;
          staff_member_id: string | null;
          event_type: Database["public"]["Enums"]["stamp_event_type"];
          quantity: number;
          purchase_amount: number | null;
          reason: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          location_id?: string | null;
          customer_id: string;
          program_id: string;
          wallet_pass_id?: string | null;
          staff_member_id?: string | null;
          event_type?: Database["public"]["Enums"]["stamp_event_type"];
          quantity?: number;
          purchase_amount?: number | null;
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          location_id?: string | null;
          customer_id?: string;
          program_id?: string;
          wallet_pass_id?: string | null;
          staff_member_id?: string | null;
          event_type?: Database["public"]["Enums"]["stamp_event_type"];
          quantity?: number;
          purchase_amount?: number | null;
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stamp_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stamp_events_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stamp_events_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stamp_events_wallet_pass_id_fkey";
            columns: ["wallet_pass_id"];
            isOneToOne: false;
            referencedRelation: "wallet_passes";
            referencedColumns: ["id"];
          },
        ];
      };
      reward_redemptions: {
        Row: {
          id: string;
          business_id: string;
          location_id: string | null;
          customer_id: string;
          program_id: string;
          wallet_pass_id: string | null;
          staff_member_id: string | null;
          reward_title: string;
          status: Database["public"]["Enums"]["reward_status"];
          redeemed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          location_id?: string | null;
          customer_id: string;
          program_id: string;
          wallet_pass_id?: string | null;
          staff_member_id?: string | null;
          reward_title: string;
          status?: Database["public"]["Enums"]["reward_status"];
          redeemed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          location_id?: string | null;
          customer_id?: string;
          program_id?: string;
          wallet_pass_id?: string | null;
          staff_member_id?: string | null;
          reward_title?: string;
          status?: Database["public"]["Enums"]["reward_status"];
          redeemed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reward_redemptions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reward_redemptions_wallet_pass_id_fkey";
            columns: ["wallet_pass_id"];
            isOneToOne: false;
            referencedRelation: "wallet_passes";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string | null;
          actor_user_id: string | null;
          actor_staff_member_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          actor_user_id?: string | null;
          actor_staff_member_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          actor_user_id?: string | null;
          actor_staff_member_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          business_id: string;
          program_id: string | null;
          created_by: string | null;
          name: string;
          audience_key: string | null;
          message_title: string;
          message_body: string;
          status: Database["public"]["Enums"]["campaign_status"];
          scheduled_at: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          program_id?: string | null;
          created_by?: string | null;
          name: string;
          audience_key?: string | null;
          message_title: string;
          message_body: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          program_id?: string | null;
          created_by?: string | null;
          name?: string;
          audience_key?: string | null;
          message_title?: string;
          message_body?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          business_id: string;
          customer_id: string;
          wallet_pass_id: string | null;
          status: string;
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          business_id: string;
          customer_id: string;
          wallet_pass_id?: string | null;
          status?: string;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          business_id?: string;
          customer_id?: string;
          wallet_pass_id?: string | null;
          status?: string;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_events: {
        Row: {
          id: string;
          business_id: string | null;
          stripe_event_id: string | null;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          stripe_event_id?: string | null;
          event_type: string;
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          stripe_event_id?: string | null;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      pass_registrations: {
        Row: {
          id: string;
          wallet_pass_id: string;
          device_library_identifier: string;
          push_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_pass_id: string;
          device_library_identifier: string;
          push_token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_pass_id?: string;
          device_library_identifier?: string;
          push_token?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pass_registrations_wallet_pass_id_fkey";
            columns: ["wallet_pass_id"];
            isOneToOne: false;
            referencedRelation: "wallet_passes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_business_role: {
        Args: { p_business_id: string; p_roles: Database["public"]["Enums"]["user_role"][] };
        Returns: boolean;
      };
      is_business_member: {
        Args: { p_business_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role:
        | "platform_admin"
        | "business_owner"
        | "business_admin"
        | "manager"
        | "staff";
      program_type: "stamps" | "points" | "visits";
      program_status: "draft" | "active" | "paused" | "archived";
      pass_platform: "apple" | "google";
      pass_status: "created" | "installed" | "active" | "voided" | "deleted";
      stamp_event_type: "earn" | "bonus" | "adjustment" | "remove";
      reward_status: "available" | "redeemed" | "expired" | "cancelled";
      campaign_status: "draft" | "scheduled" | "sent" | "cancelled" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience helpers (mirrors what supabase gen types appends).
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
