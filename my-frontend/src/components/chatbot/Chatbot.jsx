import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "../../css/Chatbot.css";

function GeneratorUI() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("idle");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setStatus("generating");

    setTimeout(() => {
      setStatus("completed");
    }, 3000);
  };

  return (
    <div className="ai-generator-panel">
      <h5>AI tạo mô hình 3D</h5>

      {status === "idle" && (
        <>
          <textarea
            className="ai-prompt-input"
            placeholder="Nhập mô tả phòng bạn muốn dựng 3D"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <button className="ai-generate-btn" onClick={handleGenerate} disabled={!prompt.trim()}>
            Khởi tạo 3D
          </button>
        </>
      )}

      {status === "generating" && (
        <div className="ai-generating-state">
          <div className="ai-spinner"></div>
          <p>Đang phân tích và render mô hình 3D...</p>
        </div>
      )}

      {status === "completed" && (
        <div className="ai-completed-state">
          <div className="ai-preview-box">
            <div className="mock-3d-scene">
              <span>Cube Rendered</span>
            </div>
          </div>
          <p>Đã tạo xong mô hình.</p>
          <button className="ai-generate-btn retry" onClick={() => setStatus("idle")}>
            Tạo lại
          </button>
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể tra dữ liệu phòng, đánh giá, lịch xem, thanh toán và hợp đồng cho bạn.",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isReplying) return;

    const currentInput = inputValue.trim();
    const userMsg = { id: Date.now(), text: currentInput, sender: "user" };
    const loweredInput = currentInput.toLowerCase();

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsReplying(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentInput }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.reply || "Mình chưa có câu trả lời phù hợp lúc này.",
          sender: "bot",
          suggestions: Array.isArray(data.suggestions) && data.suggestions.length > 0 ? data.suggestions : null,
          show3DGenerator:
            loweredInput.includes("3d") ||
            loweredInput.includes("mô hình") ||
            loweredInput.includes("mo hinh") ||
            loweredInput.includes("vẽ") ||
            loweredInput.includes("ve") ||
            loweredInput.includes("tạo"),
          isCancelRequest: data.is_cancel_request,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Mình chưa kết nối được tới chatbot backend. Bạn hãy kiểm tra server rồi thử lại nhé.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <>
      <button className={`chatbot-fab ${isOpen ? "hidden" : ""}`} onClick={() => setIsOpen(true)}>
        <span className="fab-icon">💬</span>
      </button>

      <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <div className="bot-info">
            <span className="bot-avatar">🤖</span>
            <div>
              <h4>MyHousing AI</h4>
              <p>Đọc dữ liệu từ hệ thống</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              <div 
                className="markdown-response"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.text)) }}
              />

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="bot-suggestions">
                  {msg.suggestions.map((room) => (
                    <Link
                      to={`/product/${room._id || room.id}`}
                      key={room._id || room.id}
                      className="suggestion-card"
                      onClick={() => setIsOpen(false)}
                    >
                      <img src={room.images?.[0] || room.image} alt={room.name} />
                      <div className="sg-info">
                        <h5>{room.name}</h5>
                        <span className="sg-price">
                          {typeof room.price === "number" ? `${room.price.toLocaleString("vi-VN")}đ / tháng` : room.price}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {msg.show3DGenerator && <GeneratorUI />}
              {msg.isCancelRequest && (
                <div style={{ marginTop: "10px" }}>
                  <Link
                    to="/customer-dashboard?tab=rented"
                    className="ai-generate-btn"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      textDecoration: "none",
                      backgroundColor: "#dc2626",
                      color: "white",
                    }}
                  >
                    Đi đến trang Quản lý phòng đang thuê (Hủy thuê)
                  </Link>
                </div>
              )}
            </div>
          ))}

          {isReplying && (
            <div className="message-bubble bot">
              <div>đợi mình vài giây nha ^^</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Nhập câu hỏi về dữ liệu hệ thống..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={!inputValue.trim() || isReplying}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
