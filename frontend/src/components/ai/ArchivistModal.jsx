import React, { useState, useEffect } from 'react';
import { Sparkles, X, BookOpen, ShieldCheck, Compass, Copy, Check } from 'lucide-react';
import api from '../../services/api';

const ArchivistModal = ({ isOpen, onClose, initialTab = 'polish', initialDraft = '', onApplyPolished }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'polish' | 'catch-up' | 'recommend'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Polish tab state
  const [draft, setDraft] = useState(initialDraft);
  const [tone, setTone] = useState('Poetic');
  const [bookTitle, setBookTitle] = useState('');
  const [polishedResult, setPolishedResult] = useState('');

  // Catch-Up tab state
  const [catchUpBook, setCatchUpBook] = useState('');
  const [milestone, setMilestone] = useState('');
  const [recapResult, setRecapResult] = useState('');

  // Recommend tab state
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (initialDraft) setDraft(initialDraft);
    if (initialTab) setActiveTab(initialTab);
  }, [initialDraft, initialTab, isOpen]);

  if (!isOpen) return null;

  const handlePolish = async () => {
    if (!draft.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/polish-review', {
        roughDraft: draft,
        tone,
        bookTitle
      });
      if (res.data.success) {
        setPolishedResult(res.data.polishedText);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Archivist was unable to transcribe your thought.');
    } finally {
      setLoading(false);
    }
  };

  const handleCatchUp = async () => {
    if (!catchUpBook.trim() || !milestone.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/catch-up', {
        bookTitle: catchUpBook,
        currentPoint: milestone
      });
      if (res.data.success) {
        setRecapResult(res.data.recap);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Archivist could not retrieve this milestone.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/recommend', {
        genres: favoriteGenre ? [favoriteGenre] : []
      });
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not consult recommendation ledger.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper border-2 border-brass/60 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Archival Modal Header */}
        <div className="p-4 bg-mahogany text-cream flex items-center justify-between border-b border-brass/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-library-green border border-brass/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brass" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-cream">
                The Archivist's Companion
              </h3>
              <p className="text-[10px] font-mono tracking-widest uppercase text-brass/80">
                Powered by Gemini AI • Literarily Calibrated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cream-muted hover:text-cream border border-[#3A2D26] hover:bg-[#28201B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-paper-border bg-[#EAE3D4] text-xs font-mono uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('polish')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-r border-paper-border transition-colors ${
              activeTab === 'polish'
                ? 'bg-paper text-library-green font-bold border-b-2 border-b-library-green'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brass" />
            <span>Polish Review</span>
          </button>

          <button
            onClick={() => setActiveTab('catch-up')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-r border-paper-border transition-colors ${
              activeTab === 'catch-up'
                ? 'bg-paper text-library-green font-bold border-b-2 border-b-library-green'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-library-green" />
            <span>Spoiler Catch-Up</span>
          </button>

          <button
            onClick={() => setActiveTab('recommend')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'recommend'
                ? 'bg-paper text-library-green font-bold border-b-2 border-b-library-green'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-oxblood" />
            <span>Curate Palate</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Polish Review */}
          {activeTab === 'polish' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Book Title (Optional Context)
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Crime and Punishment"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Select Literary Prose Tone
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Poetic', 'Analytical', 'Concise', 'Witty'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-1.5 text-xs font-mono uppercase border transition-colors ${
                        tone === t
                          ? 'bg-library-green text-cream border-brass font-bold'
                          : 'bg-parchment text-ink border-paper-border hover:bg-paper-hover'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Rough Thoughts or Bullet Points
                </label>
                <textarea
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. Raskolnikov's guilt feels unbearable. The pacing in part 2 is insane. The murder scene was so tense..."
                  className="w-full p-3 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none font-reading leading-relaxed"
                />
              </div>

              <button
                onClick={handlePolish}
                disabled={loading || !draft.trim()}
                className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-brass" />
                <span>{loading ? 'Consulting the Folios...' : '✨ Enhance with Archivist AI'}</span>
              </button>

              {polishedResult && (
                <div className="mt-4 p-4 bg-parchment border border-brass/50 shadow-paper space-y-3">
                  <div className="flex items-center justify-between border-b border-paper-border pb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-library-green font-bold">
                      Polished Folio Inscription ({tone})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(polishedResult)}
                        className="text-xs font-mono text-ink-muted hover:text-ink flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-library-green" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      {onApplyPolished && (
                        <button
                          onClick={() => {
                            onApplyPolished(polishedResult);
                            onClose();
                          }}
                          className="px-2 py-0.5 bg-library-green text-cream text-xs font-mono uppercase tracking-wider"
                        >
                          Use in Post
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="font-reading text-sm text-ink leading-relaxed whitespace-pre-wrap italic">
                    "{polishedResult}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Spoiler-Free Catch-Up */}
          {activeTab === 'catch-up' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={catchUpBook}
                  onChange={(e) => setCatchUpBook(e.target.value)}
                  placeholder="e.g. Crime and Punishment or Dune"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Your Current Reading Milestone (Strictly Spoiler Free)
                </label>
                <input
                  type="text"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  placeholder="e.g. Chapter 4 or Page 140"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none"
                />
              </div>

              <button
                onClick={handleCatchUp}
                disabled={loading || !catchUpBook.trim() || !milestone.trim()}
                className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-brass" />
                <span>{loading ? 'Synthesizing Spoiler-Free Dossier...' : 'Generate Catch-Up Dossier'}</span>
              </button>

              {recapResult && (
                <div className="mt-4 p-4 bg-parchment border border-brass/50 shadow-paper space-y-3">
                  <div className="flex items-center justify-between border-b border-paper-border pb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-library-green font-bold">
                      Safe Archival Summary up to {milestone}
                    </span>
                    <button
                      onClick={() => copyToClipboard(recapResult)}
                      className="text-xs font-mono text-ink-muted hover:text-ink flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-library-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-reading text-xs text-ink leading-relaxed whitespace-pre-line space-y-2">
                    {recapResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Recommend Books */}
          {activeTab === 'recommend' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Focus Genre or Current Literary Appetite
                </label>
                <input
                  type="text"
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  placeholder="e.g. Stoic Philosophy, Speculative Sci-Fi, Gothic Romance"
                  className="w-full px-3 py-1.5 text-xs bg-parchment border border-paper-border focus:border-library-green focus:outline-none"
                />
              </div>

              <button
                onClick={handleRecommend}
                disabled={loading}
                className="w-full py-2.5 bg-library-green hover:bg-library-green-hover text-cream text-xs font-mono uppercase tracking-wider font-semibold border border-brass shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-brass" />
                <span>{loading ? 'Inquiring of the Stacks...' : 'Curate 3 Personal Recommendations'}</span>
              </button>

              {recommendations.length > 0 && (
                <div className="mt-4 space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-parchment border border-paper-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-bold text-ink">
                          {rec.title}
                        </h4>
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-paper border border-paper-border text-ink-muted">
                          {rec.genre}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-library-green font-semibold">
                        by {rec.author}
                      </p>
                      <p className="font-reading text-xs text-ink-muted leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivistModal;
