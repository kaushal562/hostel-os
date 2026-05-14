export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      complaints: {
        Row: {
          created_at: string | null
          description: string
          id: string
          issue_type: string
          location: string
          priority: string
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          issue_type: string
          location: string
          priority: string
          status: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          issue_type?: string
          location?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          status: string
          transaction_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          status: string
          transaction_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          status?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          block: string | null
          contact_number: string | null
          course: string | null
          created_at: string | null
          emergency_contact: string | null
          floor: string | null
          full_name: string | null
          id: string
          profile_picture: string | null
          role: string
          room_number: string | null
          room_type: string | null
          student_id: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          block?: string | null
          contact_number?: string | null
          course?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          floor?: string | null
          full_name?: string | null
          id: string
          profile_picture?: string | null
          role?: string
          room_number?: string | null
          room_type?: string | null
          student_id?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          block?: string | null
          contact_number?: string | null
          course?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          floor?: string | null
          full_name?: string | null
          id?: string
          profile_picture?: string | null
          role?: string
          room_number?: string | null
          room_type?: string | null
          student_id?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
      room_change_requests: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          id: string
          preferred_floor: string | null
          preferred_room_type: string
          reason: string
          roommate_preference: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          id?: string
          preferred_floor?: string | null
          preferred_room_type: string
          reason: string
          roommate_preference?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          id?: string
          preferred_floor?: string | null
          preferred_room_type?: string
          reason?: string
          roommate_preference?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount_paid: number
          created_at: string
          fee_id: string
          id: string
          paid_at: string
          payment_method: Database["public"]["Enums"]["fee_payment_method"]
          payment_status: Database["public"]["Enums"]["fee_payment_status"]
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          fee_id: string
          id?: string
          paid_at?: string
          payment_method: Database["public"]["Enums"]["fee_payment_method"]
          payment_status?: Database["public"]["Enums"]["fee_payment_status"]
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          fee_id?: string
          id?: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["fee_payment_method"]
          payment_status?: Database["public"]["Enums"]["fee_payment_status"]
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          created_by_admin_id: string | null
          description: string | null
          due_date: string | null
          id: string
          remaining_amount: number
          status: Database["public"]["Enums"]["fee_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by_admin_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          remaining_amount?: number
          status?: Database["public"]["Enums"]["fee_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by_admin_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          remaining_amount?: number
          status?: Database["public"]["Enums"]["fee_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      fee_payment_method: "UPI" | "Card" | "Net Banking" | "Cash"
      fee_payment_status: "success" | "failed" | "pending"
      fee_status: "pending" | "partially_paid" | "paid" | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
