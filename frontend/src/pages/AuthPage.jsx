import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, Feather, KeyRound, Mail, User, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterInitial = location.pathname === '/register';
  const [isRegister, setIsRegister] = useState(isRegisterInitial);
  const [role, setRole] = useState('reader'); // 'reader' | 'author'

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [penName, setPenName] = useState('');
  const [genreSpecialty, setGenreSpecialty] = useState('');

  // Login credential (email or username)
  const [credential, setCredential] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          username,
          email,
          password,
          bio,
          role,
          penName: role === 'author' ? penName : '',
          genreSpecialty: role === 'author' ? genreSpecialty : ''
        });
      } else {
        await login(credential, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoRole);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Did you run the seed script?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full py-8 flex flex-col items-center justify-center">
      {/* Ledger Container */}
      <div className="w-full max-w-xl bg-paper border-2 border-brass/60 shadow-shelf-shadow p-6 sm:p-10 relative">
        {/* Ledger Red Margin Line */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-10 w-[1px] bg-oxblood/30 pointer-events-none" />

        {/* Archival Ledger Header */}
        <div className="text-center space-y-2 border-b border-paper-border pb-6 mb-6">
          <div className="w-12 h-12 bg-library-green border border-brass/50 text-cream flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-6 h-6 text-brass" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-ink">
            The Grand Archive Ledger
          </h2>
          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest">
            Registry of Readers, Scholars, and verified Authors
          </p>
        </div>

        {/* 1-Click Fast Demo Buttons */}
        <div className="mb-6 p-4 bg-parchment border border-brass/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-muted">
              Fast Evaluation Access
            </span>
            <span className="font-mono text-[10px] text-library-green font-semibold">
              Instant 1-Click
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('reader')}
              disabled={loading}
              className="py-2 px-3 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-brass" />
              <span>Demo Reader (Arthur)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('author')}
              disabled={loading}
              className="py-2 px-3 bg-oxblood hover:bg-oxblood-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5 text-brass" />
              <span>Demo Author (Jane/Marcus)</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle (Sign In vs Register) */}
        <div className="flex border-b border-paper-border mb-6 text-xs font-mono uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              !isRegister
                ? 'border-b-2 border-library-green text-library-green font-bold bg-parchment'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Sign In Existing Pass
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              isRegister
                ? 'border-b-2 border-library-green text-library-green font-bold bg-parchment'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Inscribe New Registry
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-oxblood/10 border border-oxblood/40 text-oxblood text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration Role Picker */}
          {isRegister && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Archival Role Classification
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('reader')}
                  className={`p-3 text-left border transition-colors ${
                    role === 'reader'
                      ? 'bg-parchment border-library-green ring-1 ring-library-green'
                      : 'bg-paper border-paper-border hover:bg-paper-hover'
                  }`}
                >
                  <div className="font-serif text-xs font-bold text-ink">Reader / Critic</div>
                  <div className="text-[10px] font-reading text-ink-muted mt-0.5">
                    Track reading shelves, write reviews, join salon discussions.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('author')}
                  className={`p-3 text-left border transition-colors ${
                    role === 'author'
                      ? 'bg-parchment border-oxblood ring-1 ring-oxblood'
                      : 'bg-paper border-paper-border hover:bg-paper-hover'
                  }`}
                >
                  <div className="font-serif text-xs font-bold text-ink flex items-center gap-1">
                    <span>Official Author</span>
                    <Feather className="w-3 h-3 text-oxblood" />
                  </div>
                  <div className="text-[10px] font-reading text-ink-muted mt-0.5">
                    Publish original volumes, host Live AMAs, verified stamp.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Registration Fields */}
          {isRegister ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arthur Pendelton"
                    className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                    Unique Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="e.g. arthur_reader"
                    className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Author Specific Fields */}
              {role === 'author' && (
                <div className="p-3 bg-oxblood/5 border border-oxblood/30 space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-oxblood flex items-center gap-1.5">
                    <Feather className="w-3 h-3 text-brass" />
                    <span>Author Dossier Credentials</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                        Author Pen Name
                      </label>
                      <input
                        type="text"
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="e.g. Marcus Aurelius"
                        className="w-full px-2.5 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                        Primary Genre Specialty
                      </label>
                      <input
                        type="text"
                        value={genreSpecialty}
                        onChange={(e) => setGenreSpecialty(e.target.value)}
                        placeholder="e.g. Stoic Philosophy, Sci-Fi"
                        className="w-full px-2.5 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Email Inscription
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arthur@grandarchive.org"
                  className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Secret Key (Password)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Member Bio / Literary Creed
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly state your literary affinities or philosophy..."
                  className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading"
                />
              </div>
            </>
          ) : (
            /* Login Fields */
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Email or Username Identifier
                </label>
                <input
                  type="text"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="arthur@grandarchive.org or arthur_reader"
                  className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Secret Key (Password)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-mono"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Consulting Ledger...' : isRegister ? 'Inscribe My Name' : 'Authenticate Pass'}</span>
            <ArrowRight className="w-4 h-4 text-brass" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
