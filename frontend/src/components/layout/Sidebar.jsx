import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Library, 
  MessageSquare, 
  Bookmark, 
  Feather, 
  LogOut, 
  LogIn, 
  Sparkles,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthorBadge from '../common/AuthorBadge';

const Sidebar = ({ onCloseMobile }) => {
  const { user, isAuthor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const navLinks = [
    { to: '/', label: 'Reading Feed', icon: Compass, exact: true },
    { to: '/books', label: 'Grand Catalog', icon: Library },
    { to: '/clubs', label: 'Salons & AMAs', icon: MessageSquare },
    ...(user
      ? [
          {
            to: `/profile/${user.username}`,
            label: 'My Bookshelf',
            icon: Bookmark
          }
        ]
      : [])
  ];

  if (isAuthor) {
    navLinks.push({
      to: '/author-studio',
      label: 'Author Studio',
      icon: Feather,
      badge: 'OFFICIAL'
    });
  }

  return (
    <aside className="w-64 bg-mahogany text-cream flex flex-col h-full border-r border-[#2C231F] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#2C231F]">
        <Link 
          to="/" 
          onClick={onCloseMobile}
          className="group block"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-library-green border border-brass/40 flex items-center justify-center text-cream shadow-inner">
              <BookOpen className="w-5 h-5 text-brass" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide text-cream leading-tight">
                The Grand Archive
              </h1>
              <p className="text-[10px] tracking-widest uppercase font-mono text-brass/80">
                Bibliotheca Universalis
              </p>
            </div>
          </div>
        </Link>
        <div className="mt-3 pt-2 border-t border-[#2C231F]/80 text-[11px] font-reading italic text-cream-muted">
          "A sanctuary of living thought & archival ink."
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-widest text-brass/70">
          Library Folios
        </div>

        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors rounded-none ${
                  isActive
                    ? 'bg-library-green text-cream border-l-2 border-brass font-semibold shadow-sm'
                    : 'text-cream-muted hover:text-cream hover:bg-[#28201B]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-brass" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-oxblood text-cream font-bold">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* AI Archivist Banner in Sidebar */}
      <div className="p-4 mx-3 mb-3 bg-[#261E1A] border border-brass/30">
        <div className="flex items-center gap-2 mb-1.5 text-brass">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono tracking-wider uppercase">
            Archivist AI
          </span>
        </div>
        <p className="text-[11px] font-reading text-cream-muted leading-relaxed">
          Need spoiler-free recaps or polished prose? Use our AI Companion anywhere.
        </p>
      </div>

      {/* User Section / Ledger Register */}
      <div className="p-4 border-t border-[#2C231F] bg-[#171210]">
        {user ? (
          <div className="space-y-3">
            <Link
              to={`/profile/${user.username}`}
              onClick={onCloseMobile}
              className="flex items-center gap-3 group"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={user.name}
                className="w-9 h-9 object-cover border border-brass/50 group-hover:border-brass transition-colors"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-semibold text-cream truncate">
                    {user.penName || user.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-mono text-cream-muted truncate">
                    @{user.username}
                  </span>
                  {user.role === 'author' && <AuthorBadge />}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase text-cream-muted hover:text-cream border border-[#3A2D26] hover:bg-oxblood/80 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return Pass (Logout)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-cream-muted text-center font-reading italic">
              Guest Wanderer in the Halls
            </p>
            <Link
              to="/login"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono tracking-wider uppercase font-semibold border border-brass/50 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-brass" />
              <span>Sign the Ledger</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
