import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Library, Star, Filter, Bookmark, Plus, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthorBadge from '../components/common/AuthorBadge';
import api from '../services/api';

const CatalogPage = () => {
  const { user, updateShelf } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentSearch = searchParams.get('search') || '';
  const currentGenre = searchParams.get('genre') || 'all';
  const currentSort = searchParams.get('sort') || 'rating';

  const [activeMenuBookId, setActiveMenuBookId] = useState(null);
  const [shelfUpdating, setShelfUpdating] = useState(false);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/books/genres');
        if (res.data.success) {
          setGenres(['all', ...res.data.genres]);
        }
      } catch (err) {
        console.warn('Could not load genres:', err.message);
      }
    };
    fetchGenres();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentSearch) query.set('search', currentSearch);
        if (currentGenre && currentGenre !== 'all') query.set('genre', currentGenre);
        if (currentSort) query.set('sort', currentSort);
        query.set('limit', '30');

        const res = await api.get(`/books?${query.toString()}`);
        if (res.data.success) {
          setBooks(res.data.books);
        }
      } catch (err) {
        console.warn('Failed to load catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentSearch, currentGenre, currentSort]);

  const handleShelfSelect = async (bookId, status) => {
    if (!user) {
      alert('Please sign the library ledger to manage your reading shelf.');
      return;
    }
    setShelfUpdating(true);
    try {
      await updateShelf(bookId, status, 0);
      setActiveMenuBookId(null);
    } catch (err) {
      alert('Failed updating shelf.');
    } finally {
      setShelfUpdating(false);
    }
  };

  const getBookShelfStatus = (bookId) => {
    if (!user?.readingShelf) return null;
    const item = user.readingShelf.find((i) => i.book && (i.book._id || i.book) === bookId);
    return item?.status || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-paper-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-library-green mb-1">
            <Library className="w-4 h-4 text-brass" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
              The Grand Catalog
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Archival Book Collection
          </h1>
          <p className="font-reading text-xs text-ink-muted mt-1 italic">
            Curated volumes across Philosophy, Classic Literature, Sci-Fi, and Human Nature.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-ink-muted">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => {
              searchParams.set('sort', e.target.value);
              setSearchParams(searchParams);
            }}
            className="px-2.5 py-1 text-xs font-mono bg-paper border border-paper-border focus:outline-none focus:border-library-green"
          >
            <option value="rating">Highest Rated</option>
            <option value="title">Title (A-Z)</option>
            <option value="year">Publication Year</option>
            <option value="recent">Recently Inscribed</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-brass flex-shrink-0" />
        <span className="text-[10px] font-mono uppercase text-ink-muted tracking-wider flex-shrink-0">
          Genres:
        </span>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => {
              searchParams.set('genre', g);
              setSearchParams(searchParams);
            }}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors flex-shrink-0 border ${
              currentGenre === g
                ? 'bg-library-green text-cream border-brass font-bold'
                : 'bg-paper text-ink border-paper-border hover:bg-parchment'
            }`}
          >
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="index-card p-3 animate-pulse space-y-3">
              <div className="aspect-[2/3] bg-paper-border/50" />
              <div className="h-4 bg-paper-border/60 w-3/4" />
              <div className="h-3 bg-paper-border/40 w-1/2" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="index-card p-12 text-center space-y-3">
          <Library className="w-8 h-8 text-brass mx-auto" />
          <h3 className="font-serif text-lg font-bold text-ink">
            No Volumes Matching These Stacks
          </h3>
          <p className="font-reading text-xs text-ink-muted max-w-sm mx-auto">
            Try resetting your search query or selecting another literary genre.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {books.map((book) => {
            const shelfStatus = getBookShelfStatus(book._id);
            const isMenuOpen = activeMenuBookId === book._id;

            return (
              <div
                key={book._id}
                className="index-card p-3.5 flex flex-col justify-between group hover:shadow-paper-elevated transition-shadow"
              >
                <div className="space-y-3">
                  {/* Book Cover */}
                  <Link
                    to={`/books/${book._id}`}
                    className="relative block aspect-[2/3] overflow-hidden border border-paper-border shadow-book-spine group-hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Genre tag overlay */}
                    <span className="absolute top-2 right-2 bg-mahogany/90 text-cream font-mono text-[9px] uppercase px-1.5 py-0.5 border border-brass/40 shadow-sm z-20">
                      {book.genre}
                    </span>
                  </Link>

                  {/* Title and Author */}
                  <div>
                    <Link
                      to={`/books/${book._id}`}
                      className="font-serif text-sm font-bold text-ink hover:text-library-green line-clamp-1 leading-snug block"
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-reading text-ink-muted truncate">
                        {book.authorName}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars and Count */}
                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-paper-border">
                    <div className="flex items-center gap-1 text-brass">
                      <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                      <span className="font-bold text-ink text-xs">
                        {book.averageRating > 0 ? book.averageRating.toFixed(1) : 'Unrated'}
                      </span>
                    </div>
                    <span className="text-[10px] text-ink-muted">
                      {book.totalPages} pages
                    </span>
                  </div>
                </div>

                {/* Add to Shelf Menu Trigger */}
                <div className="relative mt-3 pt-2">
                  <button
                    onClick={() => setActiveMenuBookId(isMenuOpen ? null : book._id)}
                    className={`w-full py-1.5 px-2 text-xs font-mono uppercase tracking-wider font-semibold border flex items-center justify-between transition-colors ${
                      shelfStatus
                        ? 'bg-library-green text-cream border-brass'
                        : 'bg-paper text-ink border-paper-border hover:bg-parchment'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Bookmark className="w-3.5 h-3.5 text-brass flex-shrink-0" />
                      <span className="truncate">
                        {shelfStatus ? shelfStatus.replace('_', ' ') : 'Add to Shelf'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-brass flex-shrink-0" />
                  </button>

                  {/* Shelf Status Selection Popover */}
                  {isMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-paper border border-paper-border shadow-paper-elevated z-30 divide-y divide-paper-border text-xs font-mono uppercase">
                      <button
                        onClick={() => handleShelfSelect(book._id, 'want_to_read')}
                        className="w-full text-left px-3 py-2 hover:bg-parchment text-ink transition-colors"
                      >
                        Want to Read
                      </button>
                      <button
                        onClick={() => handleShelfSelect(book._id, 'currently_reading')}
                        className="w-full text-left px-3 py-2 hover:bg-parchment text-ink transition-colors"
                      >
                        Currently Reading
                      </button>
                      <button
                        onClick={() => handleShelfSelect(book._id, 'completed')}
                        className="w-full text-left px-3 py-2 hover:bg-parchment text-ink transition-colors"
                      >
                        Completed / Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
