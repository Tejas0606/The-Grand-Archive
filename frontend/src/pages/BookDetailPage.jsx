import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Star, 
  Feather, 
  Bookmark, 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  Calendar, 
  Check, 
  Sparkles,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthorBadge from '../components/common/AuthorBadge';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

const BookDetailPage = () => {
  const { id } = useParams();
  const { user, updateShelf } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shelf tracking state
  const [shelfStatus, setShelfStatus] = useState('');
  const [progressPage, setProgressPage] = useState(0);
  const [updatingShelf, setUpdatingShelf] = useState(false);

  // AI Catch-Up embedded tool
  const [catchUpPoint, setCatchUpPoint] = useState('');
  const [catchUpLoading, setCatchUpLoading] = useState(false);
  const [catchUpRecap, setCatchUpRecap] = useState('');

  // Inscribe review form state
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newQuotePage, setNewQuotePage] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books/${id}`);
      if (res.data.success) {
        setBook(res.data.book);
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.warn('Failed to load book record:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  // Sync user's shelf state for this book
  useEffect(() => {
    if (user?.readingShelf && book) {
      const item = user.readingShelf.find(
        (i) => i.book && (i.book._id || i.book).toString() === book._id.toString()
      );
      if (item) {
        setShelfStatus(item.status);
        setProgressPage(item.progressPage || 0);
      } else {
        setShelfStatus('');
        setProgressPage(0);
      }
    }
  }, [user, book]);

  const handleShelfChange = async (newStatus) => {
    if (!user) {
      alert('Please sign the library ledger to manage your reading desk.');
      return;
    }

    setUpdatingShelf(true);
    try {
      const pageNum = newStatus === 'completed' ? book.totalPages : progressPage;
      await updateShelf(book._id, newStatus, pageNum);
      setShelfStatus(newStatus);
      if (newStatus === 'completed') setProgressPage(book.totalPages);
    } catch (err) {
      alert('Failed updating reading shelf.');
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handleSavePageProgress = async () => {
    if (!user || !shelfStatus) return;
    setUpdatingShelf(true);
    try {
      const pageNum = Number(progressPage);
      const status = pageNum >= book.totalPages ? 'completed' : 'currently_reading';
      await updateShelf(book._id, status, pageNum);
      setShelfStatus(status);
    } catch (err) {
      alert('Could not update page milestone.');
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handleRunCatchUp = async (e) => {
    e.preventDefault();
    if (!catchUpPoint.trim()) return;

    setCatchUpLoading(true);
    try {
      const res = await api.post('/ai/catch-up', {
        bookTitle: book.title,
        currentPoint: catchUpPoint.trim(),
        synopsis: book.synopsis
      });
      if (res.data.success) {
        setCatchUpRecap(res.data.recap);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Archivist was unable to assemble the recap.');
    } finally {
      setCatchUpLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim() || !user) return;

    setReviewLoading(true);
    try {
      const res = await api.post('/posts', {
        bookId: book._id,
        postType: 'review',
        content: newReviewText.trim(),
        rating: Number(newRating),
        pageNumber: newQuotePage ? Number(newQuotePage) : undefined
      });

      if (res.data.success) {
        setReviews([res.data.post, ...reviews]);
        setNewReviewText('');
        setNewQuotePage('');
        fetchBookDetails(); // refresh average ratings
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to inscribe review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="index-card p-12 animate-pulse space-y-4">
        <div className="h-6 bg-paper-border/60 w-1/3" />
        <div className="h-4 bg-paper-border/40 w-1/4" />
        <div className="h-40 bg-paper-border/30 w-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="index-card p-12 text-center space-y-3">
        <h2 className="font-serif text-xl font-bold text-ink">Volume Missing from Stacks</h2>
        <Link to="/books" className="text-xs font-mono uppercase text-library-green underline">
          Return to Grand Catalog →
        </Link>
      </div>
    );
  }

  const progressPercent = book.totalPages > 0
    ? Math.min(100, Math.round((progressPage / book.totalPages) * 100))
    : 0;

  return (
    <div className="space-y-8">
      {/* Book Presentation Banner */}
      <div className="index-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover & Spine */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[240px] aspect-[2/3] overflow-hidden border border-paper-border shadow-shelf-shadow">
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Publication metadata stamp */}
            <div className="mt-4 text-center font-mono text-[11px] text-ink-muted space-y-1">
              <div>ISBN: {book.isbn || 'ARCH-982-1884'}</div>
              <div>Published: {book.publishedYear} • {book.totalPages} Pages</div>
            </div>
          </div>

          {/* Details & Synopsis */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#EAE3D4] border border-paper-border text-ink-muted">
                  {book.genre}
                </span>
                <div className="flex items-center gap-1 text-brass text-xs font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                  <span>{book.averageRating > 0 ? book.averageRating.toFixed(1) : 'Unrated'}</span>
                  <span className="text-ink-muted font-normal">({book.ratingsCount} reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink leading-tight">
                {book.title}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="font-reading text-sm text-ink-muted">Inscribed by</span>
                <span className="font-serif text-sm font-bold text-ink">
                  {book.authorName}
                </span>
                <AuthorBadge />
              </div>
            </div>

            {/* Shelf Placement Widget */}
            <div className="p-4 bg-parchment border border-paper-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-ink font-bold flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-brass" />
                  <span>My Reading Desk</span>
                </span>
                {shelfStatus && (
                  <span className="text-[10px] font-mono uppercase bg-library-green text-cream px-1.5 py-0.5">
                    {shelfStatus.replace('_', ' ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono uppercase">
                <button
                  type="button"
                  onClick={() => handleShelfChange('want_to_read')}
                  disabled={updatingShelf}
                  className={`py-2 px-1 text-center border transition-colors ${
                    shelfStatus === 'want_to_read'
                      ? 'bg-library-green text-cream border-brass font-bold'
                      : 'bg-paper text-ink border-paper-border hover:bg-paper-hover'
                  }`}
                >
                  Want to Read
                </button>
                <button
                  type="button"
                  onClick={() => handleShelfChange('currently_reading')}
                  disabled={updatingShelf}
                  className={`py-2 px-1 text-center border transition-colors ${
                    shelfStatus === 'currently_reading'
                      ? 'bg-library-green text-cream border-brass font-bold'
                      : 'bg-paper text-ink border-paper-border hover:bg-paper-hover'
                  }`}
                >
                  Reading Now
                </button>
                <button
                  type="button"
                  onClick={() => handleShelfChange('completed')}
                  disabled={updatingShelf}
                  className={`py-2 px-1 text-center border transition-colors ${
                    shelfStatus === 'completed'
                      ? 'bg-library-green text-cream border-brass font-bold'
                      : 'bg-paper text-ink border-paper-border hover:bg-paper-hover'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Progress Slider (when currently reading) */}
              {shelfStatus === 'currently_reading' && (
                <div className="pt-2 border-t border-paper-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                    <span>Reading Progress: Page {progressPage} of {book.totalPages}</span>
                    <span className="font-bold text-ink">{progressPercent}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={book.totalPages}
                    value={progressPage}
                    onChange={(e) => setProgressPage(Number(e.target.value))}
                    className="w-full accent-library-green cursor-pointer"
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSavePageProgress}
                      disabled={updatingShelf}
                      className="px-3 py-1 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-brass" />
                      <span>{updatingShelf ? 'Saving...' : 'Save Milestone'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-2 font-bold">
                Archival Synopsis
              </h3>
              <p className="font-reading text-sm sm:text-base text-ink leading-relaxed whitespace-pre-line">
                {book.synopsis}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE: AI Spoiler-Free Catch-Up Assistant */}
      <div className="index-card p-6 border-t-2 border-t-brass space-y-4 shadow-paper">
        <div className="flex items-center justify-between border-b border-paper-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-library-green border border-brass/50 text-cream flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-brass" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-ink">
                Spoiler-Free Catch-Up Assistant
              </h3>
              <p className="text-[10px] font-mono tracking-widest uppercase text-ink-muted">
                Powered by Gemini AI • Guaranteed safe narrative recap
              </p>
            </div>
          </div>
        </div>

        <p className="font-reading text-xs text-ink-muted leading-relaxed">
          Returning to *{book.title}* after time away? Specify your exact milestone (e.g. Chapter or Page number) to receive a strictly spoiler-free synthesis of plot events, character dynamics, and thematic currents up to that point.
        </p>

        <form onSubmit={handleRunCatchUp} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={catchUpPoint}
            onChange={(e) => setCatchUpPoint(e.target.value)}
            placeholder='e.g. "Chapter 4" or "Page 115"'
            className="flex-1 px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={catchUpLoading || !catchUpPoint.trim()}
            className="px-5 py-2 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-brass" />
            <span>{catchUpLoading ? 'Synthesizing...' : 'Generate Catch-Up'}</span>
          </button>
        </form>

        {catchUpRecap && (
          <div className="mt-4 p-5 bg-parchment border border-brass/60 shadow-paper space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-library-green font-bold border-b border-paper-border pb-1">
              Archival Briefing: Up to {catchUpPoint}
            </div>
            <div className="font-reading text-xs text-ink leading-relaxed whitespace-pre-line space-y-2">
              {catchUpRecap}
            </div>
          </div>
        )}
      </div>

      {/* Reader Reviews & Inscribe Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-paper-border pb-3">
          <h3 className="font-serif text-xl font-bold text-ink">
            Critical Reviews & Annotations ({reviews.length})
          </h3>
          <span className="font-mono text-xs text-ink-muted uppercase">
            Community Marginalia
          </span>
        </div>

        {/* Inscribe Review on this Book */}
        {user ? (
          <form onSubmit={handleCreateReview} className="index-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-ink">
                Inscribe a Review for "{book.title}"
              </span>
              {/* Star Rating Picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= newRating ? 'text-brass fill-brass' : 'text-paper-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="State your critical evaluation, thematic observations, and prose analysis..."
              className="w-full p-3 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-ink-muted uppercase">
                  Page Reference (Optional):
                </span>
                <input
                  type="number"
                  value={newQuotePage}
                  onChange={(e) => setNewQuotePage(e.target.value)}
                  placeholder="p. 88"
                  className="w-20 px-2 py-1 text-xs bg-parchment border border-paper-border font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading || !newReviewText.trim()}
                className="px-4 py-1.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-brass" />
                <span>{reviewLoading ? 'Inscribing...' : 'Publish Review'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="index-card p-4 text-center">
            <Link to="/login" className="text-xs font-mono uppercase text-library-green underline">
              Sign the ledger to inscribe your review →
            </Link>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="index-card p-8 text-center text-xs font-reading text-ink-muted italic">
            No reader reviews inscribed for this volume yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <PostCard key={rev._id} post={rev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
