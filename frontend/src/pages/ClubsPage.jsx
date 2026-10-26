import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Flame, Plus, Feather, BookOpen, Users, Radio, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthorBadge from '../components/common/AuthorBadge';
import api from '../services/api';

const ClubsPage = () => {
  const { user, isAuthor } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'amas' | 'clubs'

  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomBookId, setRoomBookId] = useState('');
  const [chapterScope, setChapterScope] = useState('');
  const [isAuthorAMA, setIsAuthorAMA] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter === 'amas') query.set('isAuthorAMA', 'true');
      if (filter === 'clubs') query.set('isAuthorAMA', 'false');

      const res = await api.get(`/clubs?${query.toString()}`);
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.warn('Failed to load salons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filter]);

  // Load books for parlor creation
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books?limit=50');
        if (res.data.success) {
          setAvailableBooks(res.data.books);
        }
      } catch (err) {
        console.warn('Could not load books for rooms:', err.message);
      }
    };
    fetchBooks();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !user) return;

    setCreating(true);
    try {
      const res = await api.post('/clubs', {
        name: roomName.trim(),
        description: roomDescription.trim(),
        bookId: roomBookId || undefined,
        chapterScope: chapterScope.trim() || 'Open Discussion • All Chapters Welcome',
        isAuthorAMA: isAuthor && isAuthorAMA
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setRoomName('');
        setRoomDescription('');
        setRoomBookId('');
        setChapterScope('');
        setIsAuthorAMA(false);
        fetchRooms();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open parlor.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-paper-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-oxblood mb-1">
            <Radio className="w-4 h-4 text-oxblood animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-ink">
              Real-Time Discourse
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Reading Clubs & Live Author AMAs
          </h1>
          <p className="font-reading text-xs text-ink-muted mt-1 italic">
            Participate in real-time literary salons, chapter spoiler-safe circles, and author sessions.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-brass" />
            <span>Open Reading Parlor</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-paper-border bg-paper p-1 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 transition-colors ${
            filter === 'all'
              ? 'bg-library-green text-cream font-bold'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          All Salons ({rooms.length})
        </button>
        <button
          onClick={() => setFilter('amas')}
          className={`px-4 py-1.5 transition-colors flex items-center gap-1.5 ${
            filter === 'amas'
              ? 'bg-oxblood text-cream font-bold'
              : 'text-oxblood hover:bg-oxblood/10'
          }`}
        >
          <Feather className="w-3 h-3 text-brass" />
          <span>Live Author AMAs</span>
        </button>
        <button
          onClick={() => setFilter('clubs')}
          className={`px-4 py-1.5 transition-colors ${
            filter === 'clubs'
              ? 'bg-library-green text-cream font-bold'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Book Clubs
        </button>
      </div>

      {/* Rooms List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="index-card p-6 animate-pulse space-y-3">
              <div className="h-5 bg-paper-border/60 w-1/2" />
              <div className="h-12 bg-paper-border/40 w-full" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="index-card p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-brass mx-auto" />
          <h3 className="font-serif text-lg font-bold text-ink">
            No Parlors Open Under This Folio
          </h3>
          <p className="font-reading text-xs text-ink-muted max-w-sm mx-auto">
            Open a discussion parlor to invite readers and fellow critics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="index-card p-5 flex flex-col justify-between hover:shadow-paper-elevated transition-shadow space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Name and AMA Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-paper-border pb-2">
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-reading text-ink-muted">
                        Hosted by {room.host?.penName || room.host?.name}
                      </span>
                      {room.host?.role === 'author' && <AuthorBadge />}
                    </div>
                  </div>

                  {room.isAuthorAMA ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-oxblood text-cream px-2 py-0.5 border border-oxblood flex items-center gap-1 flex-shrink-0 animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>LIVE AMA</span>
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider bg-library-green text-cream px-2 py-0.5 flex-shrink-0">
                      Book Club
                    </span>
                  )}
                </div>

                {/* Chapter Scope Spoiler Warning Header */}
                <div className="p-2 bg-parchment border border-paper-border flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-muted uppercase text-[10px]">Spoiler Bounds:</span>
                  <span className="font-bold text-ink truncate ml-2">
                    {room.chapterScope}
                  </span>
                </div>

                {/* Tagged Book Context (if any) */}
                {room.book && (
                  <div className="flex items-center gap-3 p-2 bg-[#EFE8DC] border border-paper-border">
                    <img
                      src={room.book.coverImage}
                      alt={room.book.title}
                      className="w-7 h-10 object-cover border border-paper-border flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-ink-muted block">
                        Parlor Focus Book
                      </span>
                      <p className="font-serif text-xs font-bold text-ink truncate">
                        {room.book.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="font-reading text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* Footer: Member count, last activity, and enter link */}
              <div className="pt-3 border-t border-paper-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <MessageSquare className="w-3.5 h-3.5 text-brass" />
                  <span>{room.messageCount || 0} messages inscribed</span>
                </div>

                <Link
                  to={`/clubs/${room._id}`}
                  className="px-3.5 py-1.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors flex items-center gap-1"
                >
                  <span>Enter Salon</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brass" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Open Reading Parlor / AMA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-brass/60 max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border pb-3">
              <h3 className="font-serif text-lg font-bold text-ink">
                Open a New Reading Salon
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-ink-muted hover:text-ink font-mono text-xs uppercase"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Salon Title
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. The Stoic Inner Citadel"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Chapter Scope / Spoiler Bounds
                </label>
                <input
                  type="text"
                  value={chapterScope}
                  onChange={(e) => setChapterScope(e.target.value)}
                  placeholder="e.g. Chapters 1-5 Spoiler Safe or Full Book Discussion"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Tag a Book Volume (Optional)
                </label>
                <select
                  value={roomBookId}
                  onChange={(e) => setRoomBookId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                >
                  <option value="">— General Literary Discourse —</option>
                  {availableBooks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} (by {b.authorName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Salon Purpose & Etiquette
                </label>
                <textarea
                  rows={2}
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="State the themes and inquiries to be investigated in this room..."
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                />
              </div>

              {/* Author Specific: Launch Official Live AMA */}
              {isAuthor && (
                <div className="p-3 bg-oxblood/10 border border-oxblood/40 flex items-center justify-between">
                  <div>
                    <div className="font-serif text-xs font-bold text-oxblood flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5 text-brass" />
                      <span>Launch as Official Live Author AMA</span>
                    </div>
                    <p className="text-[10px] font-reading text-ink-muted">
                      Automatically broadcasts dispatches to all your followers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAuthorAMA}
                    onChange={(e) => setIsAuthorAMA(e.target.checked)}
                    className="w-4 h-4 accent-oxblood cursor-pointer"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={creating || !roomName.trim()}
                className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50"
              >
                {creating ? 'Inscribing Parlor...' : 'Open Salon to Archive'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
