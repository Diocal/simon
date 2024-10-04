const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Incluye directamente tu token para pruebas
const token = '7748403241:AAHgfohtZl40xuEtwBF9W-hTWWXPiTYbAkM';

if (!token) {
  throw new Error("El token de Telegram no está definido.");
}

// Crear una instancia del bot de Telegram, sin usar polling (para webhooks)
const bot = new TelegramBot(token, { polling: false });

// Crear una aplicación Express para manejar el webhook
const app = express();
app.use(bodyParser.json());  // Usar body-parser para procesar JSON

// Configurar el webhook para Telegram con la URL de Vercel
bot.setWebHook(`https://simon-lyart.vercel.app/bot${token}`);

// Ruta para recibir las actualizaciones desde Telegram
app.post(`/bot${token}`, (req, res) => {
  console.log("Webhook activado: ", req.body);  // Log para depuración
  bot.processUpdate(req.body);  // Procesar la actualización
  res.sendStatus(200);  // Responder a Telegram que todo fue bien
});

// Ruta raíz para verificar que el bot esté funcionando
app.get('/', (req, res) => {
  console.log('Verificación de la ruta raíz activada');  // Log para depuración
  res.send('¡Bot de Telegram funcionando en Vercel!');
});

// Manejador para el comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log("/start recibido de:", chatId);  // Log para depuración
  bot.sendMessage(chatId, "¡Bienvenido al juego de Simon! Usa los botones para comenzar.");
});

// Manejador general para todos los mensajes, para depurar
bot.on('message', (msg) => {
  console.log('Mensaje recibido:', msg);  // Esto te ayudará a ver qué mensajes llegan
});

// Iniciar el servidor en Vercel (Vercel lo maneja automáticamente)
module.exports = app;
