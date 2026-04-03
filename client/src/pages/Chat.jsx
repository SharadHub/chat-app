import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import './Chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket, joinRoom, leaveRoom, connected } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/rooms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setRooms(data);
        if (data.length > 0 && !currentRoom) {
          setCurrentRoom(data[0]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Join room when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      joinRoom(currentRoom._id);
      setMessages([]);
      setTypingUsers([]);
    }

    return () => {
      if (currentRoom) {
        leaveRoom(currentRoom._id);
      }
    };
  }, [currentRoom]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomMessages = (roomMessages) => {
      setMessages(roomMessages);
    };

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        } else {
          return prev.filter((u) => u !== username);
        }
      });
    };

    const handleUserJoined = ({ username }) => {
      // Could show a notification
      console.log(`${username} joined the room`);
    };

    const handleUserLeft = ({ username }) => {
      // Could show a notification
      console.log(`${username} left the room`);
    };

    socket.on('room_messages', handleRoomMessages);
    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('room_messages', handleRoomMessages);
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setShowMobileSidebar(false);
  };

  const handleCreateRoom = async (roomName, description) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: roomName, description })
      });
      const newRoom = await response.json();
      setRooms((prev) => [newRoom, ...prev]);
      setCurrentRoom(newRoom);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={handleCreateRoom}
        user={user}
        onLogout={logout}
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />
      
      <div className="chat-main">
        {currentRoom ? (
          <>
            <div className="chat-header">
              <button
                className="menu-button"
                onClick={() => setShowMobileSidebar(true)}
              >
                ☰
              </button>
              <div className="room-info">
                <h3>{currentRoom.name}</h3>
                <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="header-actions">
                <span className="members-count">
                  {currentRoom.members?.length || 0} members
                </span>
              </div>
            </div>
            
            <div className="messages-container">
              <MessageList messages={messages} currentUser={user} />
              <TypingIndicator typingUsers={typingUsers} />
              <div ref={messagesEndRef} />
            </div>
            
            <MessageInput roomId={currentRoom._id} />
          </>
        ) : (
          <div className="no-room-selected">
            <h3>Select a room to start chatting</h3>
            <p>Or create a new room to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
