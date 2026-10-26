import React, { useState, useEffect } from 'react';
import { Sparkles, Image, Star, BookOpen, Send, X, Feather } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ArchivistModal from '../ai/ArchivistModal';

const CreatePostWidget = ({ onPostCreated }) => {
  const { user, isAuthor } = useAuth();

  const [postType, setPostType] = useState('review'); // 'review' | 'quote' | 'thought' | 'author_announcement'
  const [content, setContent] = useState('');
  const [bookId, setBookId] = useState('');
  const [rating, setRating] = useState(5);
  const [pageNumber, setPageNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // Books list for tagging
  const [availableBooks, setAvailableBooks] = useState([]);

  // AI Polish modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books?limit=50');
        if (res.data.success) {
          setAvailableBooks(res.data.books);
        }
      } catch (err) {
        console.warn('Could not load books for tagging:', err.message);
      }
    };
    fetchBooks();
  }, []);

  if (!user) {
    return (
      <div className="index-card p-5 text-center space-y-2 border-dashed">
        <p className="font-reading text-sm text-ink-muted italic">
          Sign the library ledger to inscribe reviews, quotes, and reflections.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const payload = {
        postType,
        content: content.trim(),
        bookId: bookId || undefined,
        rating: postType === 'review' ? Number(rating) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        imageUrl: imageUrl.trim() || undefined
      };

      const res = await api.post('/posts', payload);
      if (res.data.success) {
        setContent('');
        setBookId('');
        setPageNumber('');
        setImageUrl('');
        setShowImageInput(false);
        if (onPostCreated) onPostCreated(res.data.post);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to inscribe post into the archive.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBook = availableBooks.find((b) => b._id === bookId);

  return (
    <div className="index-card p-5 space-y-4 shadow-paper border-t-2 border-t-library-green">
      {/* Header and Post Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm font-bold text-ink">
            Inscribe a Reflection
          </span>
          <span className="font-mono text-[10px] text-ink-muted uppercase">
            Ledger Entry #{Math.floor(Math.random() * 8000 + 1000)}
          </span>
        </div>

        {/* Post Type Buttons */}
        <div className="flex items-center gap-1 bg-[#EAE3D4] p-0.5 border border-paper-border text-xs font-mono uppercase">
          <button
            type="button"
            onClick={() => setPostType('review')}
            className={`px-2.5 py-1 transition-colors ${
              postType === 'review' ? 'bg-library-green text-cream font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Review
          </button>
          <button
            type="button"
            onClick={() => setPostType('quote')}
            className={`px-2.5 py-1 transition-colors ${
              postType === 'quote' ? 'bg-library-green text-cream font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => setPostType('thought')}
            className={`px-2.5 py-1 transition-colors ${
              postType === 'thought' ? 'bg-library-green text-cream font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Thought
          </button>
          {isAuthor && (
            <button
              type="button"
              onClick={() => setPostType('author_announcement')}
              className={`px-2.5 py-1 transition-colors flex items-center gap-1 ${
                postType === 'author_announcement' ? 'bg-oxblood text-cream font-bold' : 'text-oxblood hover:bg-oxblood/10'
              }`}
            >
              <Feather className="w-3 h-3 text-brass" />
              <span>Dispatch</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Book Selection Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
              Select Book Volume
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
            >
              <option value="">— Untagged General Thought —</option>
              {availableBooks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} (by {b.authorName})
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Review Star Rating or Quote Page Number */}
          {postType === 'review' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Evaluation Rating
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-brass fill-brass'
                          : 'text-paper-border hover:text-brass/50'
                      }`}
                    />
                  </button>
                ))}
                <span className="font-mono text-xs text-ink-muted ml-2">
                  ({rating} / 5 stars)
                </span>
              </div>
            </div>
          )}

          {postType === 'quote' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Folio / Page Reference
              </label>
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="e.g. 142"
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
              />
            </div>
          )}
        </div>

        {/* Main Textarea */}
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'review'
                ? "Articulate your review of the volume's style, themes, and psychological weight..."
                : postType === 'quote'
                ? '"Transcribe the exact sentence that made you stop turning the page..."'
                : 'Share an observation, question, or marginalia with the salon...'
            }
            className="w-full p-3.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading leading-relaxed"
          />
        </div>

        {/* Optional Image URL Input */}
        {showImageInput && (
          <div className="flex items-center gap-2 p-2 bg-parchment border border-paper-border">
            <Image className="w-4 h-4 text-ink-muted flex-shrink-0" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL (e.g. Unsplash or bookplate link)..."
              className="flex-1 bg-transparent text-xs focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setShowImageInput(false);
              }}
              className="p-1 text-ink-muted hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-paper-border">
          <div className="flex items-center gap-2">
            {/* Polish with AI Button */}
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#EAE3D4] hover:bg-paper-hover text-ink text-xs font-mono uppercase tracking-wider border border-brass/50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brass" />
              <span>✨ Polish with Archivist AI</span>
            </button>

            {/* Toggle Image */}
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`p-1.5 border transition-colors ${
                showImageInput || imageUrl
                  ? 'bg-library-green text-cream border-brass'
                  : 'bg-parchment text-ink-muted border-paper-border hover:text-ink'
              }`}
              title="Attach book photo or illustration"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-1.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-brass" />
            <span>{loading ? 'Inscribing...' : 'Publish Entry'}</span>
          </button>
        </div>
      </form>

      {/* AI Polish Modal hook */}
      <ArchivistModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialTab="polish"
        initialDraft={content}
        onApplyPolished={(polishedText) => setContent(polishedText)}
      />
    </div>
  );
};

export default CreatePostWidget;
