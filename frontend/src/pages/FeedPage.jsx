import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, Feather, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostWidget from '../components/feed/CreatePostWidget';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'following' | 'reviews' | 'announcements'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (pageNum = 1, currentFilter = filter, append = false) => {
    try {
      if (pageNum === 1 && !append) setLoading(true);
      const res = await api.get(`/posts?page=${pageNum}&limit=10&filter=${currentFilter}`);
      if (res.data.success) {
        if (append) {
          setPosts((prev) => [...prev, ...res.data.posts]);
        } else {
          setPosts(res.data.posts);
        }
        setHasMore(pageNum < res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.warn('Failed to load feed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, filter, false);
  }, [filter]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, filter, false);
  };

  return (
    <div className="space-y-6">
      {/* Feed Hero Banner */}
      <div className="border-b border-paper-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-library-green mb-1">
            <Compass className="w-4 h-4 text-brass" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
              The Grand Archive Commons
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            The Reading Room Feed
          </h1>
          <p className="font-reading text-xs text-ink-muted mt-1 italic">
            Literary reflections, marginalia, and dispatches from verified authors.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-paper border border-paper-border hover:border-brass text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5 text-xs font-mono"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Folios</span>
        </button>
      </div>

      {/* Inscribe Reflection / Create Post Widget */}
      <CreatePostWidget onPostCreated={handlePostCreated} />

      {/* Feed Filter Classification Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border bg-paper p-1 text-xs font-mono uppercase tracking-wider">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 transition-colors ${
              filter === 'all'
                ? 'bg-library-green text-cream font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-parchment'
            }`}
          >
            All Archive Posts
          </button>

          {user && (
            <button
              onClick={() => setFilter('following')}
              className={`px-3 py-1.5 transition-colors ${
                filter === 'following'
                  ? 'bg-library-green text-cream font-bold'
                  : 'text-ink-muted hover:text-ink hover:bg-parchment'
              }`}
            >
              Following Only
            </button>
          )}

          <button
            onClick={() => setFilter('reviews')}
            className={`px-3 py-1.5 transition-colors ${
              filter === 'reviews'
                ? 'bg-library-green text-cream font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-parchment'
            }`}
          >
            Book Reviews
          </button>

          <button
            onClick={() => setFilter('announcements')}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${
              filter === 'announcements'
                ? 'bg-oxblood text-cream font-bold'
                : 'text-oxblood hover:bg-oxblood/10'
            }`}
          >
            <Feather className="w-3 h-3 text-brass" />
            <span>Author Dispatches</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-ink-muted pr-2 hidden md:inline">
          Archived: {posts.length} entries
        </span>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="index-card p-6 animate-pulse space-y-3">
              <div className="h-4 bg-paper-border/60 w-1/4" />
              <div className="h-16 bg-paper-border/40 w-full" />
              <div className="h-3 bg-paper-border/50 w-1/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="index-card p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-brass mx-auto" />
          <h3 className="font-serif text-lg font-bold text-ink">
            No Entries Found Under This Foliation
          </h3>
          <p className="font-reading text-xs text-ink-muted max-w-md mx-auto">
            {filter === 'following'
              ? 'You are not yet following members with recent posts. Follow authors or readers from the catalog.'
              : 'Be the first to inscribe your thoughts using the reflection box above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {/* Pagination Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchPosts(page + 1, filter, true)}
                className="px-6 py-2.5 bg-paper hover:bg-parchment text-ink text-xs font-mono uppercase tracking-wider font-semibold border border-paper-border shadow-sm transition-colors"
              >
                Inspect Earlier Folios →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
