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
      closer_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          closer_id: string
          id: string
          participant_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          closer_id: string
          id?: string
          participant_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          closer_id?: string
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closer_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closer_assignments_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closer_assignments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      disc_forms: {
        Row: {
          created_at: string | null
          expires_at: string | null
          form_token: string
          id: string
          participant_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          form_token?: string
          id?: string
          participant_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          form_token?: string
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disc_forms_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      disc_responses: {
        Row: {
          analyzed_at: string | null
          contorno_objecoes: string | null
          created_at: string | null
          disc_description: string | null
          disc_profile: string | null
          exemplos_fechamento: string | null
          form_id: string
          id: string
          objecoes: string | null
          responses: Json
          sales_insights: string | null
        }
        Insert: {
          analyzed_at?: string | null
          contorno_objecoes?: string | null
          created_at?: string | null
          disc_description?: string | null
          disc_profile?: string | null
          exemplos_fechamento?: string | null
          form_id: string
          id?: string
          objecoes?: string | null
          responses: Json
          sales_insights?: string | null
        }
        Update: {
          analyzed_at?: string | null
          contorno_objecoes?: string | null
          created_at?: string | null
          disc_description?: string | null
          disc_profile?: string | null
          exemplos_fechamento?: string | null
          form_id?: string
          id?: string
          objecoes?: string | null
          responses?: Json
          sales_insights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disc_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "disc_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          aceitou_termo_imagem: boolean | null
          acompanhante: string | null
          closer_vendeu_id: string | null
          cor: Database["public"]["Enums"]["participant_color"] | null
          cpf_cnpj: string | null
          created_at: string | null
          credenciou_dia1: boolean | null
          credenciou_dia2: boolean | null
          credenciou_dia3: boolean | null
          email: string | null
          event_name: string | null
          external_id: string | null
          faturamento: string | null
          form_name: string | null
          full_name: string
          funil_origem: string | null
          id: string
          imported_at: string | null
          instagram: string | null
          is_oportunidade: boolean | null
          lucro_liquido: string | null
          maior_dificuldade: string | null
          mentorado_convidou: string | null
          nicho: string | null
          nome_cracha: string | null
          objetivo_evento: string | null
          phone: string | null
          photo_url: string | null
          qualificacao:
            | Database["public"]["Enums"]["opportunity_qualification"]
            | null
          registration_status: string | null
          tem_socio: boolean | null
          updated_at: string | null
          vezes_chamado: number | null
          webhook_data: Json | null
        }
        Insert: {
          aceitou_termo_imagem?: boolean | null
          acompanhante?: string | null
          closer_vendeu_id?: string | null
          cor?: Database["public"]["Enums"]["participant_color"] | null
          cpf_cnpj?: string | null
          created_at?: string | null
          credenciou_dia1?: boolean | null
          credenciou_dia2?: boolean | null
          credenciou_dia3?: boolean | null
          email?: string | null
          event_name?: string | null
          external_id?: string | null
          faturamento?: string | null
          form_name?: string | null
          full_name: string
          funil_origem?: string | null
          id?: string
          imported_at?: string | null
          instagram?: string | null
          is_oportunidade?: boolean | null
          lucro_liquido?: string | null
          maior_dificuldade?: string | null
          mentorado_convidou?: string | null
          nicho?: string | null
          nome_cracha?: string | null
          objetivo_evento?: string | null
          phone?: string | null
          photo_url?: string | null
          qualificacao?:
            | Database["public"]["Enums"]["opportunity_qualification"]
            | null
          registration_status?: string | null
          tem_socio?: boolean | null
          updated_at?: string | null
          vezes_chamado?: number | null
          webhook_data?: Json | null
        }
        Update: {
          aceitou_termo_imagem?: boolean | null
          acompanhante?: string | null
          closer_vendeu_id?: string | null
          cor?: Database["public"]["Enums"]["participant_color"] | null
          cpf_cnpj?: string | null
          created_at?: string | null
          credenciou_dia1?: boolean | null
          credenciou_dia2?: boolean | null
          credenciou_dia3?: boolean | null
          email?: string | null
          event_name?: string | null
          external_id?: string | null
          faturamento?: string | null
          form_name?: string | null
          full_name?: string
          funil_origem?: string | null
          id?: string
          imported_at?: string | null
          instagram?: string | null
          is_oportunidade?: boolean | null
          lucro_liquido?: string | null
          maior_dificuldade?: string | null
          mentorado_convidou?: string | null
          nicho?: string | null
          nome_cracha?: string | null
          objetivo_evento?: string | null
          phone?: string | null
          photo_url?: string | null
          qualificacao?:
            | Database["public"]["Enums"]["opportunity_qualification"]
            | null
          registration_status?: string | null
          tem_socio?: boolean | null
          updated_at?: string | null
          vezes_chamado?: number | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_closer_vendeu_id_fkey"
            columns: ["closer_vendeu_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          closer_id: string
          created_at: string | null
          forma_negociacao: string | null
          id: string
          participant_id: string
          product_id: string | null
          product_name: string | null
          sale_date: string | null
          updated_at: string | null
          valor_entrada: number | null
          valor_total: number
        }
        Insert: {
          closer_id: string
          created_at?: string | null
          forma_negociacao?: string | null
          id?: string
          participant_id: string
          product_id?: string | null
          product_name?: string | null
          sale_date?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_total: number
        }
        Update: {
          closer_id?: string
          created_at?: string | null
          forma_negociacao?: string | null
          id?: string
          participant_id?: string
          product_id?: string | null
          product_name?: string | null
          sale_date?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_current_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_assigned_to_participant: {
        Args: { _participant_id: string }
        Returns: boolean
      }
      is_closer: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "closer"
      opportunity_qualification: "super" | "medio" | "baixo"
      participant_color: "rosa" | "preto" | "azul_claro" | "dourado" | "laranja"
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
      app_role: ["admin", "closer"],
      opportunity_qualification: ["super", "medio", "baixo"],
      participant_color: ["rosa", "preto", "azul_claro", "dourado", "laranja"],
    },
  },
} as const
