import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestAction {
  request_id: string;
  action: "approve" | "reject";
}

interface RequestResponse {
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
    const { request_id, action }: RequestAction = await req.json();

    // Validate input
    if (!request_id || !action) {
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

    // Get the request details
    const { data: request, error: requestError } = await supabaseClient
      .from("membership_requests")
      .select("*, company_id")
      .eq("id", request_id)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ success: false, message: "Request not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if user has permission to handle this request
    const { data: membership, error: membershipError } = await supabaseClient
      .from("company_members")
      .select("role")
      .eq("company_id", request.company_id)
      .eq("user_id", user.user.id)
      .single();

    if (membershipError || !membership || (membership.role !== "owner" && membership.role !== "manager")) {
      return new Response(
        JSON.stringify({ success: false, message: "You don't have permission to handle this request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    if (action === "approve") {
      // Update request status
      const { error: updateError } = await supabaseClient
        .from("membership_requests")
        .update({ status: "approved" })
        .eq("id", request_id);

      if (updateError) {
        throw updateError;
      }

      // Add user to company
      const { error: membershipInsertError } = await supabaseClient
        .from("company_members")
        .insert({
          company_id: request.company_id,
          user_id: request.user_id,
          role: request.requested_role,
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (membershipInsertError) {
        throw membershipInsertError;
      }

      // TODO: Send notification to user

      return new Response(
        JSON.stringify({ success: true, message: "Request approved successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else if (action === "reject") {
      // Update request status
      const { error: updateError } = await supabaseClient
        .from("membership_requests")
        .update({ status: "rejected" })
        .eq("id", request_id);

      if (updateError) {
        throw updateError;
      }

      // TODO: Send notification to user

      return new Response(
        JSON.stringify({ success: true, message: "Request rejected successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in handle_membership_request function:", error);

    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});