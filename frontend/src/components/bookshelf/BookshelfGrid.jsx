import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BookshelfGrid = ({ shelfItems = [], isOwner = false, onShelfUpdated }) => {
  const [activeTab, setActiveTab] = useState('currently_reading'); // 'currently_reading' | 'completed' | 'want_to_read'
  const { updateShelf, removeFromShelf } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editPage, setEditPage] = useState(0);

  const filteredItems = shelfItems.filter((item) => item.status === activeTab && item.book);

  const handleUpdatePage = async (bookId, totalPages) => {
    try {
      const pageNum = Number(editPage);
      const newStatus = pageNum >= totalPages ? 'completed' : 'currently_reading';
      await updateShelf(bookId, newStatus, pageNum);
      setEditingId(null);
      if (onShelfUpdated) onShelfUpdated();
    } catch (err) {
      console.warn('Page update failed:', err.message);
    }
  };

  const handleRemove = async (bookId) => {
    if (!window.confirm('Remove this volume from your bookshelf?')) return;
    try {
      await removeFromShelf(bookId);
      if (onShelfUpdated) onShelfUpdated();
    } catch (err) {
      console.warn('Failed removing book:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bookshelf Classification Tabs */}
      <div className="flex border-b border-paper-border bg-paper text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('currently_reading')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-r border-paper-border transition-colors ${
            activeTab === 'currently_reading'
              ? 'bg-parchment text-library-green font-bold border-b-2 border-b-library-green'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <BookOpen className="w-4 h-4 text-brass" />
          <span>Currently Reading ({shelfItems.filter((i) => i.status === 'currently_reading').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-r border-paper-border transition-colors ${
            activeTab === 'completed'
              ? 'bg-parchment text-library-green font-bold border-b-2 border-b-library-green'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-library-green" />
          <span>Completed ({shelfItems.filter((i) => i.status === 'completed').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('want_to_read')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'want_to_read'
              ? 'bg-parchment text-library-green font-bold border-b-2 border-b-library-green'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Clock className="w-4 h-4 text-oxblood" />
          <span>Want to Read ({shelfItems.filter((i) => i.status === 'want_to_read').length})</span>
        </button>
      </div>

      {/* Visual Bookshelf Stacks */}
      {filteredItems.length === 0 ? (
        <div className="index-card p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-brass mx-auto" />
          <h4 className="font-serif text-base font-bold text-ink">
            This Shelf Section is Vacant
          </h4>
          <p className="font-reading text-xs text-ink-muted max-w-sm mx-auto">
            Browse the Grand Catalog to discover volumes, or inscribe books you have completed.
          </p>
          <Link
            to="/books"
            className="inline-block px-4 py-2 bg-library-green text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm hover:bg-library-green-hover transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Books in rows with wooden shelf plank beneath each row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end pb-3">
            {filteredItems.map((item) => {
              const book = item.book;
              if (!book) return null;

              const progressPercent = book.totalPages > 0
                ? Math.min(100, Math.round((item.progressPage / book.totalPages) * 100))
                : 0;

              return (
                <div key={item._id || book._id} className="group relative flex flex-col items-center">
                  {/* Vertical Book Spine & Cover */}
                  <Link
                    to={`/books/${book._id}`}
                    className="relative block w-full max-w-[150px] aspect-[2/3] overflow-hidden shadow-shelf-shadow transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl border border-paper-border/80"
                  >
                    {/* Spine crease shadow overlay */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge for progress or completed */}
                    {item.status === 'completed' && (
                      <div className="absolute top-2 right-2 bg-library-green text-cream p-1 shadow-sm z-20">
                        <CheckCircle className="w-3.5 h-3.5 text-brass" />
                      </div>
                    )}
                  </Link>

                  {/* Metadata below book */}
                  <div className="mt-3 text-center w-full px-1 space-y-1">
                    <Link
                      to={`/books/${book._id}`}
                      className="font-serif text-xs font-bold text-ink hover:text-library-green line-clamp-1 block"
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                    <p className="text-[11px] font-reading text-ink-muted truncate">
                      {book.authorName}
                    </p>

                    {/* Progress indicator */}
                    {item.status === 'currently_reading' && (
                      <div className="pt-1 space-y-1">
                        <div className="w-full bg-paper border border-paper-border h-1.5 overflow-hidden">
                          <div
                            className="bg-library-green h-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted">
                          <span>p. {item.progressPage}</span>
                          <span>{progressPercent}%</span>
                        </div>

                        {/* Owner Quick Log Page Trigger */}
                        {isOwner && (
                          <div className="pt-1">
                            {editingId === book._id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={book.totalPages}
                                  value={editPage}
                                  onChange={(e) => setEditPage(e.target.value)}
                                  className="w-12 px-1 py-0.5 text-[10px] font-mono bg-paper border border-paper-border text-center"
                                />
                                <button
                                  onClick={() => handleUpdatePage(book._id, book.totalPages)}
                                  className="px-1.5 py-0.5 bg-library-green text-cream text-[10px] font-mono uppercase"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingId(book._id);
                                  setEditPage(item.progressPage);
                                }}
                                className="text-[10px] font-mono text-library-green hover:underline uppercase"
                              >
                                Update Page
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Owner Remove Button */}
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(book._id)}
                        className="text-[10px] font-mono text-oxblood hover:underline uppercase block mx-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solid 19th-Century Wooden Shelf Planks */}
          <div className="w-full h-4 wooden-shelf rounded-none" />
        </div>
      )}
    </div>
  );
};

export default BookshelfGrid;
