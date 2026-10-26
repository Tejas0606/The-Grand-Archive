import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Radio, 
  Send, 
  Users, 
  BookOpen, 
  ShieldAlert, 
  Feather, 
  ArrowLeft,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AuthorBadge from '../components/common/AuthorBadge';
import api from '../services/api';

const ClubRoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch Room Info & History
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const [roomRes, msgRes] = await Promise.all([
          api.get(`/clubs/${roomId}`),
          api.get(`/clubs/${roomId}/messages?limit=100`)
        ]);

        if (roomRes.data.success) {
          setRoom(roomRes.data.room);
        }
        if (msgRes.data.success) {
          setMessages(msgRes.data.messages);
        }
      } catch (err) {
        console.warn('Could not load parlor details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Socket Connection & Real-time Listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join_room', { roomId, user });

    // Handle room member count
    const handleRoomStats = ({ memberCount }) => {
      setOnlineCount(memberCount);
    };

    // Handle incoming message
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    // Handle typing indicators
    const handleUserTyping = ({ name }) => {
      setTypingUsers(name);
    };

    const handleUserStopTyping = () => {
      setTypingUsers(null);
    };

    socket.on('room_stats', handleRoomStats);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_room', { roomId, user });
      socket.off('room_stats', handleRoomStats);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, roomId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !user) return;

    socket.emit('typing', {
      roomId,
      username: user.username,
      name: user.penName || user.name
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId });
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !socket) return;

    socket.emit('send_message', {
      roomId,
      senderId: user._id,
      text: newMessage.trim()
    });

    socket.emit('stop_typing', { roomId });
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="index-card p-12 text-center font-reading italic text-ink-muted">
        Opening salon doors...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="index-card p-12 text-center space-y-3">
        <h3 className="font-serif text-lg font-bold text-ink">Salon Parlor Not Found</h3>
        <Link to="/clubs" className="text-xs font-mono uppercase text-library-green underline">
          Return to Clubs Directory →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] index-card overflow-hidden shadow-paper-elevated border-2 border-brass/50">
      {/* Parlor Header */}
      <div className="p-4 bg-mahogany text-cream border-b border-[#2C231F] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/clubs"
            className="p-1.5 border border-[#3A2D26] text-cream-muted hover:text-cream hover:bg-[#28201B]"
            title="Leave Salon"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-cream">
                {room.name}
              </h2>
              {room.isAuthorAMA && (
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-oxblood text-cream px-1.5 py-0.5 border border-oxblood flex items-center gap-1 animate-pulse">
                  <Radio className="w-3 h-3" />
                  <span>LIVE AMA</span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-reading text-cream-muted">
              Hosted by {room.host?.penName || room.host?.name} •{' '}
              {room.book ? `Discussing "${room.book.title}"` : 'General Literary Salon'}
            </p>
          </div>
        </div>

        {/* Online Presence Counter */}
        <div className="flex items-center gap-2 bg-[#261E1A] px-3 py-1.5 border border-brass/30">
          <Users className="w-3.5 h-3.5 text-brass" />
          <span className="font-mono text-xs text-cream">
            {onlineCount} {onlineCount === 1 ? 'Scholar' : 'Scholars'} in Parlor
          </span>
        </div>
      </div>

      {/* Chapter Scope Spoiler Safe Warning Bar */}
      <div className="px-4 py-2 bg-[#EFE8DA] border-b border-paper-border flex items-center justify-between text-xs font-mono flex-shrink-0">
        <div className="flex items-center gap-2 text-oxblood">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span className="uppercase font-bold tracking-wider text-[11px]">
            Salon Spoiler Directive:
          </span>
          <span className="text-ink font-semibold">{room.chapterScope}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-parchment">
        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="font-serif text-sm font-semibold text-ink">
              The parlor is tranquil and waiting for opening discourse.
            </p>
            <p className="font-reading text-xs text-ink-muted italic">
              Speak freely; your words will be inscribed onto the room rolls.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = user && (msg.sender?._id || msg.sender).toString() === user._id.toString();
            const isHost = (msg.sender?._id || msg.sender).toString() === room.host?._id.toString();
            const isAuthorUser = msg.sender?.role === 'author';

            return (
              <div
                key={msg._id || idx}
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <img
                  src={msg.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={msg.sender?.name}
                  className="w-8 h-8 object-cover border border-paper-border flex-shrink-0 mt-1 shadow-sm"
                />

                <div className={`space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                  <div className={`flex items-center gap-1.5 text-xs ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-serif font-bold text-ink">
                      {msg.sender?.penName || msg.sender?.name}
                    </span>
                    {isHost && (
                      <span className="text-[9px] font-mono uppercase bg-brass text-cream px-1 py-0.2 font-bold">
                        HOST
                      </span>
                    )}
                    {isAuthorUser && <AuthorBadge />}
                    <span className="text-[10px] font-mono text-ink-muted">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3 text-xs font-reading leading-relaxed shadow-sm border ${
                      isMe
                        ? 'bg-library-green text-cream border-library-green'
                        : isHost
                        ? 'bg-oxblood/10 border-oxblood/40 text-ink'
                        : 'bg-paper border-paper-border text-ink'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Live Typing Indicator */}
        {typingUsers && (
          <div className="flex items-center gap-2 text-xs font-mono text-ink-muted italic pl-11">
            <Feather className="w-3.5 h-3.5 text-brass animate-bounce" />
            <span>{typingUsers} is dipping pen in ink...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-3 bg-paper border-t border-paper-border flex-shrink-0">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Contribute your observation to the parlor..."
              className="flex-1 px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-brass" />
              <span className="hidden sm:inline">Discourse</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-2 text-xs font-mono text-ink-muted">
            <Link to="/login" className="text-library-green underline">
              Sign the library ledger
            </Link>{' '}
            to join parlor discourse.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubRoomPage;
