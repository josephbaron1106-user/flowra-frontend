import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";

function CustomerChat() {
  const initialConversations = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "P",
      online: true,
      lastMsg: "Can I add a custom card message to my anniversary bouquet?",
      time: "2m ago",
      unread: 1,
      messages: [
        { sender: "customer", text: "Hello! I placed Order #FLW-94021 for the Blush Romance Bouquet.", time: "02:40 PM" },
        { sender: "customer", text: "Can I add a custom card message to my anniversary bouquet?", time: "02:42 PM" },
        { sender: "admin", text: "Hi Priya! 🌸 Absolutely, our florist has attached your message card with handwritten gold ink. It is currently in the packaging phase.", time: "02:44 PM" },
      ],
    },
    {
      id: 2,
      name: "Rahul Mehta",
      avatar: "R",
      online: true,
      lastMsg: "Thank you! Driver called and is 5 mins away.",
      time: "15m ago",
      unread: 0,
      messages: [
        { sender: "customer", text: "Hi, any update on the 24 Red Roses delivery?", time: "01:20 PM" },
        { sender: "admin", text: "Hello Rahul! Driver Sunil has picked up the climate-controlled van and is in Bandra West right now.", time: "01:25 PM" },
        { sender: "customer", text: "Thank you! Driver called and is 5 mins away.", time: "01:30 PM" },
      ],
    },
    {
      id: 3,
      name: "Ananya Iyer",
      avatar: "A",
      online: false,
      lastMsg: "Do you have 50 white proteas available for next weekend?",
      time: "1h ago",
      unread: 1,
      messages: [
        { sender: "customer", text: "Hi Flowra team! Do you have 50 white proteas available for next weekend?", time: "12:15 PM" },
      ],
    },
  ];

  const [conversations, setConversations] = useState(initialConversations);
  const [activeChatId, setActiveChatId] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg = {
      sender: "admin",
      text: textToSend,
      time: timeStr,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: textToSend, time: "Just now", unread: 0 }
          : c
      )
    );
    setInputText("");

    try {
      await fetch("http://localhost:8080/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeChat?.dbId || (typeof activeChat?.id === "number" ? activeChat.id : null),
          customerName: activeChat?.name || "Customer",
          senderType: "admin",
          messageText: textToSend,
        }),
      });
    } catch (err) {
      console.warn("Chat persistence error:", err);
    }
  };

  const handleQuickCanned = (phrase) => {
    setInputText(phrase);
  };

  return (
    <AdminLayout pageTitle="Live Customer Concierge Chat">
      <div className="chat-interface-card">
        {/* LEFT CUSTOMER LIST */}
        <aside className="chat-sidebar-column">
          <div className="chat-search-wrap">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />
          </div>

          <div className="chat-conversations-list">
            {conversations
              .filter((c) => c.name.toLowerCase().includes(searchCustomer.toLowerCase()))
              .map((c) => (
                <div
                  key={c.id}
                  className={`chat-contact-row ${c.id === activeChatId ? "active" : ""}`}
                  onClick={() => {
                    setActiveChatId(c.id);
                    setConversations((prev) =>
                      prev.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item))
                    );
                  }}
                >
                  <div className="avatar-online-wrap">
                    <span className="customer-avatar-badge">{c.avatar}</span>
                    {c.online && <span className="online-indicator" />}
                  </div>

                  <div className="contact-text-meta">
                    <div className="contact-name-row">
                      <strong>{c.name}</strong>
                      <small>{c.time}</small>
                    </div>
                    <p className="contact-last-msg">{c.lastMsg}</p>
                  </div>

                  {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
                </div>
              ))}
          </div>
        </aside>

        {/* RIGHT ACTIVE CHAT */}
        <main className="chat-window-column">
          <div className="chat-window-header">
            <div className="active-user-meta">
              <span className="customer-avatar-badge">{activeChat.avatar}</span>
              <div>
                <strong>{activeChat.name}</strong>
                <small>{activeChat.online ? "🟢 Online now" : "⚪ Offline"}</small>
              </div>
            </div>
            <button
              type="button"
              className="admin-btn-secondary small-btn"
              onClick={() => alert(`Marked conversation with ${activeChat.name} as resolved.`)}
            >
              ✓ Mark Resolved
            </button>
          </div>

          <div className="chat-messages-scroll">
            {activeChat.messages.map((m, idx) => (
              <div
                key={idx}
                className={`chat-bubble-wrap ${m.sender === "admin" ? "admin-side" : "customer-side"}`}
              >
                <div className="chat-bubble">
                  <p>{m.text}</p>
                  <small className="msg-time">{m.time}</small>
                </div>
              </div>
            ))}
          </div>

          {/* QUICK CANNED REPLIES */}
          <div className="canned-replies-bar">
            <span>Quick:</span>
            <button
              type="button"
              className="canned-pill"
              onClick={() => handleQuickCanned("Your bouquet is freshly arranged and on its way in our cold-chain van! 🌸")}
            >
              🚚 "On the way"
            </button>
            <button
              type="button"
              className="canned-pill"
              onClick={() => handleQuickCanned("We have attached your handwritten card message with complimentary wax seal! 💌")}
            >
              💌 "Card attached"
            </button>
            <button
              type="button"
              className="canned-pill"
              onClick={() => handleQuickCanned("Yes, we have confirmed morning harvest availability for your requested date! 🌿")}
            >
              🌿 "Stock confirmed"
            </button>
          </div>

          {/* MESSAGE COMPOSER */}
          <form onSubmit={handleSendMessage} className="chat-composer-form">
            <input
              type="text"
              placeholder={`Reply to ${activeChat.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              Send ✈️
            </button>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}

export default CustomerChat;
