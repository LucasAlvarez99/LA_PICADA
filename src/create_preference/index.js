import express from "express";
import mercadopago from "mercadopago";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Configurar credenciales
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Crear preferencia de pago
app.post("/create_preference", async (req, res) => {
  try {
    const { orderNumber, items, customerEmail } = req.body;

    const preference = {
      items: items.map((item) => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      })),
      payer: {
        email: customerEmail,
      },
      external_reference: orderNumber,
      back_urls: {
        success: "http://localhost:5173/order-success",
        failure: "http://localhost:5173/checkout",
        pending: "http://localhost:5173/checkout",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ id: response.body.id, init_point: response.body.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando preferencia de pago" });
  }
});

app.listen(3001, () => {
  console.log("Servidor backend escuchando en http://localhost:3001");
});