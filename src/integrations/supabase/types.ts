export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          quantity_change: number
          reference_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          quantity_change: number
          reference_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          quantity_change?: number
          reference_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          subtotal: number
          tax_amount: number
          tax_percent: number | null
          total: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          subtotal: number
          tax_amount: number
          tax_percent?: number | null
          total: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id?: string
          subtotal?: number
          tax_amount?: number
          tax_percent?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          images: string[] | null
          low_stock_threshold: number | null
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          enable_tryon: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          sale_price: number | null
          sku: string
          store_id: string
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          enable_tryon?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          sale_price?: number | null
          sku: string
          store_id: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          enable_tryon?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          sale_price?: number | null
          sku?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          brand_name: string | null
          brn: string | null
          category: Database["public"]["Enums"]["store_category"] | null
          created_at: string
          enable_sharing: boolean | null
          enable_wishlist: boolean | null
          gps_lat: number | null
          gps_long: number | null
          gst_number: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          owner_name: string | null
          owner_photo_url: string | null
          photos: string[] | null
          show_pricing: boolean | null
          status: string | null
          uin: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          brand_name?: string | null
          brn?: string | null
          category?: Database["public"]["Enums"]["store_category"] | null
          created_at?: string
          enable_sharing?: boolean | null
          enable_wishlist?: boolean | null
          gps_lat?: number | null
          gps_long?: number | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          owner_name?: string | null
          owner_photo_url?: string | null
          photos?: string[] | null
          show_pricing?: boolean | null
          status?: string | null
          uin?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          brand_name?: string | null
          brn?: string | null
          category?: Database["public"]["Enums"]["store_category"] | null
          created_at?: string
          enable_sharing?: boolean | null
          enable_wishlist?: boolean | null
          gps_lat?: number | null
          gps_long?: number | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          owner_name?: string | null
          owner_photo_url?: string | null
          photos?: string[] | null
          show_pricing?: boolean | null
          status?: string | null
          uin?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          category: Database["public"]["Enums"]["store_category"]
          created_at: string
          features: Json | null
          id: string
          max_products: number | null
          max_staff: number | null
          monthly_price: number
          name: string
          tablet_price: number
          tablet_value: number
          yearly_price: number
        }
        Insert: {
          category: Database["public"]["Enums"]["store_category"]
          created_at?: string
          features?: Json | null
          id?: string
          max_products?: number | null
          max_staff?: number | null
          monthly_price: number
          name: string
          tablet_price?: number
          tablet_value?: number
          yearly_price: number
        }
        Update: {
          category?: Database["public"]["Enums"]["store_category"]
          created_at?: string
          features?: Json | null
          id?: string
          max_products?: number | null
          max_staff?: number | null
          monthly_price?: number
          name?: string
          tablet_price?: number
          tablet_value?: number
          yearly_price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          end_date: string | null
          id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          plan_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          plan_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          plan_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      tablet_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          quantity: number
          reason: string
          status: Database["public"]["Enums"]["tablet_request_status"] | null
          store_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          quantity?: number
          reason: string
          status?: Database["public"]["Enums"]["tablet_request_status"] | null
          store_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          quantity?: number
          reason?: string
          status?: Database["public"]["Enums"]["tablet_request_status"] | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablet_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      tryon_results: {
        Row: {
          ai_comment: string | null
          created_at: string
          id: string
          match_score: number | null
          product_id: string
          result_image_url: string | null
          session_id: string
          variant_id: string | null
        }
        Insert: {
          ai_comment?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          product_id: string
          result_image_url?: string | null
          session_id: string
          variant_id?: string | null
        }
        Update: {
          ai_comment?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          product_id?: string
          result_image_url?: string | null
          session_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryon_results_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryon_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tryon_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryon_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      tryon_sessions: {
        Row: {
          captured_images: string[] | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          detected_body_type: string | null
          detected_height: string | null
          detected_skin_tone: string | null
          favorite_colors: string[] | null
          id: string
          session_data: Json | null
          store_id: string
        }
        Insert: {
          captured_images?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_body_type?: string | null
          detected_height?: string | null
          detected_skin_tone?: string | null
          favorite_colors?: string[] | null
          id?: string
          session_data?: Json | null
          store_id: string
        }
        Update: {
          captured_images?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_body_type?: string | null
          detected_height?: string | null
          detected_skin_tone?: string | null
          favorite_colors?: string[] | null
          id?: string
          session_data?: Json | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryon_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          store_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          tryon_result_id: string
          wishlist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tryon_result_id: string
          wishlist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tryon_result_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_tryon_result_id_fkey"
            columns: ["tryon_result_id"]
            isOneToOne: false
            referencedRelation: "tryon_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          is_public: boolean | null
          qr_code_url: string | null
          session_id: string
          share_url: string | null
          store_id: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          is_public?: boolean | null
          qr_code_url?: string | null
          session_id: string
          share_url?: string | null
          store_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          is_public?: boolean | null
          qr_code_url?: string | null
          session_id?: string
          share_url?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tryon_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_store: {
        Args: { _store_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status: "pending" | "processing" | "completed" | "cancelled"
      payment_type: "monthly" | "yearly"
      store_category: "small" | "medium" | "large"
      subscription_status: "active" | "expired" | "pending" | "cancelled"
      tablet_request_status: "pending" | "approved" | "rejected" | "delivered"
      user_role:
        | "superadmin"
        | "store_owner"
        | "store_admin"
        | "product_staff"
        | "inventory_manager"
        | "finance_manager"
        | "pos_cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "processing", "completed", "cancelled"],
      payment_type: ["monthly", "yearly"],
      store_category: ["small", "medium", "large"],
      subscription_status: ["active", "expired", "pending", "cancelled"],
      tablet_request_status: ["pending", "approved", "rejected", "delivered"],
      user_role: [
        "superadmin",
        "store_owner",
        "store_admin",
        "product_staff",
        "inventory_manager",
        "finance_manager",
        "pos_cashier",
      ],
    },
  },
} as const
