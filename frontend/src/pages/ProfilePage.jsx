import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Feather, 
  Bookmark, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthorBadge from '../components/common/AuthorBadge';
import BookshelfGrid from '../components/bookshelf/BookshelfGrid';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${username}`);
      if (res.data.success) {
        setProfileUser(res.data.user);
        setUserPosts(res.data.posts);
        setFollowerCount(res.data.user.followers?.length || 0);

        if (currentUser && res.data.user.followers) {
          const isF = res.data.user.followers.some(
            (f) => (f._id || f).toString() === currentUser._id.toString()
          );
          setFollowing(isF);
        }
      }
    } catch (err) {
      console.warn('Failed to load member profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      alert('Please sign the library ledger to follow members.');
      return;
    }
    if (!profileUser) return;

    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${profileUser._id}/follow`);
      if (res.data.success) {
        setFollowing(res.data.following);
        setFollowerCount(res.data.followerCount);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Follow action failed.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="index-card p-12 animate-pulse space-y-4">
        <div className="h-20 bg-paper-border/50 w-full" />
        <div className="h-6 bg-paper-border/60 w-1/3" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="index-card p-12 text-center space-y-3">
        <h2 className="font-serif text-xl font-bold text-ink">Member Not Found in Archives</h2>
        <Link to="/" className="text-xs font-mono uppercase text-library-green underline">
          Return to Reading Commons →
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser._id.toString() === profileUser._id.toString();

  return (
    <div className="space-y-8">
      {/* 1. Library Membership Card Frame */}
      <div className="index-card p-6 sm:p-8 space-y-6 border-2 border-brass/50 relative overflow-hidden">
        {/* Subtle background watermarked archive stamp */}
        <div className="absolute right-4 -bottom-4 font-serif text-7xl font-bold text-ink-muted/5 pointer-events-none select-none">
          ARCHIVE
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-paper-border pb-6">
          <div className="flex items-center gap-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-20 h-20 object-cover border-2 border-brass/60 shadow-paper"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                  {profileUser.penName || profileUser.name}
                </h1>
                {profileUser.role === 'author' && <AuthorBadge />}
              </div>
              <p className="font-mono text-xs text-ink-muted">
                @{profileUser.username} • {profileUser.role === 'author' ? 'Verified Author' : 'Bibliophile Critic'}
              </p>

              {profileUser.genreSpecialty && (
                <div className="mt-1 text-[11px] font-mono uppercase text-brass font-bold">
                  Specialty: {profileUser.genreSpecialty}
                </div>
              )}
            </div>
          </div>

          {/* Follow / Edit Button */}
          <div>
            {!isSelf ? (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold border transition-colors flex items-center gap-1.5 shadow-sm ${
                  following
                    ? 'bg-paper text-ink border-paper-border hover:bg-oxblood hover:text-cream hover:border-oxblood'
                    : 'bg-library-green hover:bg-library-green-hover text-cream border-brass'
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 text-brass" />
                    <span>Follow Scholar</span>
                  </>
                )}
              </button>
            ) : (
              <div className="font-mono text-xs uppercase px-3 py-1 bg-parchment border border-paper-border text-ink-muted">
                Your Library Ledger
              </div>
            )}
          </div>
        </div>

        {/* Bio and Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2">
            <span className="font-mono text-[10px] uppercase text-ink-muted tracking-wider block mb-1">
              Literary Creed
            </span>
            <p className="font-reading text-sm text-ink leading-relaxed">
              "{profileUser.bio}"
            </p>
          </div>

          <div className="flex items-center sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-border">
            <div className="text-center sm:text-right">
              <span className="font-serif text-lg font-bold text-ink block">
                {followerCount}
              </span>
              <span className="font-mono text-[10px] uppercase text-ink-muted">
                Followers
              </span>
            </div>

            <div className="text-center sm:text-right">
              <span className="font-serif text-lg font-bold text-ink block">
                {profileUser.following?.length || 0}
              </span>
              <span className="font-mono text-[10px] uppercase text-ink-muted">
                Following
              </span>
            </div>

            <div className="text-center sm:text-right">
              <span className="font-serif text-lg font-bold text-ink block">
                {profileUser.readingShelf?.length || 0}
              </span>
              <span className="font-mono text-[10px] uppercase text-ink-muted">
                Shelved Books
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Wooden Bookshelf Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-paper-border pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brass" />
            <h2 className="font-serif text-xl font-bold text-ink">
              The Bookshelf of {profileUser.name.split(' ')[0]}
            </h2>
          </div>
          <span className="font-mono text-xs text-ink-muted uppercase">
            Curated Stacks
          </span>
        </div>

        <BookshelfGrid
          shelfItems={profileUser.readingShelf || []}
          isOwner={isSelf}
          onShelfUpdated={fetchProfile}
        />
      </div>

      {/* 3. Inscribed Reviews & Quotes History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-paper-border pb-2">
          <h2 className="font-serif text-xl font-bold text-ink">
            Inscribed Folios & Marginalia ({userPosts.length})
          </h2>
          <span className="font-mono text-xs text-ink-muted uppercase">
            Public History
          </span>
        </div>

        {userPosts.length === 0 ? (
          <div className="index-card p-8 text-center text-xs font-reading italic text-ink-muted">
            This member has not yet inscribed any reviews or quotes into the ledger.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
