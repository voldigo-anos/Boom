const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fonts = require('../../func/font.js');

const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const TMP_DIR = path.join(__dirname, 'tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// Fonction pour transformer le texte selon tes nouvelles règles
const formatCoolText = (text) => {
  if (!text) return "";
  
  // 1. Remplacements de noms standards
  let formatted = text
    .replace(/Heck.ai/gi, "Christus")
    .replace(/Aryan/gi, "Christus")
    .replace(/Shizu AI|Shizuka AI|Shizuka|Shizu/gi, "Christus AI");

  // 2. Détection des *mots* -> Conversion en serif et suppression des *
  // On utilise une regex pour capturer le contenu entre astérisques
  formatted = formatted.replace(/\*(.*?)\*/g, (match, p1) => {
    return fonts.serif(p1); 
  });

  // 3. Conversion de tout le reste en sansSerif
  return fonts.sansSerif(formatted);
};

const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

const handleAIRequest = async (api, event, userInput, message, isReply = false) => {
  const userId = event.senderID;
  let messageContent = userInput;
  let imageUrl = null;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  if (event.messageReply) {
    const attachment = event.messageReply.attachments?.[0];
    if (attachment?.type === 'photo') imageUrl = attachment.url;
  }

  try {
    const response = await axios.post(
      API_ENDPOINT,
      { uid: userId, message: messageContent, image_url: imageUrl },
      { timeout: 60000 }
    );

    const {
      reply: textReply,
      image_url: genImageUrl,
      music_data: musicData,
      video_data: videoData,
      shotti_data: shotiData
    } = response.data;

    // Application du nouveau formatage (SansSerif + Serif pour les mots entre étoiles)
    const finalBody = formatCoolText(textReply);

    const attachments = [];
    if (genImageUrl) attachments.push(fs.createReadStream(await downloadFile(genImageUrl, 'jpg')));
    if (musicData?.downloadUrl) attachments.push(fs.createReadStream(await downloadFile(musicData.downloadUrl, 'mp3')));
    if (videoData?.downloadUrl || shotiData?.videoUrl) {
      const vUrl = videoData?.downloadUrl || shotiData?.videoUrl;
      attachments.push(fs.createReadStream(await downloadFile(vUrl, 'mp4')));
    }

    await message.reply({
      body: finalBody,
      attachment: attachments.length > 0 ? attachments : undefined
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);

  } catch (error) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply(fonts.sansSerif("⚠️ Error: " + error.message));
  }
};

module.exports = {
  config: {
    name: 'ai',
    aliases: ['christus'],
    version: '2.2.0',
    author: 'Christus',
    role: 0,
    category: 'ai',
    longDescription: { en: 'AI with dynamic font formatting' },
    guide: { en: '.ai [message]' }
  },

  onStart: async function ({ api, event, args, message }) {
    const userInput = args.join(' ').trim();
    if (!userInput) return message.reply(fonts.sansSerif("❗ Please enter a message."));
    return await handleAIRequest(api, event, userInput, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;
    return await handleAIRequest(api, event, event.body, message, true);
  }
};
