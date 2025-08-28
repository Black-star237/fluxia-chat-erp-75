import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface MembershipRequest {
  company_id: string;
  requested_role: string;
  message?: string;
}

interface MembershipResponse {
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
    const { company_id, requested_role, message }: MembershipRequest = await req.json();

    // Validate input
    if (!company_id || !requested_role) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if the user making the request is authenticated
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

    // Check if user is already a member of this company
    const { data: existingMembership, error: membershipError } = await supabaseClient
      .from("company_members")
      .select("id")
      .eq("company_id", company_id)
      .eq("user_id", user.user.id)
      .single();

    if (existingMembership) {
      return new Response(
        JSON.stringify({ success: false, message: "You are already a member of this company" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create the membership request
    const { data, error } = await supabaseClient
      .from("membership_requests")
      .insert({
        company_id,
        user_id: user.user.id,
        requested_role,
        status: "pending",
        message: message || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Send notification to company admins

    return new Response(
      JSON.stringify({ success: true, message: "Membership request sent successfully", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in request_membership function:", error);

    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});