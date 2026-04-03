import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  rooms, 
  currentRoom, 
  onRoomSelect, 
  onCreateRoom, 
  user, 
  onLogout,
  showMobile,
  onCloseMobile 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim(), newRoomDesc.trim());
      setNewRoomName('');
      setNewRoomDesc('');
      setShowCreateModal(false);
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <>
      <div className={`sidebar ${showMobile ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <h2>Chat Rooms</h2>
          <button 
            className="create-room-btn"
            onClick={() => setShowCreateModal(true)}
            title="Create new room"
          >
            +
          </button>
        </div>

        <div className="rooms-list">
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${currentRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onRoomSelect(room)}
            >
              <div className="room-avatar">
                {getInitials(room.name)}
              </div>
              <div className="room-info">
                <span className="room-name">{room.name}</span>
                <span className="room-desc">{room.description || 'No description'}</span>
              </div>
              {room.members?.length > 0 && (
                <span className="member-count">{room.members.length}</span>
              )}
            </div>
          ))}
          
          {rooms.length === 0 && (
            <div className="no-rooms">
              <p>No rooms yet</p>
              <span>Create your first room!</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.username)}
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="user-status">Online</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {showMobile && <div className="sidebar-overlay" onClick={onCloseMobile} />}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Room</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="Enter description"
                  maxLength={200}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
