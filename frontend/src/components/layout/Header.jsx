import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  CheckCheck, 
  BookOpen, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Radio 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const Header = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/books?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.data.success) {
          setSearchResults(res.data.books);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('Search query failed:', err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);
    navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-oxblood fill-oxblood" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-library-green" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-brass" />;
      case 'author_ama':
        return <Radio className="w-3.5 h-3.5 text-oxblood animate-pulse" />;
      case 'new_book':
        return <BookOpen className="w-3.5 h-3.5 text-library-green" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-brass" />;
    }
  };

  return (
    <header className="h-16 bg-parchment border-b border-paper-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Mobile Menu Trigger & Library Stamp */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-ink hover:text-library-green border border-paper-border bg-paper"
          aria-label="Open library navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-paper-border bg-paper text-ink-muted">
            Archive Room: Alexandria II
          </span>
        </div>
      </div>

      {/* Middle Debounced Catalog Search */}
      <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
            placeholder="Search volumes, authors, or subjects..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-paper border border-paper-border focus:border-library-green focus:outline-none placeholder:text-ink-muted/70 font-sans shadow-inner transition-colors"
          />
        </form>

        {/* Live Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-paper-border shadow-paper-elevated z-50 overflow-hidden divide-y divide-paper-border">
            <div className="px-3 py-1.5 bg-paper-hover text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              Matching Archive Volumes ({searchResults.length})
            </div>
            {searchResults.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                onClick={() => {
                  setShowSearchDropdown(false);
                  setSearchQuery('');
                }}
                className="flex items-center gap-3 p-2.5 hover:bg-parchment transition-colors"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-8 h-11 object-cover border border-paper-border shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xs font-semibold text-ink truncate">
                    {book.title}
                  </p>
                  <p className="text-[11px] font-reading text-ink-muted truncate">
                    {book.authorName} • <span className="font-mono text-[10px]">{book.genre}</span>
                  </p>
                </div>
              </Link>
            ))}
            <button
              onClick={handleSearchSubmit}
              className="w-full text-center py-2 text-[11px] font-mono tracking-wider text-library-green hover:underline uppercase bg-paper-hover"
            >
              View all results in Catalog →
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Auth State */}
      <div className="flex items-center gap-3">
        {/* Real-time Notification Bell */}
        {user && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (unreadCount > 0) markAllRead();
              }}
              className="relative p-2 bg-paper border border-paper-border hover:border-brass text-ink transition-colors"
              aria-label="Archive notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-oxblood text-cream font-mono text-[9px] font-bold flex items-center justify-center border border-cream shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-paper border border-paper-border shadow-shelf-shadow z-50 divide-y divide-paper-border">
                <div className="p-3 bg-paper-hover flex items-center justify-between">
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-ink">
                    Archival Dispatches
                  </span>
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-mono text-library-green hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark Read</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-paper-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs font-reading text-ink-muted italic">
                      No recent dispatches in your ledger.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-xs transition-colors hover:bg-parchment ${
                          !n.read ? 'bg-[#EFE8DA]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1 bg-paper border border-paper-border mt-0.5">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-reading text-ink leading-snug">
                              <span className="font-serif font-bold">
                                {n.sender?.name || 'A patron'}
                              </span>{' '}
                              {n.type === 'like' && 'admired your archival entry.'}
                              {n.type === 'comment' && 'annotated your review.'}
                              {n.type === 'follow' && 'began following your reading journey.'}
                              {n.type === 'new_book' && 'inscribed a new volume to the shelves.'}
                              {n.type === 'author_ama' && 'opened an Official Live Author AMA parlor!'}
                            </p>
                            <span className="text-[10px] font-mono text-ink-muted mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Mini Avatar or Ledger Link */}
        {user ? (
          <Link
            to={`/profile/${user.username}`}
            className="flex items-center gap-2 pl-2 border-l border-paper-border group"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 object-cover border border-paper-border group-hover:border-brass transition-colors"
            />
            <span className="hidden md:inline font-serif text-xs font-semibold text-ink group-hover:text-library-green transition-colors">
              {user.name.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass/50 shadow-sm transition-colors"
          >
            Sign Ledger
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
