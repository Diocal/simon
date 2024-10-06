const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Incluye directamente tu token para pruebas
const token = process.env.TELEGRAM_TOKEN || 'TU_TOKEN'; // Reemplaza con tu token real o usa variable de entorno

if (!token) {
  throw new Error("El token de Telegram no está definido.");
}

// Crear una instancia del bot de Telegram, sin usar polling (para webhooks)
const bot = new TelegramBot(token, { polling: false });

// Crear una aplicación Express para manejar el webhook
const app = express();
app.use(bodyParser.json());  // Usar body-parser para procesar JSON

// Configurar el webhook para Telegram con la URL de Vercel
bot.setWebHook(`https://simon-lyart.vercel.app/webhook`);
console.log("Webhook configurado en https://simon-lyart.vercel.app/webhook");

// Ruta para recibir las actualizaciones desde Telegram
app.post('/webhook', async (req, res) => {
  console.log("Webhook activado: ", req.body);  // Log para depuración
  
  // Intentar procesar la actualización con reintento en caso de error
  try {
    await bot.processUpdate(req.body);  // Procesar la actualización
    console.log("Actualización procesada con éxito");  // Log de éxito
    res.sendStatus(200);  // Responder a Telegram que todo fue bien
  } catch (error) {
    console.error("Error procesando la actualización: ", error);  // Log de error
    res.sendStatus(500);  // Enviar respuesta 500 en caso de error

    // Intentar procesar la actualización después de 2 segundos
    setTimeout(() => {
      console.log("Reintentando procesar la actualización...");
      bot.processUpdate(req.body).catch((err) => console.error("Error en el reintento:", err));
    }, 2000);
  }
});

// Ruta raíz para verificar que el bot esté funcionando
app.get('/', (req, res) => {
  console.log('Verificación de la ruta raíz activada');
  res.send('¡Bot de Telegram funcionando en Vercel!');
});

// Manejador para el comando /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log("/start recibido de:", chatId);  // Log para depuración
  
  try {
    // Enviar el enlace al juego Simon hospedado en Vercel como un link clicable
    const gameUrl = 'https://simon-lyart.vercel.app/';
    await bot.sendMessage(chatId, `¡Bienvenido al juego de Simon! Haz clic en el enlace para jugar:\n\n[🎮 Juega aquí](https://simon-lyart.vercel.app/)`, { parse_mode: 'Markdown' });
    console.log(`Mensaje enviado correctamente al chatId: ${chatId}`);
  } catch (error) {
    console.error("Error enviando el mensaje /start: ", error);
  }
});

// Manejador general para todos los mensajes, para depurar
bot.on('message', (msg) => {
  console.log('Mensaje recibido:', msg);  // Esto te ayudará a ver qué mensajes llegan
});

module.exports = app;  // Exportar la aplicación para Vercel
