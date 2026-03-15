import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products';
import './Chatbot.css';

function GeneratorUI() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("idle");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setStatus("generating");
    
    // Fake render time
    setTimeout(() => {
      setStatus("completed");
    }, 3000);
  };

  return (
    <div className="ai-generator-panel">
      <h5>AI Tạo Mô Hình 3D</h5>
      
      {status === 'idle' && (
        <>
          <textarea 
            className="ai-prompt-input" 
            placeholder="Nhập mô tả (VD: Căn phòng có giường đơn, bàn học cạnh cửa sổ, phong cách mộc mạc...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          ></textarea>
          <button className="ai-generate-btn" onClick={handleGenerate} disabled={!prompt.trim()}>
            ✨ Khởi tạo 3D
          </button>
        </>
      )}

      {status === 'generating' && (
        <div className="ai-generating-state">
          <div className="ai-spinner"></div>
          <p>Đang phân tích và render 3D...</p>
        </div>
      )}

      {status === 'completed' && (
        <div className="ai-completed-state">
          <div className="ai-preview-box">
             {/* Fake 3D model image indicator */}
             <div className="mock-3d-scene">
               <span>Cube Rendered</span>
             </div>
          </div>
          <p>✅ Đã tạo xong mô hình!</p>
          <button className="ai-generate-btn retry" onClick={() => setStatus('idle')}>Tạo lại</button>
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Mock bot response
    setTimeout(() => {
      let botResponse = "Cảm ơn bạn đã liên hệ. Nhân viên của chúng tôi sẽ phản hồi sớm nhất.";
      let suggestedProducts = [];
      
      const lowerInput = userMsg.text.toLowerCase();
      
      if (lowerInput.includes("giá") || lowerInput.includes("bao nhiêu")) {
        botResponse = "Giá phòng trung bình từ 3.500.000đ đến 6.000.000đ tùy khu vực. Bạn muốn xem nhà ở Tân Xã Hòa Lạc hay khu vực khác?";
      } else if (lowerInput.includes("liên hệ") || lowerInput.includes("sđt")) {
        botResponse = "Bạn có thể liên hệ hotline: 0912 345 678 để được hỗ trợ trực tiếp 24/7 nhé.";
      } else if (lowerInput.includes("xin chào") || lowerInput.includes("hi")) {
        botResponse = "Chào bạn! Chúc bạn một ngày tốt lành. Bạn đang tìm phòng trọ khu vực nào hay mức giá bao nhiêu?";
      } else if (lowerInput.includes("gợi ý") || lowerInput.includes("tư vấn") || lowerInput.includes("tìm phòng") || lowerInput.includes("tân xã") || lowerInput.includes("hòa lạc") || lowerInput.includes("rẻ")) {
        
        botResponse = "Dựa trên nhu cầu của bạn, AI của chúng tôi xin gợi ý một số phòng trọ phù hợp nhất hiện nay:";
        
        if (lowerInput.includes("tân xã") || lowerInput.includes("rẻ") || lowerInput.includes("sinh viên")) {
          suggestedProducts = products.filter(p => p.name.toLowerCase().includes("tân xã") || p.price.includes("3."));
        } else if (lowerInput.includes("cao cấp") || lowerInput.includes("đẹp") || lowerInput.includes("bình yên")) {
          suggestedProducts = products.filter(p => p.name.toLowerCase().includes("bình yên") || p.price.includes("6."));
        } else {
          suggestedProducts = products.slice(0, 2); // Default to top 2
        }
      } else if (lowerInput.includes("3d") || lowerInput.includes("mô hình") || lowerInput.includes("ve") || lowerInput.includes("tạo")) {
        botResponse = "Tính năng **AI tạo mô hình 3D** đã sẵn sàng! Bạn hãy nhập mô tả về căn phòng bạn muốn tạo ở công cụ bên dưới nhé:";
      }

      const botMsg = { 
        id: Date.now(), 
        text: botResponse, 
        sender: "bot",
        suggestions: suggestedProducts.length > 0 ? suggestedProducts : null,
        show3DGenerator: lowerInput.includes("3d") || lowerInput.includes("mô hình") || lowerInput.includes("ve") || lowerInput.includes("tạo")
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="fab-icon">💬</span>
      </button>

      {/* Chatbot Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="bot-info">
            <span className="bot-avatar">🤖</span>
            <div>
              <h4>MyHousing Support</h4>
              <p>Luôn trực tuyến</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
              
              {/* Render AI Suggestions if available */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="bot-suggestions">
                  {msg.suggestions.map(p => (
                    <Link to={`/product/${p.id}`} key={p.id} className="suggestion-card" onClick={() => setIsOpen(false)}>
                      <img src={p.image} alt={p.name} />
                      <div className="sg-info">
                        <h5>{p.name}</h5>
                        <span className="sg-price">{p.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Render 3D Generator if applicable */}
              {msg.show3DGenerator && <GeneratorUI />}

            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={!inputValue.trim()}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
