import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface InvitationRequest {
  company_id: string;
  invited_email: string;
  role: string;
}

interface InvitationResponse {
  success: boolean;
  message: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    const { company_id, invited_email, role }: InvitationRequest = await req.json();

    // Validate input
    if (!company_id || !invited_email || !role) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if the user making the request has permission to invite
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: user, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check if user has permission to invite for this company
    const { data: membership, error: membershipError } = await supabaseClient
      .from("company_members")
      .select("role")
      .eq("company_id", company_id)
      .eq("user_id", user.user.id)
      .single();

    if (membershipError || !membership || (membership.role !== "owner" && membership.role !== "manager")) {
      return new Response(
        JSON.stringify({ success: false, message: "You don't have permission to invite members" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Create the invitation
    const { data, error } = await supabaseClient
      .from("invitations")
      .insert({
        company_id,
        invited_by: user.user.id,
        invited_email,
        role,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Send email notification

    return new Response(
      JSON.stringify({ success: true, message: "Invitation sent successfully", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in invite_member function:", error);

    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});