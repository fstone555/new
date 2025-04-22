import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const userId = Number(localStorage.getItem('userId')); // ตรวจสอบ userId ใน localStorage
  const currentUserRole = localStorage.getItem('role'); // ตรวจสอบ role ใน localStorage

  useEffect(() => {
    // ตรวจสอบค่า role และ userId ที่เก็บใน localStorage
    console.log("User role:", currentUserRole);
    console.log("User ID:", userId);

    if (!currentUserRole || !userId) {
      console.error("ข้อมูลผู้ใช้ไม่ถูกต้องใน localStorage");
      return; // หากไม่มีข้อมูลจะไม่ทำงาน
    }

    axios.get('http://localhost:3000/api/users')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error('API response is not an array');
        }
      })
      .catch((error) => console.error('Error fetching users:', error));
  }, [currentUserRole, userId]);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`http://localhost:3000/api/chat/messages/${userId}/${selectedUser.user_id}`)
        .then((response) => {
          setMessages(response.data.messages);
        })
        .catch((error) => console.error('Error fetching messages:', error));
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      axios.post('http://localhost:3000/api/chat/send', {
        sender_id: userId,
        receiver_id: selectedUser.user_id,
        message_text: newMessage,
        message_type: 'text',
        file_url: null
      })
        .then(() => {
          setMessages(prev => [...prev, {
            sender_id: userId,
            receiver_id: selectedUser.user_id,
            message_text: newMessage,
            timestamp: new Date().toISOString()
          }]);
          setNewMessage('');
        })
        .catch((error) => console.error('Error sending message:', error));
    }
  };

  // กรองผู้ใช้ที่แสดงตามบทบาท
  const filteredUsers = users.filter((user) => {
    if (currentUserRole === 'user') {
      return user.role === 'admin';  // user จะเห็นแค่ admin
    } else if (currentUserRole === 'admin') {
      return true;  // admin จะเห็นทุกรายชื่อผู้ใช้
    }
    return false;
  });

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="sidebar-title">👥 รายชื่อผู้ใช้</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือ username"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user.user_id}
                onClick={() => setSelectedUser(user)}
                className={`user-item ${selectedUser?.user_id === user.user_id ? 'selected' : ''}`}
              >
                <div className="avatar">{user.firstname?.charAt(0)}</div>
                <div className="user-info">
                  <p className="user-name">{user.firstname} {user.lastname}</p>
                  <p className="user-username">@{user.username}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-user">ไม่พบผู้ใช้</p>
          )}
        </div>
      </div>

      <div className="chat-box">
        {selectedUser ? (
          <>
            <h2 className="chat-header">💬 แชทกับ {selectedUser.firstname} {selectedUser.lastname}</h2>
            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message-item ${message.sender_id === userId ? 'self' : 'other'}`}
                  >
                    <p>{message.message_text}</p>
                    <small style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px', display: 'block' }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="no-messages">ยังไม่มีข้อความ...</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-area">
              <input
                type="text"
                placeholder="พิมพ์ข้อความ..."
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleSendMessage}>ส่ง</button>
            </div>
          </>
        ) : (
          <div className="no-user-selected">🟡 กรุณาเลือกผู้ใช้เพื่อเริ่มแชท</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
