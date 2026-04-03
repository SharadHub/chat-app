import './MessageList.css';

const MessageList = ({ messages, currentUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const shouldShowDate = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isOwn = message.sender._id === currentUser?.id || message.sender === currentUser?.id;
        const showDate = shouldShowDate(message, messages[index - 1]);

        return (
          <div key={message._id || index}>
            {showDate && (
              <div className="date-divider">
                <span>{formatDate(message.createdAt)}</span>
              </div>
            )}
            <div className={`message ${isOwn ? 'own' : 'other'}`}>
              {!isOwn && (
                <div className="message-avatar">
                  {getInitials(message.sender.username)}
                </div>
              )}
              <div className="message-content">
                {!isOwn && (
                  <span className="message-sender">{message.sender.username}</span>
                )}
                <div className="message-bubble">
                  {message.type === 'text' ? (
                    <p>{message.content}</p>
                  ) : message.type === 'image' ? (
                    <img src={message.fileUrl} alt="Shared image" className="message-image" />
                  ) : (
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                      {message.content}
                    </a>
                  )}
                </div>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
      
      {messages.length === 0 && (
        <div className="empty-messages">
          <p>No messages yet</p>
          <span>Start the conversation!</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;
