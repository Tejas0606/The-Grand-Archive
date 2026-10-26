import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, MessageSquare, Flame, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RightWidgetSidebar = ({ onOpenAIArchivist }) => {
  const { user, updateShelf } = useAuth();
  const [liveRooms, setLiveRooms] = useState([]);
  const [updatingPage, setUpdatingPage] = useState(false);

  // Find currently reading book
  const currentlyReadingItem = user?.readingShelf?.find(
    (item) => item.status === 'currently_reading' && item.book
  );

  const [localProgress, setLocalProgress] = useState(
    currentlyReadingItem ? currentlyReadingItem.progressPage : 0
  );

  useEffect(() => {
    if (currentlyReadingItem) {
      setLocalProgress(currentlyReadingItem.progressPage);
    }
  }, [currentlyReadingItem]);

  // Load active rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data.success) {
          setLiveRooms(res.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load sidebar salons:', err.message);
      }
    };
    fetchRooms();
  }, []);

  const handleSaveProgress = async () => {
    if (!currentlyReadingItem) return;
    setUpdatingPage(true);
    try {
      await updateShelf(
        currentlyReadingItem.book._id,
        'currently_reading',
        Number(localProgress)
      );
    } catch (err) {
      console.warn('Failed updating progress:', err.message);
    } finally {
      setUpdatingPage(false);
    }
  };

  const book = currentlyReadingItem?.book;
  const progressPercent = book && book.totalPages > 0
    ? Math.min(100, Math.round((localProgress / book.totalPages) * 100))
    : 0;

  return (
    <aside className="w-80 bg-parchment-100 border-l border-paper-border p-5 space-y-6 hidden xl:block overflow-y-auto">
      {/* 1. Currently Reading Progress Widget */}
      <div className="index-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-paper-border pb-2">
          <div className="flex items-center gap-1.5 text-library-green">
            <BookOpen className="w-4 h-4 text-brass" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold">
              Desk Volume
            </span>
          </div>
          <span className="font-mono text-[10px] text-ink-muted">
            {progressPercent}%
          </span>
        </div>

        {book ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-14 h-20 object-cover border border-paper-border shadow-book-spine flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/books/${book._id}`}
                  className="font-serif text-sm font-bold text-ink hover:text-library-green line-clamp-2 leading-tight"
                >
                  {book.title}
                </Link>
                <p className="text-xs font-reading text-ink-muted mt-1 truncate">
                  {book.authorName}
                </p>
                <div className="mt-2 text-[11px] font-mono text-ink-muted">
                  Page {localProgress} of {book.totalPages}
                </div>
              </div>
            </div>

            {/* Tactile Progress Bar */}
            <div className="w-full bg-paper border border-paper-border h-2 overflow-hidden">
              <div
                className="bg-library-green h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick page update input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                max={book.totalPages}
                value={localProgress}
                onChange={(e) => setLocalProgress(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-paper border border-paper-border text-center font-mono focus:border-library-green focus:outline-none"
              />
              <button
                onClick={handleSaveProgress}
                disabled={updatingPage}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-xs bg-library-green hover:bg-library-green-hover text-cream font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-brass" />
                <span>{updatingPage ? 'Saving...' : 'Log Page'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs font-reading italic text-ink-muted">
              No volume currently open on your reading desk.
            </p>
            <Link
              to="/books"
              className="inline-block text-xs font-mono tracking-wider text-library-green hover:underline uppercase"
            >
              Select from Catalog →
            </Link>
          </div>
        )}
      </div>

      {/* 2. Live Reading Parlors & AMAs */}
      <div className="index-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-paper-border pb-2">
          <div className="flex items-center gap-1.5 text-oxblood">
            <Flame className="w-4 h-4 text-oxblood animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-ink">
              Live Parlors & AMAs
            </span>
          </div>
          <Link
            to="/clubs"
            className="text-[10px] font-mono text-library-green hover:underline uppercase"
          >
            All Rooms
          </Link>
        </div>

        <div className="space-y-2.5">
          {liveRooms.map((room) => (
            <Link
              key={room._id}
              to={`/clubs/${room._id}`}
              className="block p-2.5 bg-paper hover:bg-parchment border border-paper-border transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-xs font-semibold text-ink group-hover:text-library-green truncate">
                  {room.name}
                </span>
                {room.isAuthorAMA && (
                  <span className="font-mono text-[9px] bg-oxblood text-cream px-1 py-0.2 uppercase font-bold flex-shrink-0 ml-1">
                    LIVE AMA
                  </span>
                )}
              </div>
              <p className="text-[11px] font-reading text-ink-muted line-clamp-1 mt-0.5">
                {room.chapterScope}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted/80 mt-1.5 pt-1 border-t border-paper-border/60">
                <span>Hosted by {room.host?.name?.split(' ')[0]}</span>
                <span className="flex items-center gap-1 text-library-green">
                  <span>Enter</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. The AI Archivist Card */}
      <div className="p-4 bg-paper border border-brass/40 shadow-paper space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-brass">
          <Sparkles className="w-4 h-4 text-brass" />
          <h4 className="font-serif text-sm font-bold text-ink">
            The AI Archivist
          </h4>
        </div>
        <p className="text-xs font-reading text-ink-muted leading-relaxed">
          Stuck on a chapter? Let our Gemini-powered librarian craft a spoiler-free recap or recommend your next literary obsession.
        </p>
        <button
          onClick={onOpenAIArchivist}
          className="w-full py-2 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass/40 shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-brass" />
          <span>Consult Archivist AI</span>
        </button>
      </div>
    </aside>
  );
};

export default RightWidgetSidebar;
