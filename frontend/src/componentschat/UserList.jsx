// src/componentschat/UserList.jsx
import React from 'react';

const UserList = ({ users, currentUser, onUserSelect }) => {
  return (
    <div>
      <h2 className="text-xl mb-4">รายชื่อผู้ใช้</h2>
      <ul>
        {users.map(user => (
          <li
            key={user.user_id}
            onClick={() => onUserSelect(user)}
            className={`p-2 cursor-pointer ${user.user_id === currentUser.user_id ? 'bg-blue-100' : ''}`}
          >
            {user.username} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
