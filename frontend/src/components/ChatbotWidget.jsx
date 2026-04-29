import { useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";
import api from "../services/api";
import { useTranslation } from "react-i18next";

const quickActionsByRole = {
  shipper: ["Résumé de mon activité", "Comment réduire mon CO2 ?", "Comment mieux planifier mes expéditions ?"],
  carrier: ["Résumé de mes missions", "Conseil éco pour ma flotte", "Comment augmenter mon score vert ?"],
  client: ["Où en sont mes commandes ?", "Mes notifications non lues", "Comment lire mon impact carbone ?"],
  admin: ["État global plateforme", "Anomalies à surveiller", "Conseil pour optimiser l'adoption"],
};

function createFallbackReply(text, context) {
  const query = text.toLowerCase();
  if (query.includes("resume") || query.includes("activite")) {
    return `Vous avez ${context.shipmentsCount} expeditions, ${context.missionsCount} missions et ${context.notificationsUnread} notifications non lues. Credits disponibles: ${context.creditsAvailable} t.`;
  }
  if (query.includes("notification")) {
    return `Il y a actuellement ${context.notificationsUnread} notification(s) non lue(s). Ouvrez la page Notifications pour les traiter rapidement.`;
  }
  if (query.includes("co2") || query.includes("carbone") || query.includes("conseil")) {
    return "Astuce eco: regroupez les envois, favorisez les transporteurs electriques et achetez des credits en fin de semaine pour compenser les pics d'emission.";
  }
  if (query.includes("bonjour") || query.includes("salut") || query.includes("hello")) {
    return `Bonjour ${context.userName}, je peux vous aider avec vos expeditions, missions, notifications et bilan carbone.`;
  }
  return "Je peux vous aider sur les expeditions, missions, notifications, credits carbone et rapports. Essayez une action rapide ci-dessous.";
}

export default function ChatbotWidget({ role }) {
  const quickActions = quickActionsByRole[role] || quickActionsByRole.shipper;

  const { user } = useAuth();
  const { shipments, missions, orders, notifications, credits } = usePlatform();
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Bonjour, je suis EcoBot. Je peux vous guider sur la plateforme.",
    },
  ]);

  const context = useMemo(
    () => ({
      userName: user?.name || "utilisateur",
      shipmentsCount: shipments.length || orders.length,
      missionsCount: missions.length,
      notificationsUnread: notifications.filter((n) => !n.is_read).length,
      creditsAvailable: credits?.available ?? 0,
    }),
    [user, shipments, orders, missions, notifications, credits]
  );

  const askAssistant = async (question, currentContext) => {
    try {
      const response = await api.post("/ai/chat", {
        message: question,
        context: currentContext,
      });
      return response.data?.reply || createFallbackReply(question, currentContext);
    } catch (error) {
      return createFallbackReply(question, currentContext);
    }
  };

  const sendMessage = async (value) => {
    const clean = value.trim();
    if (!clean || isLoading) return;
    const userMessage = { id: Date.now(), from: "user", text: clean };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    const replyText = await askAssistant(clean, context);
    const reply = { id: Date.now() + 1, from: "bot", text: replyText };
    setMessages((prev) => [...prev, reply]);
    setIsLoading(false);
  };

  return (
    <div className="chatbot-root">
      {isOpen && (
        <section className="chatbot-panel" aria-label="Assistant EcoBot">
          <header className="chatbot-head">
            <div>
              <div className="chatbot-title">EcoBot Assistant</div>
              <div className="chatbot-sub">Role: {role}</div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </header>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.from === "user" ? "chat-msg-user" : "chat-msg-bot"}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="chat-msg chat-msg-bot chat-msg-thinking">{t("common.thinking")}</div>}
          </div>
          <div className="chatbot-quick-actions">
            {quickActions.map((action) => (
              <button key={action} className="chatbot-chip" onClick={() => sendMessage(action)} disabled={isLoading}>
                {action}
              </button>
            ))}
          </div>
          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Posez une question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(input);
              }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => sendMessage(input)} disabled={isLoading}>
              {isLoading ? "..." : t("common.send")}
            </button>
          </div>
        </section>
      )}

      <button
        className="chatbot-fab"
        onClick={() => {
          setIsOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        {isOpen ? "Fermer chat" : "💬 Assistant"}
      </button>
    </div>
  );
}
