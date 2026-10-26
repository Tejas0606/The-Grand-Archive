const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Book = require('./models/Book');
const Post = require('./models/Post');
const ClubRoom = require('./models/ClubRoom');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grand_archive';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[The Grand Archive Seed] Connected to database.');

    // Clear existing collections
    console.log('[The Grand Archive Seed] Purging prior archives...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Post.deleteMany({}),
      ClubRoom.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Common password for all demo accounts: 'library123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('library123', salt);

    // 1. Inscribe Authors & Readers
    console.log('[The Grand Archive Seed] Inscribing Authors and Readers into ledger...');

    const authorUsers = await User.create([
      {
        name: 'Marcus Aurelius',
        username: 'marcus_aurelius',
        email: 'marcus@grandarchive.org',
        password: hashedPassword,
        role: 'author',
        penName: 'Marcus Aurelius Antoninus',
        genreSpecialty: 'Stoic Philosophy & Ethics',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
        bio: 'Roman Emperor and Stoic philosopher. Writing private journal entries to preserve serenity of the soul.'
      },
      {
        name: 'Jane Austen',
        username: 'jane_austen',
        email: 'jane@grandarchive.org',
        password: hashedPassword,
        role: 'author',
        penName: 'Jane Austen',
        genreSpecialty: 'Classic Fiction & Social Satire',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio: 'Observer of human foibles, courtship rituals, and rural English gentry. Penning social tapestries with subtle irony.'
      },
      {
        name: 'Frank Herbert',
        username: 'frank_herbert',
        email: 'frank@grandarchive.org',
        password: hashedPassword,
        role: 'author',
        penName: 'Frank Herbert',
        genreSpecialty: 'Speculative Sci-Fi & Ecology',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        bio: 'Creator of the Dune Chronicles. Inquiring into power structures, planetary ecosystems, and messianic traps.'
      },
      {
        name: 'Virginia Woolf',
        username: 'virginia_woolf',
        email: 'virginia@grandarchive.org',
        password: hashedPassword,
        role: 'author',
        penName: 'Virginia Woolf',
        genreSpecialty: 'Modernist Fiction & Essays',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        bio: 'Pioneer of stream-of-consciousness narrative. Exploring time, memory, and the interior architecture of thought.'
      }
    ]);

    const readerUsers = await User.create([
      {
        name: 'Arthur Pendelton',
        username: 'arthur_reader',
        email: 'arthur@grandarchive.org',
        password: hashedPassword,
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        bio: 'Keeper of leather-bound folios. Fascinated by 19th-century prose rhythms and moral dilemmas in Russian literature.'
      },
      {
        name: 'Clara Oswald',
        username: 'clara_o',
        email: 'clara@grandarchive.org',
        password: hashedPassword,
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        bio: 'Philosophical investigator. Reading late into the night alongside a pot of Earl Grey tea.'
      },
      {
        name: 'Julian Vance',
        username: 'julian_v',
        email: 'julian@grandarchive.org',
        password: hashedPassword,
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
        bio: 'Deep space speculative reader and amateur bookbinder. Constantly searching for cosmic scale narratives.'
      },
      {
        name: 'Eleanor Sterling',
        username: 'eleanor_s',
        email: 'eleanor@grandarchive.org',
        password: hashedPassword,
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        bio: 'Essay enthusiast, habit architect, and collector of vintage bookplates.'
      }
    ]);

    // Establish mutual follow connections
    // Arthur follows Marcus, Jane, Frank
    readerUsers[0].following.push(authorUsers[0]._id, authorUsers[1]._id, authorUsers[2]._id);
    authorUsers[0].followers.push(readerUsers[0]._id);
    authorUsers[1].followers.push(readerUsers[0]._id);
    authorUsers[2].followers.push(readerUsers[0]._id);

    // Clara follows Marcus and Virginia
    readerUsers[1].following.push(authorUsers[0]._id, authorUsers[3]._id);
    authorUsers[0].followers.push(readerUsers[1]._id);
    authorUsers[3].followers.push(readerUsers[1]._id);

    // Julian follows Frank Herbert
    readerUsers[2].following.push(authorUsers[2]._id);
    authorUsers[2].followers.push(readerUsers[2]._id);

    await Promise.all([
      readerUsers[0].save(),
      readerUsers[1].save(),
      readerUsers[2].save(),
      authorUsers[0].save(),
      authorUsers[1].save(),
      authorUsers[2].save(),
      authorUsers[3].save()
    ]);

    // 2. Inscribe Books (8+ iconic books across Philosophy, Fiction, Sci-Fi, Self-Improvement)
    console.log('[The Grand Archive Seed] Stocking Library Shelves with iconic volumes...');

    const books = await Book.create([
      {
        title: 'Meditations',
        author: authorUsers[0]._id,
        authorName: 'Marcus Aurelius',
        coverImage: 'https://covers.openlibrary.org/b/id/12836268-L.jpg',
        synopsis: 'A private notebook of spiritual exercises, stoic reminders, and reflections on mortal duty penned by the emperor of Rome while on campaign in Carnuntum.',
        genre: 'Philosophy',
        totalPages: 254,
        isbn: '978-0140449334',
        publishedYear: 180,
        averageRating: 4.9,
        ratingsCount: 2
      },
      {
        title: 'Pride and Prejudice',
        author: authorUsers[1]._id,
        authorName: 'Jane Austen',
        coverImage: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
        synopsis: 'The turbulent relationship between Elizabeth Bennet, the daughter of a country gentleman, and Fitzwilliam Darcy, a rich aristocratic landowner.',
        genre: 'Fiction',
        totalPages: 432,
        isbn: '978-0141439518',
        publishedYear: 1813,
        averageRating: 4.8,
        ratingsCount: 3
      },
      {
        title: 'Dune',
        author: authorUsers[2]._id,
        authorName: 'Frank Herbert',
        coverImage: 'https://covers.openlibrary.org/b/id/11186716-L.jpg',
        synopsis: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides as he navigates political betrayal, giant sandworms, and the spice melange.',
        genre: 'Sci-Fi',
        totalPages: 688,
        isbn: '978-0441172719',
        publishedYear: 1965,
        averageRating: 4.9,
        ratingsCount: 2
      },
      {
        title: 'To the Lighthouse',
        author: authorUsers[3]._id,
        authorName: 'Virginia Woolf',
        coverImage: 'https://covers.openlibrary.org/b/id/8235111-L.jpg',
        synopsis: 'A landmark of high modernism centered on the Ramsay family and their visits to the Isle of Skye, examining the passage of time and the fragility of relationships.',
        genre: 'Fiction',
        totalPages: 209,
        isbn: '978-0156907392',
        publishedYear: 1927,
        averageRating: 4.6,
        ratingsCount: 1
      },
      {
        title: 'Letters from a Stoic',
        author: authorUsers[0]._id,
        authorName: 'Seneca (Ed. Marcus Aurelius)',
        coverImage: 'https://covers.openlibrary.org/b/id/8750849-L.jpg',
        synopsis: 'Epistles exploring grief, wealth, friendship, and the art of unyielding personal fortitude amidst the corruptions of the Roman imperial court.',
        genre: 'Philosophy',
        totalPages: 312,
        isbn: '978-0140442106',
        publishedYear: 65,
        averageRating: 4.7,
        ratingsCount: 1
      },
      {
        title: 'Atomic Habits',
        author: authorUsers[1]._id,
        authorName: 'James Clear',
        coverImage: 'https://covers.openlibrary.org/b/id/12886416-L.jpg',
        synopsis: 'A comprehensive, practical framework for how tiny behavioral adjustments compound into remarkable long-term personal mastery.',
        genre: 'Self-Improvement',
        totalPages: 320,
        isbn: '978-0735211292',
        publishedYear: 2018,
        averageRating: 4.8,
        ratingsCount: 1
      },
      {
        title: 'Do Androids Dream of Electric Sheep?',
        author: authorUsers[2]._id,
        authorName: 'Philip K. Dick',
        coverImage: 'https://covers.openlibrary.org/b/id/8226191-L.jpg',
        synopsis: 'In a post-apocalyptic San Francisco shrouded in radioactive dust, bounty hunter Rick Deckard stalks rogue Nexus-6 replicants while grappling with empathy.',
        genre: 'Sci-Fi',
        totalPages: 240,
        isbn: '978-0345404474',
        publishedYear: 1968,
        averageRating: 4.5,
        ratingsCount: 1
      },
      {
        title: 'Crime and Punishment',
        author: authorUsers[3]._id,
        authorName: 'Fyodor Dostoevsky',
        coverImage: 'https://covers.openlibrary.org/b/id/12539704-L.jpg',
        synopsis: 'Impoverished former student Rodion Raskolnikov conceives of a psychological theory justifying murder, only to plunge into an inferno of moral delirium.',
        genre: 'Fiction',
        totalPages: 576,
        isbn: '978-0140449136',
        publishedYear: 1866,
        averageRating: 4.9,
        ratingsCount: 2
      }
    ]);

    // Populate Reader Reading Shelves
    readerUsers[0].readingShelf.push(
      { book: books[0]._id, status: 'completed', progressPage: 254 },
      { book: books[1]._id, status: 'currently_reading', progressPage: 185 },
      { book: books[2]._id, status: 'want_to_read', progressPage: 0 }
    );
    await readerUsers[0].save();

    readerUsers[1].readingShelf.push(
      { book: books[0]._id, status: 'currently_reading', progressPage: 120 },
      { book: books[4]._id, status: 'completed', progressPage: 312 },
      { book: books[3]._id, status: 'want_to_read', progressPage: 0 }
    );
    await readerUsers[1].save();

    readerUsers[2].readingShelf.push(
      { book: books[2]._id, status: 'currently_reading', progressPage: 430 },
      { book: books[6]._id, status: 'completed', progressPage: 240 }
    );
    await readerUsers[2].save();

    readerUsers[3].readingShelf.push(
      { book: books[5]._id, status: 'completed', progressPage: 320 },
      { book: books[7]._id, status: 'currently_reading', progressPage: 290 }
    );
    await readerUsers[3].save();

    // 3. Create Posts, Reviews, Quotes with Author Comments
    console.log('[The Grand Archive Seed] Publishing literary critiques and quotes...');

    // Review 1 on Pride and Prejudice by Arthur
    const post1 = await Post.create({
      user: readerUsers[0]._id,
      book: books[1]._id,
      postType: 'review',
      rating: 5,
      pageNumber: 432,
      content: 'Austen’s dialogue is a fencing duel disguised as drawing room pleasantry. The evolution of Darcy from stiff pride to vulnerable admission is executed with unmatched surgical grace.',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      likes: [readerUsers[1]._id, authorUsers[1]._id],
      comments: [
        {
          user: authorUsers[1]._id, // Jane Austen responds!
          text: 'My dear reader, you have perceived precisely what I labored so diligently to conceal beneath the lace cuffs: that vanity and pride are distinct sisters.',
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          user: readerUsers[1]._id,
          text: 'The dance scene at the Netherfield ball remains the finest dialogue scene in English literature.',
          createdAt: new Date(Date.now() - 1800000)
        }
      ]
    });

    // Review 2 on Meditations by Clara
    const post2 = await Post.create({
      user: readerUsers[1]._id,
      book: books[0]._id,
      postType: 'review',
      rating: 5,
      pageNumber: 254,
      content: 'To read the journal of a man burdened with ruling the known world, writing only to remind himself to be gentle with fools, is the greatest balm in modern life. "The obstacle is the way."',
      likes: [readerUsers[0]._id, readerUsers[2]._id, authorUsers[0]._id],
      comments: [
        {
          user: authorUsers[0]._id, // Marcus Aurelius responds!
          text: 'Look inward. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.',
          createdAt: new Date(Date.now() - 7200000)
        }
      ]
    });

    // Review 3 on Dune by Julian
    const post3 = await Post.create({
      user: readerUsers[2]._id,
      book: books[2]._id,
      postType: 'review',
      rating: 5,
      pageNumber: 688,
      content: 'Herbert built not merely a science fiction novel, but a holistic ecosystem of sociology, water economics, and cautionary theology. The litany against fear should be recited before every hard decision.',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800',
      likes: [readerUsers[0]._id, authorUsers[2]._id],
      comments: [
        {
          user: authorUsers[2]._id, // Frank Herbert responds!
          text: 'The highest function of ecology is understanding consequences. I am glad you caught the ecological warning beneath the prophetic myth.',
          createdAt: new Date(Date.now() - 4000000)
        }
      ]
    });

    // Quote from Crime & Punishment by Eleanor
    const post4 = await Post.create({
      user: readerUsers[3]._id,
      book: books[7]._id,
      postType: 'quote',
      pageNumber: 142,
      content: '"Pain and suffering are always inevitable for a large intelligence and a deep heart. The really great men must, I think, have great sadness on earth."',
      likes: [readerUsers[0]._id, readerUsers[1]._id]
    });

    // Author Announcement by Frank Herbert
    const post5 = await Post.create({
      user: authorUsers[2]._id,
      book: books[2]._id,
      postType: 'author_announcement',
      content: '📜 ARCHIVAL DISPATCH: Welcome travelers to the desert world. Tonight at twilight we open our Live Author AMA parlor to discuss the ecological underpinnings of Arrakis and the peril of infallible heroes.',
      likes: [readerUsers[0]._id, readerUsers[1]._id, readerUsers[2]._id, readerUsers[3]._id]
    });

    // Quote from Virginia Woolf by Arthur
    const post6 = await Post.create({
      user: readerUsers[0]._id,
      book: books[3]._id,
      postType: 'quote',
      pageNumber: 88,
      content: '"What is the meaning of life? That was all—a simple question; one that tended to close in on one with years. The great revelation had never come. The great revelation perhaps never did come."',
      likes: [readerUsers[1]._id, authorUsers[3]._id]
    });

    // Thought on Atomic Habits by Eleanor
    const post7 = await Post.create({
      user: readerUsers[3]._id,
      book: books[5]._id,
      postType: 'review',
      rating: 5,
      pageNumber: 320,
      content: 'Clear’s distinction between outcome-based habits and identity-based habits completely shifted how I view my reading goals. I no longer read to hit a metric; I read because I am an archivist of ideas.',
      likes: [readerUsers[0]._id]
    });

    // Quote from Letters from a Stoic by Clara
    const post8 = await Post.create({
      user: readerUsers[1]._id,
      book: books[4]._id,
      postType: 'quote',
      pageNumber: 47,
      content: '"We suffer more often in imagination than in reality. True happiness is to enjoy the present, without anxious dependence upon the future."',
      likes: [readerUsers[0]._id, readerUsers[2]._id]
    });

    // Review on Do Androids Dream by Julian
    const post9 = await Post.create({
      user: readerUsers[2]._id,
      book: books[6]._id,
      postType: 'review',
      rating: 4,
      pageNumber: 240,
      content: 'Dick’s vision of entropy and artificial empathy feels more urgent every decade. Mercerism is one of the strangest, most haunting religious concepts in speculative fiction.',
      likes: [readerUsers[3]._id]
    });

    // Author Announcement by Jane Austen
    const post10 = await Post.create({
      user: authorUsers[1]._id,
      book: books[1]._id,
      postType: 'author_announcement',
      content: 'To my esteemed correspondents: let it be remembered that laughter is the only sovereign antidote against the pomposities of the world. Inquire freely in the Longbourn Salon.',
      likes: [readerUsers[0]._id, readerUsers[1]._id]
    });

    // 4. Create Book Club Rooms & Live AMAs
    console.log('[The Grand Archive Seed] Establishing Reading Parlors & Author AMAs...');

    const rooms = await ClubRoom.create([
      {
        name: 'The Stoic Inner Citadel',
        description: 'A quiet sanctuary for studying the Meditations of Marcus Aurelius and practical ancient philosophy.',
        book: books[0]._id,
        host: authorUsers[0]._id,
        isAuthorAMA: false,
        chapterScope: 'Books 1-6 • The Cardinal Virtues',
        members: [authorUsers[0]._id, readerUsers[0]._id, readerUsers[1]._id]
      },
      {
        name: 'Longbourn Literary Salon',
        description: 'Analyzing the social dynamics, marriage contracts, and epistolary style of Jane Austen.',
        book: books[1]._id,
        host: authorUsers[1]._id,
        isAuthorAMA: false,
        chapterScope: 'Chapters 1-23 • First Impressions',
        members: [authorUsers[1]._id, readerUsers[0]._id, readerUsers[1]._id, readerUsers[3]._id]
      },
      {
        name: 'Arrakis Ecological Conclave',
        description: 'Exploring planetology, water rationing, and Fremen lore across the Frank Herbert dune cycle.',
        book: books[2]._id,
        host: readerUsers[2]._id,
        isAuthorAMA: false,
        chapterScope: 'Book 1: Dune • Arrival at Carthag',
        members: [readerUsers[2]._id, authorUsers[2]._id, readerUsers[0]._id]
      },
      {
        name: 'Live Author AMA: The Ecological Odyssey',
        description: 'Exclusive Live AMA parlor with Author Frank Herbert on writing speculative sci-fi and world-building.',
        book: books[2]._id,
        host: authorUsers[2]._id,
        isAuthorAMA: true,
        chapterScope: 'Live Q&A • Spoiler Safe',
        members: [authorUsers[2]._id, readerUsers[0]._id, readerUsers[1]._id, readerUsers[2]._id]
      }
    ]);

    // 5. Inscribe Initial Messages for Rooms
    console.log('[The Grand Archive Seed] Inscribing initial parlor discourse...');

    await Message.create([
      {
        room: rooms[0]._id,
        sender: authorUsers[0]._id,
        text: 'Welcome, travelers of the spirit. Remember: when you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.'
      },
      {
        room: rooms[0]._id,
        sender: readerUsers[1]._id,
        text: 'Gratitude for opening this salon, Marcus. Book 4, entry 3 on the mind retiring into its own little territory has anchored my week.'
      },
      {
        room: rooms[1]._id,
        sender: authorUsers[1]._id,
        text: 'Welcome to Longbourn. I trust our tea is warm and our judgments are sufficiently seasoned with humor.'
      },
      {
        room: rooms[1]._id,
        sender: readerUsers[0]._id,
        text: 'Mr. Collins’s proposal letter remains a masterclass of cringe literature. Truly timeless.'
      },
      {
        room: rooms[3]._id,
        sender: authorUsers[2]._id,
        text: 'Welcome everyone to the Live AMA. Ask me anything regarding the ecological origins of the worms or Paul’s terrible purpose.'
      },
      {
        room: rooms[3]._id,
        sender: readerUsers[2]._id,
        text: 'Frank, how did your study of the Oregon sand dunes inform the religious hierarchy of the Fremen?'
      }
    ]);

    // 6. Notifications
    await Notification.create([
      {
        recipient: readerUsers[0]._id,
        sender: authorUsers[1]._id,
        type: 'comment',
        post: post1._id
      },
      {
        recipient: readerUsers[1]._id,
        sender: authorUsers[0]._id,
        type: 'like',
        post: post2._id
      },
      {
        recipient: readerUsers[2]._id,
        sender: authorUsers[2]._id,
        type: 'author_ama',
        clubRoom: rooms[3]._id
      }
    ]);

    console.log('[The Grand Archive Seed] SUCCESS! The Grand Archive is fully populated.');
    console.log('--- CREDENTIALS OVERVIEW ---');
    console.log('Demo Reader:  email: arthur@grandarchive.org | password: library123');
    console.log('Demo Author:  email: jane@grandarchive.org   | password: library123');
    console.log('Demo Author:  email: marcus@grandarchive.org | password: library123');
    console.log('Demo Author:  email: frank@grandarchive.org  | password: library123');
    console.log('----------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[The Grand Archive Seed Failed]:', err);
    process.exit(1);
  }
};

seedDatabase();
