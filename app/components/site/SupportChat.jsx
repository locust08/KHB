"use client";

import { Minimize2, RotateCcw, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency, ingredientData, sizeOptions, stores } from "./data";

const supportQuickPrompts = [
  "What sizes are available?",
  "How should I store it?",
  "Where are your locations?",
  "Does it contain dairy?"
];

function createAssistantMessage(text, extras = {}) {
  return {
    role: "assistant",
    text,
    ...extras
  };
}

function buildInitialMessage(mode) {
  return mode === "embedded"
    ? "Ask me about sizes, storage, allergens, pickup, or any Kenny Hills Bakers location."
    : "Hi, I'm Peach Support. Ask me about sizes, ingredients, storage, orders, or store locations.";
}

function matchStore(question) {
  const normalized = question.toLowerCase();

  return (
    stores.find((store) => {
      const aliases = [
        store.name.toLowerCase(),
        store.id.replace(/-/g, " "),
        ...(store.name.includes("(") ? [store.name.replace(/[()]/g, "").toLowerCase()] : [])
      ];

      return aliases.some((alias) => normalized.includes(alias));
    }) ?? null
  );
}

function buildStoreReply(store) {
  const details = [`${store.name} is at ${store.address}.`, `Hours: ${store.hours}.`];

  if (store.phone) {
    details.push(`Phone: ${store.phone}.`);
  }

  details.push("Open the location section on the Contact Us page to load this store directly in Google Maps.");
  return createAssistantMessage(details.join(" "), {
    mapEmbedUrl: store.mapUrl,
    mapLinkUrl: store.googleMapsUrl,
    mapTitle: store.name
  });
}

function getSupportReply(question) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return createAssistantMessage(
      "Ask me something simple like sizes, storage, allergens, ordering time, or a specific store name."
    );
  }

  const matchedStore = matchStore(normalized);
  if (matchedStore) {
    return buildStoreReply(matchedStore);
  }

  if (normalized.includes("size") || normalized.includes("serving") || normalized.includes("people")) {
    return createAssistantMessage(
      `There are 3 sizes: Single for 1-2 people at ${formatCurrency(sizeOptions[0].price)}, 6x6 for 4-6 people at ${formatCurrency(sizeOptions[1].price)}, and 8x8 for 8-10 people at ${formatCurrency(sizeOptions[2].price)}.`
    );
  }

  if (normalized.includes("price") || normalized.includes("cost") || normalized.includes("rm")) {
    return createAssistantMessage(
      `Pricing starts from ${formatCurrency(sizeOptions[0].price)} for the Single. The 6x6 is ${formatCurrency(sizeOptions[1].price)} and the 8x8 is ${formatCurrency(sizeOptions[2].price)}.`
    );
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("store it") ||
    normalized.includes("keep it") ||
    normalized.includes("freeze") ||
    normalized.includes("serve")
  ) {
    return createAssistantMessage(
      "Keep the Peach Strudel refrigerated at 0-4 C, do not freeze it, and let it rest for about 10 minutes before serving. It tastes best within 48 hours."
    );
  }

  if (
    normalized.includes("allergen") ||
    normalized.includes("dairy") ||
    normalized.includes("gluten") ||
    normalized.includes("egg")
  ) {
    return createAssistantMessage(
      "Yes. Peach Strudel contains dairy, gluten, and eggs. It is also made in a bakery environment that handles nuts and other common allergens."
    );
  }

  if (
    normalized.includes("ingredient") ||
    normalized.includes("what is in it") ||
    normalized.includes("contains")
  ) {
    return createAssistantMessage(
      `Key ingredients include ${ingredientData
        .map((item) => item.name.toLowerCase())
        .join(", ")}. The full ingredients are shown in the Ingredients & Storage page.`
    );
  }

  if (
    normalized.includes("order") ||
    normalized.includes("pickup") ||
    normalized.includes("delivery") ||
    normalized.includes("ready")
  ) {
    return createAssistantMessage(
      "You can order online with date selection. Whole sizes are usually ready in 2-4 days, and the site supports pickup as well as local delivery."
    );
  }

  if (
    normalized.includes("location") ||
    normalized.includes("store") ||
    normalized.includes("outlet") ||
    normalized.includes("branch")
  ) {
    if (normalized.includes("kuala lumpur")) {
      return createAssistantMessage(
        `Kuala Lumpur outlets include ${stores
          .filter((store) => store.state === "Kuala Lumpur")
          .map((store) => store.name)
          .join(", ")}. Ask for a specific branch name and I can show its map here.`
      );
    }

    if (normalized.includes("selangor")) {
      return createAssistantMessage(
        `Selangor outlets include ${stores
          .filter((store) => store.state === "Selangor")
          .map((store) => store.name)
          .join(", ")}. Ask for a specific branch name and I can show its map here.`
      );
    }

    if (normalized.includes("penang")) {
      return createAssistantMessage(
        `Penang outlets include ${stores
          .filter((store) => store.state === "Penang")
          .map((store) => store.name)
          .join(", ")}. Ask for a specific branch name and I can show its map here.`
      );
    }

    return createAssistantMessage(
      `There are currently ${stores.length} locations listed on the live Kenny Hills Bakers locations page, across Kuala Lumpur, Selangor, Putrajaya, and Penang. Ask me for a specific store name and I can show its map here.`
    );
  }

  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("call")) {
    return createAssistantMessage(
      "You can call the bakery at +60 3-2011 3090 or email hello@kennyhillsbakers.com. For store-specific info, ask me for the branch name."
    );
  }

  return createAssistantMessage(
    "I can help with sizes, pricing, ingredients, allergens, storage, ordering, and store locations. Try asking something like 'Where is Ampang?' or 'How long does it stay fresh?'."
  );
}

function PeachMark({ className = "" }) {
  return (
    <span aria-hidden="true" className={className}>
      <img alt="" src="/images/ui/peach-icon.svg" />
    </span>
  );
}

export default function SupportChat({ mode = "floating", externalPrompt = null }) {
  const pathname = usePathname();
  const shouldRenderFloating = mode === "floating" && pathname !== "/contact";
  const initialMessages = useMemo(
    () => [
      createAssistantMessage(buildInitialMessage(mode))
    ],
    [mode]
  );
  const [isOpen, setIsOpen] = useState(mode === "embedded");
  const [supportTheme, setSupportTheme] = useState(pathname === "/" ? "warm" : "light");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const messagesContainerRef = useRef(null);
  const messageEndRef = useRef(null);
  const promptList = useMemo(() => supportQuickPrompts, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (!messagesContainer) {
      return;
    }

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isOpen]);

  function sendPrompt(rawQuestion) {
    const question = rawQuestion.trim();

    if (!question) {
      return;
    }

    const assistantReply = getSupportReply(question);

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      assistantReply
    ]);
    setInput("");

    if (mode === "floating") {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    if (externalPrompt?.text) {
      sendPrompt(externalPrompt.text);
    }
  }, [externalPrompt?.id]);

  useEffect(() => {
    if (mode !== "floating") {
      return;
    }

    let frameId = 0;

    function syncSupportTheme() {
      frameId = 0;

      const probeX = Math.min(window.innerWidth - 1, Math.max(0, window.innerWidth - 44));
      const probeY = Math.min(window.innerHeight - 1, Math.max(0, window.innerHeight - 120));
      const target = document.elementFromPoint(probeX, probeY);
      const themedSection = target?.closest("[data-nav-theme]");
      const nextTheme =
        themedSection?.getAttribute("data-nav-theme") ?? (pathname === "/" ? "warm" : "light");

      setSupportTheme((current) => (current === nextTheme ? current : nextTheme));
    }

    function requestThemeSync() {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(syncSupportTheme);
    }

    requestThemeSync();
    window.addEventListener("scroll", requestThemeSync, { passive: true });
    window.addEventListener("resize", requestThemeSync);

    return () => {
      window.removeEventListener("scroll", requestThemeSync);
      window.removeEventListener("resize", requestThemeSync);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [mode, pathname]);

  if (!shouldRenderFloating && mode === "floating") {
    return null;
  }

  function resetChat() {
    setMessages(initialMessages);
    setInput("");

    if (mode === "floating") {
      setIsOpen(true);
    }
  }

  const shellClassName =
    mode === "embedded"
      ? "support-chat-shell support-chat-shell-embedded"
      : isOpen
        ? `support-chat-shell support-chat-shell-floating is-open support-chat-theme-${supportTheme}`
        : `support-chat-shell support-chat-shell-floating support-chat-theme-${supportTheme}`;

  return (
    <div className={shellClassName}>
      {mode === "floating" ? (
        <button
          aria-label={isOpen ? "Close Peach Support chat" : "Open Peach Support chat"}
          className="support-chat-toggle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <PeachMark className="support-chat-emoji" />
        </button>
      ) : null}

      {(mode === "embedded" || isOpen) && (
        <div className="support-chat-panel">
          <div className="support-chat-header">
            <div className="support-chat-title">
              {mode === "floating" ? (
                <PeachMark className="support-chat-emoji support-chat-emoji-title" />
              ) : null}
              <div>
                <strong>Peach AI Support</strong>
                <span>Instant answers for simple questions</span>
              </div>
            </div>

            <div className="support-chat-actions">
              <button
                aria-label="Reset Peach Support chat"
                className="support-chat-reset"
                onClick={resetChat}
                type="button"
              >
                <RotateCcw size={15} />
              </button>
              {mode === "floating" ? (
                <button
                  aria-label="Minimize Peach Support chat"
                  className="support-chat-minimize"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <Minimize2 size={16} />
                </button>
              ) : (
                <div className="support-chat-bot-mark" aria-hidden="true">
                  AI
                </div>
              )}
            </div>
          </div>

          <div className="support-chat-prompts">
            {promptList.map((prompt) => (
              <button
                key={prompt}
                className="support-chat-prompt"
                onClick={() => sendPrompt(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="support-chat-messages" ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "assistant"
                    ? "support-chat-message is-assistant"
                    : "support-chat-message is-user"
                }
              >
                <div className="support-chat-message-copy">{message.text}</div>
                {message.role === "assistant" && message.mapEmbedUrl ? (
                  <div className="support-chat-map-card">
                    <div className="support-chat-map-frame">
                      <iframe
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={message.mapEmbedUrl}
                        title={`${message.mapTitle} map`}
                      />
                    </div>
                    <a className="support-chat-map-link" href={message.mapLinkUrl} rel="noreferrer" target="_blank">
                      Open {message.mapTitle} in Google Maps
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <form
            className="support-chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendPrompt(input);
            }}
          >
            <input
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about sizes, allergens, or a store name..."
              value={input}
            />
            <button className="support-chat-send" type="submit">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
