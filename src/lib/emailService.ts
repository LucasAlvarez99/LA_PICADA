    export async function sendOrderEmail(order: any) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "La Picada <pedidos@lapicada.com>",
        to: ["lucas.alvarez.bernardez.99@gmail.com"], // 👈 acá llega el pedido
        subject: `Nuevo pedido #${order.order_number}`,
        html: `
          <h2>Nuevo pedido recibido</h2>
          <p><b>Número de orden:</b> ${order.order_number}</p>
          <p><b>Cliente:</b> ${order.customer_name}</p>
          <p><b>Teléfono:</b> ${order.customer_phone}</p>
          <p><b>Email:</b> ${order.customer_email}</p>
          <p><b>Dirección:</b> ${order.customer_address || "Retiro en local"}</p>
          <p><b>Medio de pago:</b> ${order.payment_method}</p>
          <p><b>Entrega:</b> ${order.delivery_method}</p>
          <h3>Productos</h3>
          <ul>
            ${order.products.map((p: any) => `<li>${p.qty}x ${p.name} ($${p.price})</li>`).join("")}
          </ul>
          <p><b>Total:</b> $${order.total}</p>
        `,
      }),
    });

    const data = await res.json();
    console.log("📧 Mail enviado:", data);
  } catch (error) {
    console.error("❌ Error enviando mail:", error);
  }
}
