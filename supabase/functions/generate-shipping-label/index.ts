// Edge Function: generate-shipping-label
// Generates a prepaid shipping label via EasyPost/Shippo.
// POST-MVP: Not implemented until shipping feature is built.

Deno.serve(async (_req) => {
  return new Response(
    JSON.stringify({
      error: "Not implemented",
      message: "Shipping label generation is not available in this version.",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 501,
    },
  );
});
