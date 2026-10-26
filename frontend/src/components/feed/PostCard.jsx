import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageSquare, 
  Star, 
  Bookmark, 
  Feather, 
  Share2, 
  Check, 
  Send,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthorBadge from '../common/AuthorBadge';
import api from '../../services/api';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [authorResponded, setAuthorResponded] = useState(post.authorResponded || false);
  const [copied, setCopied] = useState(false);

  const isLiked = user && likes.some((id) => (id._id || id).toString() === user._id.toString());

  const handleToggleLike = async () => {
    if (!user) {
      alert('Please sign the ledger to like this entry.');
      return;
    }

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.success) {
        if (res.data.liked) {
          setLikes([...likes, user._id]);
        } else {
          setLikes(likes.filter((id) => (id._id || id).toString() !== user._id.toString()));
        }
      }
    } catch (err) {
      console.warn('Like toggle failed:', err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: newComment.trim() });
      if (res.data.success) {
        setComments(res.data.post.comments);
        setAuthorResponded(res.data.post.authorResponded);
        setNewComment('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add annotation.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/#post-${post._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article
      id={`post-${post._id}`}
      className="index-card index-card-red-rule p-5 sm:p-6 transition-all hover:shadow-paper-elevated space-y-4"
    >
      {/* Checkout Card Header: Date Stamp & Catalog Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border pb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user?.username}`} className="group flex items-center gap-2.5">
            <img
              src={post.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={post.user?.name}
              className="w-9 h-9 object-cover border border-paper-border group-hover:border-brass transition-colors"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-bold text-ink group-hover:text-library-green transition-colors">
                  {post.user?.penName || post.user?.name}
                </span>
                {post.user?.role === 'author' && <AuthorBadge />}
              </div>
              <span className="text-[11px] font-mono text-ink-muted">
                @{post.user?.username}
              </span>
            </div>
          </Link>
        </div>

        {/* Date Stamp & Post Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#EAE3D4] border border-paper-border text-ink-muted">
            {formattedDate}
          </span>
          <span
            className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 border ${
              post.postType === 'author_announcement'
                ? 'bg-oxblood text-cream border-oxblood'
                : post.postType === 'review'
                ? 'bg-library-green text-cream border-library-green'
                : post.postType === 'quote'
                ? 'bg-brass text-cream border-brass'
                : 'bg-paper text-ink border-paper-border'
            }`}
          >
            {post.postType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Book Reference Tag (if tagged) */}
      {post.book && (
        <div className="flex items-center justify-between p-2.5 bg-parchment border border-paper-border">
          <Link
            to={`/books/${post.book._id}`}
            className="flex items-center gap-3 flex-1 min-w-0 group"
          >
            <img
              src={post.book.coverImage}
              alt={post.book.title}
              className="w-8 h-12 object-cover border border-paper-border shadow-sm flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-ink-muted tracking-wider block">
                Archival Reference
              </span>
              <h4 className="font-serif text-xs font-bold text-ink group-hover:text-library-green truncate">
                {post.book.title}
              </h4>
              <p className="text-[11px] font-reading text-ink-muted truncate">
                by {post.book.authorName}
              </p>
            </div>
          </Link>

          {/* Star Rating or Page Quote Marker */}
          {post.postType === 'review' && post.rating && (
            <div className="flex items-center gap-1 pl-3 border-l border-paper-border">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < post.rating ? 'text-brass fill-brass' : 'text-paper-border'
                  }`}
                />
              ))}
            </div>
          )}

          {post.postType === 'quote' && post.pageNumber && (
            <div className="font-mono text-xs text-ink-muted pl-3 border-l border-paper-border">
              Folio p. {post.pageNumber}
            </div>
          )}
        </div>
      )}

      {/* "Author Responded" Highlight Banner */}
      {authorResponded && (
        <div className="flex items-center gap-2 p-2 bg-oxblood/10 border-l-2 border-oxblood text-oxblood">
          <Feather className="w-3.5 h-3.5 text-oxblood" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
            Official Author Responded in Margins
          </span>
        </div>
      )}

      {/* Main Post Content */}
      <div className="font-reading text-sm text-ink leading-relaxed whitespace-pre-line">
        {post.postType === 'quote' ? (
          <blockquote className="border-l-2 border-brass pl-4 italic text-ink/90 font-serif text-base py-1">
            {post.content}
          </blockquote>
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      {/* Attached Media Photo (if any) */}
      {post.image && (
        <div className="border border-paper-border overflow-hidden bg-black/5">
          <img
            src={post.image}
            alt="Archival attachment"
            className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {/* Footer Controls: Like, Comment, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-paper-border text-xs font-mono">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked ? 'text-oxblood font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-oxblood text-oxblood' : ''}`}
            />
            <span>{likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length} Annotations</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
          title="Copy link to folio"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-library-green" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Inscribed' : 'Share'}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-paper-border space-y-3 bg-parchment p-3 border border-paper-border">
          {/* List existing comments */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs font-reading italic text-ink-muted text-center py-2">
                No annotations inscribed yet. Be the first to append your thoughts.
              </p>
            ) : (
              comments.map((c, idx) => {
                const isBookAuthor =
                  post.book?.author &&
                  (c.user?._id || c.user)?.toString() === post.book.author.toString();

                return (
                  <div
                    key={idx}
                    className={`p-2.5 text-xs transition-colors border ${
                      isBookAuthor
                        ? 'bg-oxblood/5 border-oxblood/40 shadow-sm'
                        : 'bg-paper border-paper-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-ink">
                          {c.user?.penName || c.user?.name || 'Patron'}
                        </span>
                        {isBookAuthor && (
                          <span className="text-[9px] font-mono font-bold bg-oxblood text-cream px-1 py-0.2 tracking-wider">
                            OFFICIAL AUTHOR
                          </span>
                        )}
                        {c.user?.role === 'author' && !isBookAuthor && <AuthorBadge />}
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-reading text-ink leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Add comment input */}
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Inscribe your annotation..."
                className="flex-1 px-3 py-1.5 text-xs bg-paper border border-paper-border focus:border-library-green focus:outline-none font-reading"
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="px-3 py-1.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3 h-3 text-brass" />
                <span>Annotate</span>
              </button>
            </form>
          ) : (
            <p className="text-[11px] font-mono text-center text-ink-muted">
              <Link to="/login" className="text-library-green underline">
                Sign ledger
              </Link>{' '}
              to annotate this folio.
            </p>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
