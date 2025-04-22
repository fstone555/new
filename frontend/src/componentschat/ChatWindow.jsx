import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatWindow = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    if (selectedUser) {
      axios.get(`/api/messages/${currentUser.user_id}/${selectedUser.user_id}`)
        .then(response => {
          setMessages(response.data);
        })
        .catch(error => console.error('Error fetching messages:', error));
    }
  }, [selectedUser, currentUser]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      axios.post('/api/messages', {
        from_user_id: currentUser.user_id,
        to_user_id: selectedUser.user_id,
        message: newMessage,
      })
        .then(response => {
          setMessages([...messages, response.data]);
          setNewMessage('');
        })
        .catch(error => console.error('Error sending message:', error));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.from_user_id === currentUser.user_id ? 'sent' : 'received'}`}>
            {message.message}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
