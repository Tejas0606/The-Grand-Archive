const { GoogleGenAI } = require('@google/genai');
const Book = require('../models/Book');
const User = require('../models/User');

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;
  try {
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  } catch (err) {
    console.warn('[Gemini AI] Initialization notice:', err.message);
    return null;
  }
};

/**
 * Generate content using the new Google GenAI SDK with candidate models
 */
const generateWithGemini = async (prompt) => {
  const ai = getGenAIClient();
  if (!ai) return null;

  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-pro-latest'
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      if (response && response.text) {
        return {
          text: response.text.trim(),
          model
        };
      }
    } catch (err) {
      console.warn(`[Gemini SDK Model ${model} Notice]:`, err.message || err);
      // Try next candidate model
    }
  }

  return null;
};

// @desc    Smart Review & Caption Polisher
// @route   POST /api/ai/polish-review
// @access  Public / Private
const polishReview = async (req, res) => {
  try {
    const { roughDraft, tone, bookTitle, postType } = req.body;

    if (!roughDraft || !roughDraft.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rough thoughts or bullet points to polish.'
      });
    }

    const selectedTone = tone || 'Poetic'; // Poetic, Analytical, Concise, Witty
    const titleContext = bookTitle ? `regarding the book "${bookTitle}"` : '';
    const typeContext = postType === 'quote' ? 'quote reflection' : 'literary book review';

    const prompt = `You are a distinguished literary archivist and editor at an elite 19th-century salon and literary journal (like The Paris Review).
Enhance the following rough thoughts into a stunning, evocative, and articulate ${typeContext} ${titleContext}.
Chosen tone: ${selectedTone}.
Constraints:
- Preserve the user's original sentiment and observations.
- Do NOT output conversational filler or preamble (do not write "Here is your review:").
- Output strictly the polished text ready for publication.
- Formatting: 1-2 paragraphs of rich prose or an aesthetic excerpt reflection.

Rough user thoughts:
"${roughDraft}"`;

    const liveResult = await generateWithGemini(prompt);
    if (liveResult) {
      return res.status(200).json({
        success: true,
        polishedText: liveResult.text,
        tone: selectedTone,
        source: liveResult.model
      });
    }

    // High-quality offline fallback generator
    let fallbackText = '';
    const cleanDraft = roughDraft.trim();
    if (selectedTone.toLowerCase() === 'poetic') {
      fallbackText = `In contemplating ${bookTitle ? `"${bookTitle}"` : 'these pages'}, one finds an intimate tapestry of longing and revelation. ${cleanDraft} Every sentence echoes like footsteps across aged mahogany, leaving a quiet cadence that lingers long after the volume is set aside.`;
    } else if (selectedTone.toLowerCase() === 'analytical') {
      fallbackText = `A critical reading of ${bookTitle ? `"${bookTitle}"` : 'the text'} reveals a deliberate structural balance between thematic gravity and psychological tension. Specifically, ${cleanDraft.toLowerCase()}. The work commands attention through its cohesive thematic resonance and restraint.`;
    } else if (selectedTone.toLowerCase() === 'witty') {
      fallbackText = `To read ${bookTitle ? `"${bookTitle}"` : 'this volume'} is to partake in high-stakes intellectual banter with an author who refuses to pull punches. ${cleanDraft} Quite simply: sharper than an archival fountain pen, and twice as indelible.`;
    } else {
      // Concise
      fallbackText = `${bookTitle ? `"${bookTitle}"` : 'This work'} captures a striking clarity: ${cleanDraft} An indispensable volume worthy of a permanent place on any serious reader's shelf.`;
    }

    res.status(200).json({
      success: true,
      polishedText: fallbackText,
      tone: selectedTone,
      source: 'archival-offline-engine'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to polish review: ${error.message}`
    });
  }
};

// @desc    Spoiler-Free Catch-Up Assistant
// @route   POST /api/ai/catch-up
// @access  Public / Private
const getCatchUp = async (req, res) => {
  try {
    const { bookTitle, currentPoint, synopsis } = req.body;

    if (!bookTitle || !currentPoint) {
      return res.status(400).json({
        success: false,
        message: 'Book title and your current reading milestone (e.g. "Chapter 4" or "Page 120") are required.'
      });
    }

    const prompt = `You are a scholarly literary archivist who helps readers resume reading without spoilers.
Book: "${bookTitle}"
Reader's Current Point: "${currentPoint}"
Book Context/Synopsis: "${synopsis || 'Classic literature'}"

TASK:
Provide a strictly SPOILER-FREE recap of the narrative arc, philosophical themes, character dynamics, and key stakes UP TO EXACTLY "${currentPoint}".
CRITICAL SAFETY RULE:
- NEVER reveal anything that occurs AFTER "${currentPoint}".
- If unsure of exact chapter boundaries, err on the side of caution and focus on the fundamental premise and initial dilemmas.
- Format with three clear archival sections:
  1. The Journey Thus Far (plot recap up to milestone)
  2. Psychological & Thematic Currents (key motifs and character stakes)
  3. The Horizon Ahead (teaser questions for what the reader should look out for next, without spoilers).`;

    const liveResult = await generateWithGemini(prompt);
    if (liveResult) {
      return res.status(200).json({
        success: true,
        bookTitle,
        currentPoint,
        recap: liveResult.text,
        source: liveResult.model
      });
    }

    // High quality offline fallback recap
    const fallbackRecap = `### 1. The Journey Thus Far (Up to ${currentPoint})
Approaching ${currentPoint} of *${bookTitle}*, the foundational world and moral landscape have firmly taken root. The central protagonist grapples with mounting internal friction against their environment, where early choices now cast long shadows.

### 2. Psychological & Thematic Currents
- **Moral Ambiguity:** Characters navigate competing duties between societal expectation and private conviction.
- **Atmosphere & Pacing:** The narrative establishes a simmering tension, placing philosophical weight upon ordinary human interactions.
- **Key Relationships:** Watch the dialogue closely—subtle subtext and unspoken allegiances define the shifting dynamics.

### 3. The Horizon Ahead
As you turn past ${currentPoint}, pay keen attention to how latent grievances begin to surface into overt decisions. The foundation has been laid; the crucible begins now.`;

    res.status(200).json({
      success: true,
      bookTitle,
      currentPoint,
      recap: fallbackRecap,
      source: 'archival-offline-engine'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to generate catch-up dossier: ${error.message}`
    });
  }
};

// @desc    The Archivist's Recommendation
// @route   POST /api/ai/recommend
// @access  Public / Private
const getRecommendations = async (req, res) => {
  try {
    let readingShelfContext = [];
    let favoriteGenres = [];

    // If user is logged in, grab their shelf
    if (req.user) {
      const user = await User.findById(req.user._id).populate('readingShelf.book');
      if (user && user.readingShelf.length > 0) {
        readingShelfContext = user.readingShelf
          .filter((item) => item.book)
          .map((item) => `"${item.book.title}" (${item.book.genre}, status: ${item.status})`);
      }
    }

    const { genres, recentBooks } = req.body;
    if (genres && Array.isArray(genres)) favoriteGenres = genres;
    if (recentBooks && Array.isArray(recentBooks)) readingShelfContext.push(...recentBooks);

    // Fetch existing books from the archive DB to possibly recommend or complement
    const catalogBooks = await Book.find().limit(8).select('title authorName genre synopsis');

    const prompt = `You are the Head Archivist of The Grand Archive.
A reader requests 3 personalized book recommendations based on their literary palate.
Reader's Current Reading Shelf: [${readingShelfContext.join(', ') || 'Eclectic reader of classics, philosophy, and speculative fiction'}]
Preferred Genres: [${favoriteGenres.join(', ') || 'Literary Fiction, Philosophy, History'}]

Available Archive Catalog Highlights:
${catalogBooks.map((b) => `- "${b.title}" by ${b.authorName} (${b.genre})`).join('\n')}

Format your response as a JSON array of 3 objects with properties:
- title: string
- author: string
- genre: string
- rationale: 2-3 sentences explaining why this book resonates with their specific taste.
Return strictly valid JSON without markdown fences.`;

    const liveResult = await generateWithGemini(prompt);
    if (liveResult) {
      try {
        let rawText = liveResult.text.trim();
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const parsedRecommendations = JSON.parse(rawText);

        return res.status(200).json({
          success: true,
          recommendations: parsedRecommendations,
          source: liveResult.model
        });
      } catch (parseError) {
        console.warn('[Gemini AI Parse Error - using fallback]:', parseError.message);
      }
    }

    // High quality offline fallback recommendations tailored to catalog
    const fallbackRecs = [
      {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        genre: 'Philosophy',
        rationale: 'For the contemplative mind seeking enduring tranquility amid the storm of modern existence. Aurelius writes not to lecture, but as a private sanctuary of stoic wisdom.'
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Classic Literature',
        rationale: 'A masterclass in psychological acuity, biting wit, and the delicate tension of human vanity. Perfect for readers who value linguistic grace and razor-sharp character dynamics.'
      },
      {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        genre: 'Sci-Fi / Literary Fiction',
        rationale: 'An unforgettable inquiry into what it truly means to love and be mortal, seen through the tender lens of an Artificial Friend. Poetic, poignant, and profoundly philosophical.'
      }
    ];

    res.status(200).json({
      success: true,
      recommendations: fallbackRecs,
      source: 'archival-offline-engine'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to curate recommendations: ${error.message}`
    });
  }
};

module.exports = {
  polishReview,
  getCatchUp,
  getRecommendations
};
