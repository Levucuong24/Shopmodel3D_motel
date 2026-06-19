import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getAuthToken } from "../../utils/authStorage.js";
import "../../css/InboxManager.css";

const SOCKET_URL = window.location.origin;

function InboxManager() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const authToken = getAuthToken();

  useEffect(() => {
    fetchConversations();

    // Initialize socket
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("new_inbox_message", (data) => {
      const { conversation, message } = data;
      
      // Update conversations list
      setConversations((prev) => {
        const exists = prev.find(c => c._id === conversation._id);
        if (exists) {
          return [conversation, ...prev.filter(c => c._id !== conversation._id)];
        }
        return [conversation, ...prev];
      });

      // Update current messages if active
      setActiveConv((currentActive) => {
        if (currentActive && currentActive._id === conversation._id) {
          setMessages((prev) => [...prev, message]);
          
          // Reset unread locally if we are viewing it
          setConversations((prev) => prev.map(c => 
            c._id === conversation._id ? { ...c, unread_count: 0 } : c
          ));
        }
        return currentActive;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/inbox/conversations", {
        headers: { Authorization: authToken }
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await fetch(`/api/inbox/${convId}/messages`, {
        headers: { Authorization: authToken }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      
      // Reset unread
      setConversations(prev => prev.map(c => c._id === convId ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    try {
      const res = await fetch(`/api/inbox/${activeConv._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken
        },
        body: JSON.stringify({ content: replyText })
      });
      if (res.ok) {
        setReplyText("");
        // Message will be appended via socket
      }
    } catch (err) {
      console.error(err);
    }
  };

  const simulateZaloMessage = async () => {
    try {
      await fetch("/api/inbox/webhook/zalo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_zalo_id: "ZALO_" + Math.floor(Math.random() * 10000),
          guest_name: "Khách từ Zalo",
          content: "Cho mình hỏi phòng này còn không ạ?"
        })
      });
      alert("Đã nhận tin nhắn giả lập từ Zalo!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="inbox-container">
      <div className="inbox-sidebar">
        <div className="inbox-header">
          <h2>Hộp thư</h2>
          <button className="mock-zalo-btn" onClick={simulateZaloMessage}>+ Zalo Msg</button>
        </div>
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv._id} 
              className={`conversation-item ${activeConv?._id === conv._id ? 'active' : ''}`}
              onClick={() => setActiveConv(conv)}
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conv.guest_name || "Khách")}&background=random`} 
                alt="Avatar" 
                className="conv-avatar" 
              />
              <div className="conv-info">
                <div className="conv-header">
                  <span className="conv-name">{conv.guest_name}</span>
                  <span className={`channel-badge ${conv.channel}`}>{conv.channel.toUpperCase()}</span>
                </div>
                <div className="conv-last-msg">
                  {conv.last_message || "Chưa có tin nhắn"}
                  {conv.unread_count > 0 && <span className="unread-dot"></span>}
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>Không có hội thoại nào.</p>
          )}
        </div>
      </div>

      <div className="inbox-main">
        {activeConv ? (
          <>
            <div className="chat-header">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.guest_name || "Khách")}&background=random`} 
                alt="Avatar" 
                style={{ width: "40px", height: "40px", borderRadius: "50%" }} 
              />
              <div>
                <strong style={{ display: "block" }}>{activeConv.guest_name}</strong>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đến từ: {activeConv.channel}</span>
              </div>
            </div>
            
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg._id} className={`chat-bubble-wrapper ${msg.sender_type === 'staff' ? 'staff' : 'customer'}`}>
                  <div className="chat-bubble">
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendReply}>
              <input 
                type="text" 
                placeholder="Nhập câu trả lời..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!replyText.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            Chọn một đoạn chat để bắt đầu trả lời
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxManager;
