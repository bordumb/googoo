// Edge Function: create-checkout
// Creates a Stripe PaymentIntent for a listing purchase.
// POST-MVP: Not implemented until payments feature is built.

Deno.serve(async (_req) => {
  return new Response(
    JSON.stringify({
      error: "Not implemented",
      message: "Payment processing is not available in this version.",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 501,
    },
  );
});
