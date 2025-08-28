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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          company_id: string | null
          context_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_addresses: {
        Row: {
          address_type: string | null
          city: string | null
          client_id: string | null
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string | null
          state: string | null
          street_address: string
        }
        Insert: {
          address_type?: string | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          state?: string | null
          street_address: string
        }
        Update: {
          address_type?: string | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          state?: string | null
          street_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_categories: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      client_notes: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_important: boolean | null
          note: string
          note_type: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_important?: boolean | null
          note: string
          note_type?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_important?: boolean | null
          note?: string
          note_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_type: string | null
          company_id: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          last_purchase_date: string | null
          payment_terms: number | null
          phone: string | null
          tax_number: string | null
          total_purchases: number | null
          updated_at: string | null
        }
        Insert: {
          client_type?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          last_purchase_date?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Update: {
          client_type?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          last_purchase_date?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          default_tax_rate: number | null
          description: string | null
          email: string | null
          fiscal_year_start: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tax_number: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          default_tax_rate?: number | null
          description?: string | null
          email?: string | null
          fiscal_year_start?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          default_tax_rate?: number | null
          description?: string | null
          email?: string | null
          fiscal_year_start?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          exchange_rate: number | null
          id: string
          is_default: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          is_default?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          is_default?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          average_sale_value: number | null
          company_id: string | null
          created_at: string | null
          id: string
          new_clients: number | null
          stat_date: string
          total_items_sold: number | null
          total_profit: number | null
          total_sales: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          average_sale_value?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          stat_date: string
          total_items_sold?: number | null
          total_profit?: number | null
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          average_sale_value?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          stat_date?: string
          total_items_sold?: number | null
          total_profit?: number | null
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          file_size: number | null
          filename: string
          id: string
          is_public: boolean | null
          mime_type: string | null
          original_filename: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          filename: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_filename: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_filename?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_alerts: {
        Row: {
          alert_type: string
          company_id: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          product_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          threshold_value: number | null
        }
        Insert: {
          alert_type: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          product_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          threshold_value?: number | null
        }
        Update: {
          alert_type?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          product_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number | null
          payment_terms: string | null
          sale_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: string | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: string | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string | null
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          metric_date?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          new_clients: number | null
          report_month: string
          revenue_by_category: Json | null
          top_selling_products: Json | null
          total_profit: number | null
          total_revenue: number | null
          total_sales: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          report_month: string
          revenue_by_category?: Json | null
          top_selling_products?: Json | null
          total_profit?: number | null
          total_revenue?: number | null
          total_sales?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          report_month?: string
          revenue_by_category?: Json | null
          top_selling_products?: Json | null
          total_profit?: number | null
          total_revenue?: number | null
          total_sales?: number | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by: string | null
          reference_number: string | null
          sale_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          reference_number?: string | null
          sale_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          reference_number?: string | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          granted_by: string | null
          id: string
          module: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          module: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          module?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          file_id: string | null
          id: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          file_id?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          file_id?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          cost_price: number | null
          created_at: string | null
          current_stock: number | null
          id: string
          name: string
          product_id: string | null
          selling_price: number | null
          sku: string | null
        }
        Insert: {
          barcode?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          name: string
          product_id?: string | null
          selling_price?: number | null
          sku?: string | null
        }
        Update: {
          barcode?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          name?: string
          product_id?: string | null
          selling_price?: number | null
          sku?: string | null
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
          barcode: string | null
          category_id: string | null
          company_id: string | null
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          description: string | null
          has_variants: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock_level: number | null
          name: string
          selling_price: number
          sku: string | null
          supplier_id: string | null
          tax_rate: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name: string
          selling_price: number
          sku?: string | null
          supplier_id?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name?: string
          selling_price?: number
          sku?: string | null
          supplier_id?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string
          promotion_type: Database["public"]["Enums"]["promotion_type"]
          start_date: string
          times_used: number | null
          usage_limit: number | null
          value: number
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name: string
          promotion_type: Database["public"]["Enums"]["promotion_type"]
          start_date: string
          times_used?: number | null
          usage_limit?: number | null
          value: number
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name?: string
          promotion_type?: Database["public"]["Enums"]["promotion_type"]
          start_date?: string
          times_used?: number | null
          usage_limit?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          id: string
          line_total: number
          product_id: string | null
          quantity: number
          sale_id: string | null
          tax_rate: number | null
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          line_total: number
          product_id?: string | null
          quantity: number
          sale_id?: string | null
          tax_rate?: number | null
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sale_id?: string | null
          tax_rate?: number | null
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          sale_date: string | null
          sale_number: string
          sold_by: string | null
          status: Database["public"]["Enums"]["sale_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_date?: string | null
          sale_number: string
          sold_by?: string | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_date?: string | null
          sale_number?: string
          sold_by?: string | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          product_id: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          unit_cost: number | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          company_id: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          rate: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          rate: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          rate?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_companies: {
        Args: { user_uuid: string }
        Returns: {
          company_id: string
          company_name: string
          user_role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role_in_company: {
        Args: { comp_id: string; user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { action_name: string; module_name: string; user_uuid: string }
        Returns: boolean
      }
      user_has_company_access: {
        Args: { comp_id: string; user_uuid: string }
        Returns: boolean
      }
      create_sale_items_and_invoice: {
        Args: {
          p_sale_id: string
          p_items: {
            product_id: string
            quantity: number
            unit_price: number
            line_total: number
          }[]
          p_invoice_number: string
          p_client_id: string | null
          p_company_id: string
          p_subtotal: number
          p_tax_amount: number
          p_total_amount: number
          p_status: Database["public"]["Enums"]["invoice_status"]
          p_paid_amount: number
          p_notes: string
        }
        Returns: void
      }
    }
    Enums: {
      app_role: "owner" | "manager" | "employee"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      payment_method:
        | "cash"
        | "card"
        | "mobile_money"
        | "bank_transfer"
        | "check"
      promotion_type: "percentage" | "fixed_amount" | "buy_x_get_y"
      sale_status: "pending" | "completed" | "cancelled" | "refunded"
      stock_movement_type: "in" | "out" | "transfer" | "adjustment"
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
      app_role: ["owner", "manager", "employee"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      payment_method: [
        "cash",
        "card",
        "mobile_money",
        "bank_transfer",
        "check",
      ],
      promotion_type: ["percentage", "fixed_amount", "buy_x_get_y"],
      sale_status: ["pending", "completed", "cancelled", "refunded"],
      stock_movement_type: ["in", "out", "transfer", "adjustment"],
    },
  },
} as const
