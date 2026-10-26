import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Feather, 
  BookOpen, 
  Radio, 
  Users, 
  Star, 
  TrendingUp, 
  Plus, 
  Send, 
  Image, 
  Check, 
  MessageSquare 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthorBadge from '../components/common/AuthorBadge';
import api from '../services/api';

const AuthorStudioPage = () => {
  const { user, isAuthor, loading: authLoading } = useAuth();

  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form: Publish Book
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('Philosophy');
  const [totalPages, setTotalPages] = useState('320');
  const [isbn, setIsbn] = useState('');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear().toString());
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');

  // Form: Launch Live AMA
  const [amaTitle, setAmaTitle] = useState('');
  const [amaChapterScope, setAmaChapterScope] = useState('Open Q&A • All Readers Welcome');
  const [amaDescription, setAmaDescription] = useState('');
  const [amaBookId, setAmaBookId] = useState('');
  const [launchingAMA, setLaunchingAMA] = useState(false);
  const [amaSuccess, setAmaSuccess] = useState('');

  const fetchAuthorData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/books?author=${user._id}&limit=50`);
      if (res.data.success) {
        setAuthorBooks(res.data.books);
      }
    } catch (err) {
      console.warn('Failed to load author books:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthor) {
      fetchAuthorData();
    }
  }, [user, isAuthor]);

  if (authLoading) return null;

  if (!user || !isAuthor) {
    return (
      <div className="index-card p-12 text-center space-y-4">
        <Feather className="w-10 h-10 text-oxblood mx-auto" />
        <h2 className="font-serif text-xl font-bold text-ink">
          Corridor Restricted: Official Authors Only
        </h2>
        <p className="font-reading text-xs text-ink-muted max-w-md mx-auto">
          The Author Studio is reserved for registered authors. Sign the ledger with an Author pass or use the "1-Click Demo Login as Author" button.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-oxblood text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm hover:bg-oxblood-hover transition-colors"
        >
          Switch to Author Account →
        </Link>
      </div>
    );
  }

  // Calculate analytics
  const totalReviews = authorBooks.reduce((acc, b) => acc + (b.ratingsCount || 0), 0);
  const avgRatingSum = authorBooks.reduce((acc, b) => acc + (b.averageRating || 0), 0);
  const overallAvgRating = authorBooks.length > 0 ? (avgRatingSum / authorBooks.length).toFixed(1) : '0.0';
  const totalFollowers = user.followers?.length || 0;

  const handlePublishBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim()) return;

    setPublishing(true);
    setPublishSuccess('');
    try {
      const res = await api.post('/books', {
        title: title.trim(),
        synopsis: synopsis.trim(),
        genre,
        totalPages: Number(totalPages) || 300,
        isbn: isbn.trim(),
        publishedYear: Number(publishedYear) || new Date().getFullYear(),
        coverImageUrl: coverImageUrl.trim() || undefined
      });

      if (res.data.success) {
        setPublishSuccess(`"${res.data.book.title}" inscribed into the Grand Archive!`);
        setTitle('');
        setSynopsis('');
        setCoverImageUrl('');
        setIsbn('');
        fetchAuthorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Publication failed.');
    } finally {
      setPublishing(false);
    }
  };

  const handleLaunchAMA = async (e) => {
    e.preventDefault();
    if (!amaTitle.trim()) return;

    setLaunchingAMA(true);
    setAmaSuccess('');
    try {
      const res = await api.post('/clubs', {
        name: amaTitle.trim(),
        chapterScope: amaChapterScope.trim(),
        description: amaDescription.trim(),
        bookId: amaBookId || undefined,
        isAuthorAMA: true
      });

      if (res.data.success) {
        setAmaSuccess(`Live Author AMA opened! Dispatches sent to ${totalFollowers} followers.`);
        setAmaTitle('');
        setAmaDescription('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to launch Live AMA.');
    } finally {
      setLaunchingAMA(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Studio Banner */}
      <div className="border-b border-paper-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-oxblood mb-1">
            <Feather className="w-4 h-4 text-brass" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-ink">
              Official Author Studio
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>{user.penName || user.name}</span>
            <AuthorBadge />
          </h1>
          <p className="font-reading text-xs text-ink-muted mt-1 italic">
            Publish original volumes, observe reader reception, and launch real-time salons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase px-2.5 py-1 bg-paper border border-paper-border text-ink-muted">
            Specialty: {user.genreSpecialty || 'General Literature'}
          </span>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="index-card p-4 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="font-mono text-[10px] uppercase">Published Volumes</span>
            <BookOpen className="w-4 h-4 text-brass" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            {authorBooks.length}
          </div>
          <div className="text-[10px] font-reading text-ink-muted">Inscribed in library</div>
        </div>

        <div className="index-card p-4 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="font-mono text-[10px] uppercase">Patron Followers</span>
            <Users className="w-4 h-4 text-library-green" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            {totalFollowers}
          </div>
          <div className="text-[10px] font-reading text-ink-muted">Tracking your dispatches</div>
        </div>

        <div className="index-card p-4 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="font-mono text-[10px] uppercase">Critical Reviews</span>
            <MessageSquare className="w-4 h-4 text-oxblood" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            {totalReviews}
          </div>
          <div className="text-[10px] font-reading text-ink-muted">Community annotations</div>
        </div>

        <div className="index-card p-4 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="font-mono text-[10px] uppercase">Mean Evaluation</span>
            <Star className="w-4 h-4 text-brass fill-brass" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            {overallAvgRating}
          </div>
          <div className="text-[10px] font-reading text-ink-muted">Across all volumes</div>
        </div>
      </div>

      {/* Two Studio Working Desks (Publish Book & Launch Live AMA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desk 1: Inscribe New Book */}
        <div className="index-card p-6 border-t-2 border-t-library-green space-y-4 shadow-paper">
          <div className="flex items-center justify-between border-b border-paper-border pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brass" />
              <h3 className="font-serif text-base font-bold text-ink">
                Inscribe New Book into Catalog
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-ink-muted">Catalog Entry</span>
          </div>

          {publishSuccess && (
            <div className="p-3 bg-library-green/10 border border-library-green text-library-green text-xs font-mono">
              {publishSuccess}
            </div>
          )}

          <form onSubmit={handlePublishBook} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Book Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Second Citadel"
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-serif text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                >
                  <option value="Philosophy">Philosophy</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Self-Improvement">Self-Improvement</option>
                  <option value="Classic Literature">Classic Literature</option>
                  <option value="Essays">Essays</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Total Folio Pages
                </label>
                <input
                  type="number"
                  required
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  ISBN Reference
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="978-014044..."
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Cover Art URL (or leave blank for archival default)
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or Open Library URL"
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Literary Synopsis & Themes
              </label>
              <textarea
                rows={3}
                required
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Convey the central philosophical tension and narrative scope..."
                className="w-full p-2.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={publishing || !title.trim()}
              className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-brass" />
              <span>{publishing ? 'Inscribing into Stacks...' : 'Publish Volume to Catalog'}</span>
            </button>
          </form>
        </div>

        {/* Desk 2: Launch Official Live AMA */}
        <div className="index-card p-6 border-t-2 border-t-oxblood space-y-4 shadow-paper">
          <div className="flex items-center justify-between border-b border-paper-border pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-oxblood animate-pulse" />
              <h3 className="font-serif text-base font-bold text-ink">
                Launch Official Live Author AMA
              </h3>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-oxblood text-cream px-1.5 py-0.5">
              BROADCAST
            </span>
          </div>

          <p className="font-reading text-xs text-ink-muted leading-relaxed">
            Opening an AMA salon dispatches real-time alerts to all scholars who follow your ledger. Readers can enter the parlor and discourse directly with you.
          </p>

          {amaSuccess && (
            <div className="p-3 bg-oxblood/10 border border-oxblood text-oxblood text-xs font-mono">
              {amaSuccess}
            </div>
          )}

          <form onSubmit={handleLaunchAMA} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                AMA Salon Title
              </label>
              <input
                type="text"
                required
                value={amaTitle}
                onChange={(e) => setAmaTitle(e.target.value)}
                placeholder="e.g. Live Q&A: The Architecture of Thought & Memory"
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Associated Volume (Optional)
              </label>
              <select
                value={amaBookId}
                onChange={(e) => setAmaBookId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
              >
                <option value="">— General Author Discussion —</option>
                {authorBooks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Chapter Scope / Spoiler Bounds
              </label>
              <input
                type="text"
                value={amaChapterScope}
                onChange={(e) => setAmaChapterScope(e.target.value)}
                placeholder="e.g. Chapters 1-10 Spoiler Safe or Open Discussion"
                className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Welcome Message to Readers
              </label>
              <textarea
                rows={3}
                value={amaDescription}
                onChange={(e) => setAmaDescription(e.target.value)}
                placeholder="Welcome fellow bibliophiles and introduce the topics you look forward to answering..."
                className="w-full p-2.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={launchingAMA || !amaTitle.trim()}
              className="w-full py-2.5 bg-oxblood hover:bg-oxblood-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-brass" />
              <span>{launchingAMA ? 'Broadcasting Dispatches...' : 'Launch Live AMA Salon'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Inscribed Works Catalog */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-ink border-b border-paper-border pb-2">
          Your Inscribed Volumes in the Archive ({authorBooks.length})
        </h3>

        {authorBooks.length === 0 ? (
          <div className="index-card p-8 text-center text-xs font-reading italic text-ink-muted">
            You have not yet inscribed any books. Use the form above to stock your first volume.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {authorBooks.map((b) => (
              <div key={b._id} className="index-card p-3 flex gap-3">
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="w-14 h-20 object-cover border border-paper-border flex-shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    to={`/books/${b._id}`}
                    className="font-serif text-xs font-bold text-ink hover:text-library-green line-clamp-1"
                  >
                    {b.title}
                  </Link>
                  <p className="font-mono text-[10px] text-ink-muted uppercase">
                    {b.genre} • {b.totalPages} p.
                  </p>
                  <div className="flex items-center gap-1 text-brass text-xs font-mono pt-1">
                    <Star className="w-3 h-3 fill-brass" />
                    <span>{b.averageRating > 0 ? b.averageRating.toFixed(1) : 'Unrated'}</span>
                    <span className="text-ink-muted">({b.ratingsCount} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorStudioPage;
