# The Grand Archive (Bibliotheca Universalis)

> **A 19th-Century Warm Archival Social Book Club, Reading Tracker, and Author-Reader Community Platform**

Built with the **MERN** stack (MongoDB, Express, React, Node.js), Socket.io, Tailwind CSS, and Google Gemini AI (`gemini-2.5-flash`).

---

## 🏛️ Design Philosophy: "Warm Archival Library"

The Grand Archive explicitly discards generic modern SaaS gradients, neo-glassmorphism, and default Tailwind indigo buttons. Instead, it embodies the physical, tactile beauty of a 19th-century mahogany library and editorial literary journals (*The Paris Review*, *Literal.club*, *Kinfolk*):

- **Palette**: Warm Parchment (`#F9F6F0`), Aged Paper (`#F1ECE1`), Deep Mahogany (`#1E1815`), Fountain Pen Ink (`#231F1D`), Library Green (`#264636`), Oxblood Leather (`#722620`), and Antique Brass (`#B58938`).
- **Hairline Borders & Sharp Geometry**: Crisp `1px solid #DCD4C6` borders, sharp corners (`rounded-none` / `rounded-sm`), and paper shadows.
- **Editorial Typography**: *Playfair Display* for authoritative titles, *Lora* for literary reading prose, and *DM Sans* for stamped uppercase UI metadata.
- **Tactile Details**: Stamped checkout index cards, a visual wooden bookshelf with 3D spine creases, and wax-seal Author verification badges.

---

## 📚 Features & Syllabus Coverage

### 1. Authentication & Role-Based Access Control (RBAC)
- **JWT & HTTP-Only Cookies**: Secure stateless session handling.
- **Roles**: `"reader"` and `"author"`.
- **Author Permissions**: Exclusive privilege to publish original works to the Grand Catalog and host Official Live Author AMAs.
- **1-Click Demo Login**: Immediate buttons for **Demo Reader (Arthur Pendelton)** and **Demo Author (Marcus Aurelius / Jane Austen / Frank Herbert)**.

### 2. The Reading Room Commons (Social Feed)
- **Index Card Style Posts**: Top red rule, checkout date stamp, tagged book folio banner, and author verification badge.
- **"Author Responded" Highlight**: Automatically flags posts when the verified author of the tagged book adds an annotation to the discussion.
- **Social Graph**: Like counters, comment threads, and follow/unfollow mechanisms.
- **Feed Filtering**: Filter by *All Archive Posts*, *Following Only*, *Book Reviews*, and *Author Dispatches*.

### 3. The Grand Catalog & Interactive Book Folios
- **Search & Filter**: Debounced catalog search, genre filter chips (*Philosophy, Fiction, Sci-Fi, Self-Improvement, Classic Literature*), and rating/year sorts.
- **Reading Desk / Shelf Management**: Place books into *Currently Reading*, *Want to Read*, or *Completed*.
- **Live Page Milestone Slider**: Adjust your current page number with real-time percentage progress.

### 4. Real-Time Reading Salons & Live Author AMAs (Socket.io)
- **Live Discourse**: Real-time messaging with instant broadcasts.
- **Chapter Spoiler Bounds**: Strict header indicators defining spoiler-safe limits (e.g. *"Chapters 1-5 Spoiler Safe"*).
- **Online Presence**: Real-time counts of scholars currently in the parlor.
- **Typing Indicators**: *"Jane Austen is dipping pen in ink..."*
- **Live Notifications**: Targeted alerts dispatched to followers when an Author starts a Live AMA or publishes a book.

### 5. Gemini AI Literary Companion (`gemini-2.5-flash`)
Three integrated features powered by Google Gemini (with an intelligent offline literary fallback engine):
1. **Smart Review & Caption Polisher (`POST /api/ai/polish-review`)**: Transforms rough bullet points into poetic, analytical, concise, or witty literary prose.
2. **Spoiler-Free Catch-Up Assistant (`POST /api/ai/catch-up`)**: Provides a strictly spoiler-safe recap of plot, themes, and character dynamics up to your exact chapter or page.
3. **The Archivist's Recommendation (`POST /api/ai/recommend`)**: Evaluates shelf history and favorite genres to suggest 3 tailored titles with rationale.

### 6. Author Studio Dashboard (`/author-studio`)
- Accessible exclusively to users with `role === "author"`.
- Inscribe new volumes into the Grand Catalog with cover art, synopsis, ISBN, and page count.
- Dispatch Live Author AMAs that automatically notify all followers.
- Real-time analytics tracking total followers, reader volume counts, reviews, and average ratings.

### 7. Member Profile & Visual Wooden Bookshelf (`/profile/:username`)
- Physical library membership card header with bio, stats, and follow toggle.
- Multi-tier visual wooden bookshelf displaying vertical book covers, spine shadows, and reading progress bars.
- Complete archive of user reviews and quotes.

---

## 🛠️ Monorepo Architecture

```
/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary config with graceful fallback
│   ├── models/
│   │   ├── User.js               # Readers & Authors + shelves + followers
│   │   ├── Book.js               # Volumes published by authors
│   │   ├── Post.js               # Reviews, quotes, marginalia, comments
│   │   ├── ClubRoom.js           # Reading salons & Author AMAs
│   │   ├── Message.js            # Socket.io chat messages
│   │   └── Notification.js       # Real-time alert records
│   ├── middlewares/
│   │   ├── authMiddleware.js     # verifyToken & verifyAuthor
│   │   └── uploadMiddleware.js   # Multer memory storage
│   ├── controllers/
│   │   ├── authController.js     # Auth, session, 1-click demo logins
│   │   ├── userController.js     # Shelves, follows, notifications
│   │   ├── bookController.js     # Catalog search & publishing
│   │   ├── postController.js     # Feed, likes, comments, author replies
│   │   ├── clubController.js     # Salons, AMAs, message history
│   │   └── aiController.js       # Gemini 2.5 Flash endpoints
│   ├── routes/                   # Express routes
│   ├── socket/
│   │   └── socketHandler.js      # Real-time parlor chat & alerts
│   ├── seed.js                   # Rich database seeder
│   └── server.js                 # Express + HTTP + Socket.io entry
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/           # Sidebar, Header, RightWidgetSidebar, Layout
    │   │   ├── feed/             # CreatePostWidget, PostCard
    │   │   ├── bookshelf/        # BookshelfGrid (wooden shelves)
    │   │   ├── common/           # AuthorBadge
    │   │   └── ai/               # ArchivistModal (Gemini AI features)
    │   ├── context/
    │   │   ├── AuthContext.jsx   # User state & shelf management
    │   │   └── SocketContext.jsx # Real-time alerts & socket instance
    │   ├── pages/
    │   │   ├── FeedPage.jsx
    │   │   ├── CatalogPage.jsx
    │   │   ├── BookDetailPage.jsx
    │   │   ├── ClubsPage.jsx
    │   │   ├── ClubRoomPage.jsx
    │   │   ├── AuthorStudioPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── AuthPage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios client with credentials
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css             # Archival library design system
    ├── tailwind.config.js        # Custom warm parchment & mahogany palette
    └── vite.config.js            # Vite build configuration
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on default port `27017` (or remote MongoDB Atlas URI)

### 1. Database Seeding & Backend Setup
```bash
cd backend
npm install

# Populate the archive with sample Authors, Readers, Books, Reviews, and Salons
npm run seed

# Start the backend server (runs on port 5000)
npm start
# OR for development auto-reload:
# npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Ledger Accounts

Use the **1-Click Demo Login** buttons on `/login` or enter credentials manually:

| Name | Role | Email | Password | Notable Works / Shelves |
| :--- | :--- | :--- | :--- | :--- |
| **Arthur Pendelton** | Reader | `arthur@grandarchive.org` | `library123` | Active reader tracking *Pride and Prejudice* & *Dune* |
| **Jane Austen** | Author | `jane@grandarchive.org` | `library123` | Author of *Pride and Prejudice*; Host of Longbourn Salon |
| **Marcus Aurelius** | Author | `marcus@grandarchive.org` | `library123` | Author of *Meditations*; Host of Stoic Inner Citadel |
| **Frank Herbert** | Author | `frank@grandarchive.org` | `library123` | Author of *Dune*; Host of Live Author AMA |
| **Clara Oswald** | Reader | `clara@grandarchive.org` | `library123` | Philosophy critic tracking *Meditations* |

---

## ⚙️ Environment Variables Reference

A `.env.example` file is included in `/backend`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/grand_archive
JWT_SECRET=grand_archive_secret_key_literature_2026_super_secure
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (fallback to base64/direct URLs if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Google Gemini API Key (intelligent literary fallback included if omitted)
GEMINI_API_KEY=
```

---

*Inscribed and preserved for The Grand Archive • MDCCCLXXXIV*
