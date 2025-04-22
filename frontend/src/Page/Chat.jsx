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

  const userId = Number(localStorage.getItem('userId'));
  const currentUserRole = localStorage.getItem('role');

  useEffect(() => {
    if (!currentUserRole || !userId) {
      console.error("Invalid user data in localStorage");
      return;
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
    // เมื่อมีการส่งข้อความใหม่ให้เลื่อนเฉพาะเมื่อข้อความใหม่มีการเพิ่มเข้ามา
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

const scrollToBottom = () => {
    const messagesEnd = messagesEndRef.current;
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const username = user.username.toLowerCase();
    const term = searchTerm.toLowerCase();

    if (currentUserRole === 'user') {
      return user.role === 'admin' && (fullName.includes(term) || username.includes(term));
    } else if (currentUserRole === 'admin') {
      return fullName.includes(term) || username.includes(term);
    }
    return false;
  });

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        
        <h2 className="sidebar-title">User List</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search name or username"
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
            <p className="no-user">No users found</p>
          )}
        </div>
      </div>

      <div className="chat-box" key={selectedUser?.user_id}>
        {selectedUser ? (
          <>
            <h2 className="chat-header">{selectedUser.firstname} {selectedUser.lastname}</h2>
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
                <p className="no-messages">No messages yet...</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-area">
              <input
                type="text"
                placeholder="Type a message..."
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-user-selected">🟡 Please select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
