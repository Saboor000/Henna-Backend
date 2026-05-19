import { stripe } from "../../../lib/stripe.js";
import { supabase } from "../../../lib/supabase.js";

export const createCheckoutSession = async (items, customerEmail) => {
  const productIds = items.map((i) => i.productId);

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, price, discount_price, product_variants(id, label, value, price_modifier)",
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (error) throw new Error(`Database error: ${error.message}`);

  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found.`);

    let unitPrice = product.discount_price ?? product.price;

    if (item.variantId) {
      const variant = product.product_variants?.find(
        (v) => v.id === item.variantId,
      );
      if (variant) unitPrice += variant.price_modifier ?? 0;
    }

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          metadata: {
            product_id: String(product.id),
            variant_id: item.variantId ? String(item.variantId) : "",
          },
        },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: item.quantity ?? 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    metadata: {
      items: JSON.stringify(items),
    },
  });

  return { sessionId: session.id, url: session.url };
};

export const handleStripeWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const items = JSON.parse(session.metadata.items ?? "[]");

    const { error } = await supabase.from("orders").insert([
      {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        customer_email: session.customer_email,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
        items: items,
      },
    ]);

    if (error) throw new Error(`Failed to save order: ${error.message}`);
  }

  return { received: true };
};
