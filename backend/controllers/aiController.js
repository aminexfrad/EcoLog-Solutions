const OpenAI = require("openai");

const hasApiKey = () => Boolean(process.env.OPENAI_API_KEY);

const buildSystemPrompt = (user) => {
  const role = user?.role || "utilisateur";
  return [
    "Tu es EcoBot, assistant de la plateforme EcoLog Solutions.",
    "Tu reponds en francais, de facon claire, concise et actionnable.",
    "Contexte utilisateur:",
    `- nom: ${user?.name || "inconnu"}`,
    `- role: ${role}`,
    "Donne des conseils logistiques eco-responsables et des etapes concretes.",
    "Si la question est hors sujet, recentre vers les fonctionnalites de la plateforme.",
  ].join("\n");
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Le champ 'message' est requis." });
    }

    if (!hasApiKey()) {
      return res.status(503).json({
        message: "Le service IA n'est pas configure. Ajoutez OPENAI_API_KEY dans le backend.",
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt(req.user) },
        { role: "user", content: message.trim() },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Je n'ai pas pu generer une reponse.";
    return res.json({ reply, model });
  } catch (error) {
    return next(error);
  }
};
