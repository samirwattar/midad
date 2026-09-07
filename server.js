require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Render (and most PaaS hosts) sit behind a reverse proxy; this is required
// for secure cookies and req.secure to work correctly.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({
  origin: isProd && allowedOrigins.length ? allowedOrigins : true,
  credentials: true   // required so the session cookie is sent/received
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/pages', express.static('pages'));

// Stores sessions in MySQL so they survive server restarts/redeploys
// instead of living in memory (the express-session default, which leaks
// memory and forgets everyone every time the process restarts).
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-in-your-.env',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // a week
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax'
  }
}));

// ---- auth helpers -------------------------------------------------

// blocks anyone not logged in
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  next();
}

// blocks logged-in users whose role isn't in `roles`
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'ليست لديك صلاحية للقيام بذلك' });
    }
    next();
  };
}

// role hierarchy: user < author < admin < co-owner < owner.
// ADMIN_ROLES all get the admin dashboard and admin-equivalent permissions
// everywhere else (deleting/editing any novel, moderating chapters, etc.).
// PROTECTED_ROLES can't have their role touched by a plain admin — only
// the owner can promote/demote an owner or co-owner.
const ADMIN_ROLES = ['admin', 'co-owner', 'owner'];
const PROTECTED_ROLES = ['owner', 'co-owner'];
function hasAdminAccess(role) { return ADMIN_ROLES.includes(role); }

// ---- auth routes ----------------------------------------------------

// anyone can self-register, but always as a plain 'user' —
// admin/author accounts are promoted by an admin afterwards
// (edit the role directly in the DB, or add an admin-only promote
// route later once you have your first admin account)
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'الحقول المطلوبة ناقصة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, 'user']
    );

    req.session.user = { id: result.insertId, username, role: 'user', avatar: null };
    res.json({ id: result.insertId, username, role: 'user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'الحقول المطلوبة ناقصة' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, avatar FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role, avatar: user.avatar };
    res.json({ id: user.id, username: user.username, role: user.role, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// lets the frontend ask "who am I" on every page load
app.get('/api/auth/me', (req, res) => {
  res.json(req.session.user || null);
});

// make sure the folder for cover uploads exists
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `cover-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches the hint text on the form
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('الملف المرفوع ليس صورة'));
    }
    cb(null, true);
  }
});

// GET the logged-in user's own novels — powers the profile page
app.get('/api/profile/novels', requireAuth, async (req, res) => {
  try {
    const [novels] = await pool.query(
      `SELECT id, title, title_en, status, rating, views, cover_image, type, review_status, review_note
       FROM novels WHERE author_id = ? ORDER BY created_at DESC`,
      [req.session.user.id]
    );
    for (const novel of novels) {
      const [chapters] = await pool.query(
        `SELECT chapter_number, title, is_premium, created_at
         FROM chapters WHERE novel_id = ? ORDER BY chapter_number DESC LIMIT 3`,
        [novel.id]
      );
      novel.chapters = chapters;
    }
    res.json(novels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update the logged-in user's username and/or avatar
app.put('/api/profile', requireAuth, upload.single('avatar'), async (req, res) => {
  const { username } = req.body;
  const userId = req.session.user.id;

  try {
    if (username && username !== req.session.user.username) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existing.length) {
        return res.status(409).json({ error: 'اسم المستخدم مستخدم بالفعل' });
      }
      await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
      req.session.user.username = username;
    }

    if (req.file) {
      const avatarPath = `uploads/${req.file.filename}`;
      await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);
      req.session.user.avatar = avatarPath;
    }

    res.json(req.session.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all novels — powers the homepage AND the novels.html browse/search
// page (which combines a text query, a category filter, and a sort, any
// or all of which may be present at once)
app.get('/api/novels', async (req, res) => {
  try {
    // ?sort=views for "most watched", default is newest first.
    // ?limit=N caps how many rows come back.
    // ?category=<name> filters to novels tagged with that category.
    // ?q=<text> filters to novels/authors matching the text.
    const orderBy = req.query.sort === 'views' ? 'n.views DESC' : 'n.created_at DESC';
    const limit = parseInt(req.query.limit, 10);
    const category = req.query.category;
    const q = (req.query.q || '').trim();

    let sql = `SELECT n.id, n.title, n.title_en, n.status, n.rating, n.views, n.cover_image, n.type, u.username AS author
       FROM novels n JOIN users u ON n.author_id = u.id`;
    const conditions = [`n.review_status = 'approved'`];
    const params = [];
    if (category) {
      sql += ` JOIN novel_categories nc ON nc.novel_id = n.id JOIN categories c ON c.id = nc.category_id`;
      conditions.push('c.name = ?');
      params.push(category);
    }
    if (q) {
      conditions.push('(n.title LIKE ? OR n.title_en LIKE ? OR u.username LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    sql += ' WHERE ' + conditions.join(' AND ');
    sql += ` ORDER BY ${orderBy}`;
    if (Number.isInteger(limit) && limit > 0) {
      sql += ' LIMIT ?';
      params.push(limit);
    }

    const [novels] = await pool.query(sql, params);

    for (const novel of novels) {
      const [chapters] = await pool.query(
        `SELECT chapter_number, title, is_premium, created_at
         FROM chapters WHERE novel_id = ?
         ORDER BY chapter_number DESC LIMIT 3`,
        [novel.id]
      );
      novel.chapters = chapters;

      const [categories] = await pool.query(
        `SELECT c.name FROM categories c
         JOIN novel_categories nc ON c.id = nc.category_id
         WHERE nc.novel_id = ?`,
        [novel.id]
      );
      novel.categories = categories.map(c => c.name);
    }

    res.json(novels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET every category, with how many approved novels carry it — powers
// the category filter chips on novels.html
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name,
             COUNT(DISTINCT CASE WHEN n.review_status = 'approved' THEN n.id END) AS novel_count
      FROM categories c
      LEFT JOIN novel_categories nc ON nc.category_id = c.id
      LEFT JOIN novels n ON n.id = nc.novel_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single novel + its chapters + categories
app.get('/api/novels/:id', async (req, res) => {
  try {
    const [novel] = await pool.query(
      `SELECT n.*, u.username AS author FROM novels n
       JOIN users u ON n.author_id = u.id WHERE n.id = ?`,
      [req.params.id]
    );
    if (!novel.length) return res.status(404).json({ error: 'Not found' });

    // pending/rejected novels are only visible to their author or an admin —
    // everyone else gets a 404, same as if it didn't exist
    const sessionUser = req.session.user;
    const isOwnerOrAdmin = sessionUser && (sessionUser.id === novel[0].author_id || hasAdminAccess(sessionUser.role));
    if (novel[0].review_status !== 'approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ error: 'Not found' });
    }

    // only count real public views, not the author/admin previewing a pending novel
    if (novel[0].review_status === 'approved') {
      await pool.query('UPDATE novels SET views = views + 1 WHERE id = ?', [req.params.id]);
      novel[0].views = (novel[0].views || 0) + 1;
    }

    const [chapters] = await pool.query(
      `SELECT id, chapter_number, title, is_premium, created_at
       FROM chapters WHERE novel_id = ? ORDER BY chapter_number ASC`,
      [req.params.id]
    );

    const [categories] = await pool.query(
      `SELECT c.name FROM categories c
       JOIN novel_categories nc ON c.id = nc.category_id
       WHERE nc.novel_id = ?`,
      [req.params.id]
    );

    // logged-in-only extras: is it in their library, do they follow the
    // author, and what did they personally rate it (if anything)
    let inLibrary = false;
    let followingAuthor = false;
    let userRating = null;
    if (sessionUser) {
      const [libRows] = await pool.query(
        'SELECT 1 FROM user_library WHERE user_id = ? AND novel_id = ?',
        [sessionUser.id, req.params.id]
      );
      inLibrary = libRows.length > 0;

      const [followRows] = await pool.query(
        'SELECT 1 FROM author_follows WHERE follower_id = ? AND author_id = ?',
        [sessionUser.id, novel[0].author_id]
      );
      followingAuthor = followRows.length > 0;

      const [ratingRows] = await pool.query(
        'SELECT rating FROM ratings WHERE user_id = ? AND novel_id = ?',
        [sessionUser.id, req.params.id]
      );
      userRating = ratingRows.length ? ratingRows[0].rating : null;
    }

    const [[{ ratingCount }]] = await pool.query(
      'SELECT COUNT(*) AS ratingCount FROM ratings WHERE novel_id = ?',
      [req.params.id]
    );
    const [[{ followerCount }]] = await pool.query(
      'SELECT COUNT(*) AS followerCount FROM author_follows WHERE author_id = ?',
      [novel[0].author_id]
    );

    res.json({
      ...novel[0],
      chapters,
      categories: categories.map(c => c.name),
      in_library: inLibrary,
      following_author: followingAuthor,
      user_rating: userRating,
      rating_count: ratingCount,
      followers_count: followerCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single chapter's content, with prev/next chapter numbers for nav —
// powers chapter.html
app.get('/api/novels/:novelId/chapters/:number', async (req, res) => {
  const { novelId, number } = req.params;
  try {
    const [novelRows] = await pool.query(
      'SELECT id, title, author_id, review_status FROM novels WHERE id = ?',
      [novelId]
    );
    if (!novelRows.length) return res.status(404).json({ error: 'Novel not found' });

    const sessionUser = req.session.user;
    const isOwnerOrAdmin = sessionUser && (sessionUser.id === novelRows[0].author_id || hasAdminAccess(sessionUser.role));
    if (novelRows[0].review_status !== 'approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ error: 'Novel not found' });
    }

    const [chapterRows] = await pool.query(
      `SELECT id, chapter_number, title, content, is_premium, created_at
       FROM chapters WHERE novel_id = ? AND chapter_number = ?`,
      [novelId, number]
    );
    if (!chapterRows.length) return res.status(404).json({ error: 'Chapter not found' });

    const [prevRows] = await pool.query(
      `SELECT chapter_number FROM chapters WHERE novel_id = ? AND chapter_number < ?
       ORDER BY chapter_number DESC LIMIT 1`,
      [novelId, number]
    );
    const [nextRows] = await pool.query(
      `SELECT chapter_number FROM chapters WHERE novel_id = ? AND chapter_number > ?
       ORDER BY chapter_number ASC LIMIT 1`,
      [novelId, number]
    );

    res.json({
      ...chapterRows[0],
      novel_id: Number(novelId),
      novel_title: novelRows[0].title,
      prev_chapter: prevRows[0] ? prevRows[0].chapter_number : null,
      next_chapter: nextRows[0] ? nextRows[0].chapter_number : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new novel — powers the publish form. Only authors/admins may publish.
app.post('/api/novels', requireRole('author', ...ADMIN_ROLES), upload.single('cover'), async (req, res) => {
  const { title, title_en, synopsis, status, firstChapter, type } = req.body;
  const authorId = req.session.user.id; // the pseudonym is just whatever username they registered with
  // categories arrives as a JSON string when sent via FormData
  let categories = [];
  try {
    categories = req.body.categories ? JSON.parse(req.body.categories) : [];
  } catch {
    categories = [];
  }
  const coverImage = req.file ? `uploads/${req.file.filename}` : null;

  if (!title || !synopsis || !firstChapter) {
    return res.status(400).json({ error: 'الحقول المطلوبة ناقصة' });
  }

  if (!type) {
  return res.status(400).json({ error: 'Novel type is required.' });
}

  try {
    // create the novel — starts as 'pending' until an admin reviews it
    const [novelResult] = await pool.query(
    'INSERT INTO novels (title, title_en, author_id, synopsis, status, cover_image, type, review_status) VALUES (?,?,?,?,?,?,?,?)',
    [title, title_en || null, authorId, synopsis, status || 'ongoing', coverImage, type, 'pending']
    );
    const novelId = novelResult.insertId;

    // save the first chapter
    await pool.query(
      'INSERT INTO chapters (novel_id, chapter_number, title, content) VALUES (?, 1, ?, ?)',
      [novelId, 'الفصل الأول', firstChapter]
    );

    // link categories (create any that don't exist yet)
    if (Array.isArray(categories)) {
      for (const catName of categories) {
        let catId;
        const [existingCat] = await pool.query('SELECT id FROM categories WHERE name = ?', [catName]);
        if (existingCat.length) {
          catId = existingCat[0].id;
        } else {
          const [catResult] = await pool.query('INSERT INTO categories (name) VALUES (?)', [catName]);
          catId = catResult.insertId;
        }
        await pool.query(
          'INSERT IGNORE INTO novel_categories (novel_id, category_id) VALUES (?, ?)',
          [novelId, catId]
        );
      }
    }

    res.json({ id: novelId, review_status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a novel's full data for the edit form — owner or admin only, no view increment
app.get('/api/profile/novels/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM novels WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const novel = rows[0];
    const isOwner = novel.author_id === req.session.user.id;
    if (!isOwner && !hasAdminAccess(req.session.user.role)) {
      return res.status(403).json({ error: 'ليست لديك صلاحية للقيام بذلك' });
    }

    const [categories] = await pool.query(
      `SELECT c.name FROM categories c
       JOIN novel_categories nc ON c.id = nc.category_id
       WHERE nc.novel_id = ?`,
      [req.params.id]
    );

    const [chapters] = await pool.query(
      `SELECT id, chapter_number, title, is_premium, created_at
       FROM chapters WHERE novel_id = ? ORDER BY chapter_number ASC`,
      [req.params.id]
    );

    res.json({ ...novel, categories: categories.map(c => c.name), chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a novel — owner or admin only. Cover is optional; the old
// one is kept (and its file deleted) only if a new one is uploaded.
app.put('/api/novels/:id', requireAuth, upload.single('cover'), async (req, res) => {
  const { title, title_en, synopsis, status, type } = req.body;
  let categories = [];
  try {
    categories = req.body.categories ? JSON.parse(req.body.categories) : [];
  } catch {
    categories = [];
  }

  if (!title || !synopsis) {
    return res.status(400).json({ error: 'الحقول المطلوبة ناقصة' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM novels WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const novel = rows[0];
    const isOwner = novel.author_id === req.session.user.id;
    if (!isOwner && !hasAdminAccess(req.session.user.role)) {
      return res.status(403).json({ error: 'ليست لديك صلاحية للقيام بذلك' });
    }

    let coverImage = novel.cover_image;
    if (req.file) {
      coverImage = `uploads/${req.file.filename}`;
      if (novel.cover_image) {
        fs.unlink(path.join(__dirname, 'public', novel.cover_image), () => {}); // best-effort cleanup
      }
    }

    // an author editing their own novel resubmits it for review (clears any
    // rejection note too); an admin (or higher) editing it does not change its review state
    const reviewStatus = hasAdminAccess(req.session.user.role) ? novel.review_status : 'pending';

    await pool.query(
      'UPDATE novels SET title=?, title_en=?, synopsis=?, status=?, type=?, cover_image=?, review_status=?, review_note=NULL WHERE id=?',
      [title, title_en || null, synopsis, status || 'ongoing', type || novel.type, coverImage, reviewStatus, req.params.id]
    );

    // replace categories entirely with whatever the form now sends
    await pool.query('DELETE FROM novel_categories WHERE novel_id = ?', [req.params.id]);
    if (Array.isArray(categories)) {
      for (const catName of categories) {
        let catId;
        const [existingCat] = await pool.query('SELECT id FROM categories WHERE name = ?', [catName]);
        if (existingCat.length) {
          catId = existingCat[0].id;
        } else {
          const [catResult] = await pool.query('INSERT INTO categories (name) VALUES (?)', [catName]);
          catId = catResult.insertId;
        }
        await pool.query(
          'INSERT IGNORE INTO novel_categories (novel_id, category_id) VALUES (?, ?)',
          [req.params.id, catId]
        );
      }
    }

    res.json({ id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a novel and everything hanging off it — owner or admin only
app.delete('/api/novels/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM novels WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const novel = rows[0];
    const isOwner = novel.author_id === req.session.user.id;
    if (!isOwner && !hasAdminAccess(req.session.user.role)) {
      return res.status(403).json({ error: 'ليست لديك صلاحية للقيام بذلك' });
    }

    if (novel.cover_image) {
      fs.unlink(path.join(__dirname, 'public', novel.cover_image), () => {}); // best-effort cleanup
    }

    await pool.query('DELETE FROM novel_categories WHERE novel_id = ?', [req.params.id]);
    await pool.query('DELETE FROM chapters WHERE novel_id = ?', [req.params.id]);
    await pool.query('DELETE FROM novels WHERE id = ?', [req.params.id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// small helper: loads a novel and 403s if the session user doesn't own it (or lacks admin access)
async function loadOwnedNovel(req, res) {
  const [rows] = await pool.query('SELECT * FROM novels WHERE id = ?', [req.params.id]);
  if (!rows.length) { res.status(404).json({ error: 'Not found' }); return null; }
  const novel = rows[0];
  const isOwner = novel.author_id === req.session.user.id;
  if (!isOwner && !hasAdminAccess(req.session.user.role)) {
    res.status(403).json({ error: 'ليست لديك صلاحية للقيام بذلك' });
    return null;
  }
  return novel;
}

// POST add a new chapter to a novel — owner or admin only. Chapter number
// is assigned automatically as the current max + 1.
app.post('/api/novels/:id/chapters', requireAuth, async (req, res) => {
  const { title, content, is_premium } = req.body;
  if (!content) return res.status(400).json({ error: 'محتوى الفصل مطلوب' });

  try {
    const novel = await loadOwnedNovel(req, res);
    if (!novel) return;

    const [maxRows] = await pool.query(
      'SELECT COALESCE(MAX(chapter_number), 0) AS maxNum FROM chapters WHERE novel_id = ?',
      [req.params.id]
    );
    const nextNumber = maxRows[0].maxNum + 1;

    const [result] = await pool.query(
      'INSERT INTO chapters (novel_id, chapter_number, title, content, is_premium) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, nextNumber, title || null, content, is_premium ? 1 : 0]
    );

    res.json({ id: result.insertId, chapter_number: nextNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update an existing chapter's title/content/premium flag — owner or admin only
app.put('/api/novels/:id/chapters/:number', requireAuth, async (req, res) => {
  const { title, content, is_premium } = req.body;
  if (!content) return res.status(400).json({ error: 'محتوى الفصل مطلوب' });

  try {
    const novel = await loadOwnedNovel(req, res);
    if (!novel) return;

    const [result] = await pool.query(
      'UPDATE chapters SET title = ?, content = ?, is_premium = ? WHERE novel_id = ? AND chapter_number = ?',
      [title || null, content, is_premium ? 1 : 0, req.params.id, req.params.number]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Chapter not found' });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a single chapter — owner or admin only. Chapter numbers of the
// remaining chapters are left as-is (gaps are fine; reading nav skips them).
app.delete('/api/novels/:id/chapters/:number', requireAuth, async (req, res) => {
  try {
    const novel = await loadOwnedNovel(req, res);
    if (!novel) return;

    const [result] = await pool.query(
      'DELETE FROM chapters WHERE novel_id = ? AND chapter_number = ?',
      [req.params.id, req.params.number]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Chapter not found' });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- library ("Add to library") ---------------------------------------

// POST save a novel to the logged-in user's library (idempotent)
app.post('/api/library/:novelId', requireAuth, async (req, res) => {
  try {
    const [novelRows] = await pool.query('SELECT id FROM novels WHERE id = ?', [req.params.novelId]);
    if (!novelRows.length) return res.status(404).json({ error: 'Not found' });

    await pool.query(
      'INSERT IGNORE INTO user_library (user_id, novel_id) VALUES (?, ?)',
      [req.session.user.id, req.params.novelId]
    );
    res.json({ ok: true, in_library: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a novel from the logged-in user's library
app.delete('/api/library/:novelId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_library WHERE user_id = ? AND novel_id = ?',
      [req.session.user.id, req.params.novelId]
    );
    res.json({ ok: true, in_library: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET the logged-in user's saved novels — powers "مكتبتي" on the profile page
app.get('/api/profile/library', requireAuth, async (req, res) => {
  try {
    const [novels] = await pool.query(
      `SELECT n.id, n.title, n.title_en, n.status, n.rating, n.views, n.cover_image, n.type, u.username AS author
       FROM user_library ul
       JOIN novels n ON n.id = ul.novel_id
       JOIN users u ON u.id = n.author_id
       WHERE ul.user_id = ? AND n.review_status = 'approved'
       ORDER BY ul.created_at DESC`,
      [req.session.user.id]
    );
    for (const novel of novels) {
      const [chapters] = await pool.query(
        `SELECT chapter_number, title, is_premium, created_at
         FROM chapters WHERE novel_id = ? ORDER BY chapter_number DESC LIMIT 3`,
        [novel.id]
      );
      novel.chapters = chapters;
    }
    res.json(novels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- following authors --------------------------------------------------

// POST follow an author (idempotent; can't follow yourself)
app.post('/api/follow/:authorId', requireAuth, async (req, res) => {
  const authorId = Number(req.params.authorId);
  if (authorId === req.session.user.id) {
    return res.status(400).json({ error: 'لا يمكنك متابعة نفسك' });
  }
  try {
    const [authorRows] = await pool.query('SELECT id FROM users WHERE id = ?', [authorId]);
    if (!authorRows.length) return res.status(404).json({ error: 'Not found' });

    await pool.query(
      'INSERT IGNORE INTO author_follows (follower_id, author_id) VALUES (?, ?)',
      [req.session.user.id, authorId]
    );
    res.json({ ok: true, following: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE unfollow an author
app.delete('/api/follow/:authorId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM author_follows WHERE follower_id = ? AND author_id = ?',
      [req.session.user.id, req.params.authorId]
    );
    res.json({ ok: true, following: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ratings --------------------------------------------------------------

// POST rate a novel 1-5 (upserts — rating again just updates your existing
// score) and recompute the novel's cached average
app.post('/api/novels/:id/rate', requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'التقييم يجب أن يكون رقمًا صحيحًا من 1 إلى 5' });
  }
  try {
    const [novelRows] = await pool.query('SELECT id FROM novels WHERE id = ?', [req.params.id]);
    if (!novelRows.length) return res.status(404).json({ error: 'Not found' });

    await pool.query(
      `INSERT INTO ratings (user_id, novel_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.session.user.id, req.params.id, rating]
    );

    const [[stats]] = await pool.query(
      'SELECT AVG(rating) AS avgRating, COUNT(*) AS ratingCount FROM ratings WHERE novel_id = ?',
      [req.params.id]
    );
    const average = Number(stats.avgRating).toFixed(2);
    await pool.query('UPDATE novels SET rating = ? WHERE id = ?', [average, req.params.id]);

    res.json({ ok: true, rating, average, rating_count: stats.ratingCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- admin routes ----------------------------------------------------

// GET novels for the admin dashboard. ?status=pending|approved|rejected filters; omit for all.
app.get('/api/admin/novels', requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT n.id, n.title, n.title_en, n.synopsis, n.status, n.type, n.review_status,
                      n.review_note, n.cover_image, n.created_at, u.username AS author
               FROM novels n JOIN users u ON n.author_id = u.id`;
    const params = [];
    if (['pending', 'approved', 'rejected'].includes(status)) {
      sql += ' WHERE n.review_status = ?';
      params.push(status);
    }
    sql += ' ORDER BY n.created_at DESC';
    const [novels] = await pool.query(sql, params);
    res.json(novels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST approve a pending (or previously rejected) novel
app.post('/api/admin/novels/:id/approve', requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE novels SET review_status = 'approved', review_note = NULL WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reject a novel, with an optional note explaining why (shown to the author)
app.post('/api/admin/novels/:id/reject', requireRole(...ADMIN_ROLES), async (req, res) => {
  const { note } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE novels SET review_status = 'rejected', review_note = ? WHERE id = ?",
      [note || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users — powers the admin "manage users" panel
app.get('/api/admin/users', requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, avatar FROM users ORDER BY id DESC'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT change a user's role — admin dashboard only.
// - nobody can change their own role (avoids locking yourself out)
// - only the owner can touch a user who is currently 'owner' or 'co-owner'
// - only the owner can grant the 'owner' or 'co-owner' role to anyone
app.put('/api/admin/users/:id/role', requireRole(...ADMIN_ROLES), async (req, res) => {
  const { role } = req.body;
  const assignableRoles = ['user', 'author', 'admin', 'co-owner', 'owner'];
  if (!assignableRoles.includes(role)) {
    return res.status(400).json({ error: 'دور غير صالح' });
  }
  if (Number(req.params.id) === req.session.user.id) {
    return res.status(400).json({ error: 'لا يمكنك تغيير دورك الخاص' });
  }

  const requesterRole = req.session.user.role;
  const requesterIsOwner = requesterRole === 'owner';
  const requesterIsOwnerOrCoOwner = requesterIsOwner || requesterRole === 'co-owner';

  // only the owner can grant the owner/co-owner role to anyone
  if (PROTECTED_ROLES.includes(role) && !requesterIsOwner) {
    return res.status(403).json({ error: 'فقط المالك يمكنه منح هذه الصلاحية' });
  }

  try {
    const [targetRows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (!targetRows.length) return res.status(404).json({ error: 'Not found' });
    const targetRole = targetRows[0].role;

    // only the owner can touch a user who is currently owner/co-owner
    if (PROTECTED_ROLES.includes(targetRole) && !requesterIsOwner) {
      return res.status(403).json({ error: 'لا يمكنك تعديل صلاحيات هذا المستخدم' });
    }
    // a plain admin can't change another admin's role — only co-owner/owner can
    if (targetRole === 'admin' && !requesterIsOwnerOrCoOwner) {
      return res.status(403).json({ error: 'فقط المالك أو شريك المالك يمكنه تعديل صلاحيات مشرف آخر' });
    }

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- problem reports ------------------------------------------------

// POST submit a report — open to anyone, logged in or not. If the
// reporter is logged in we record who they are; otherwise they can
// optionally leave a contact email.
app.post('/api/reports', async (req, res) => {
  const { type, message, email, page_url } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'تفاصيل المشكلة مطلوبة' });
  }
  const validTypes = ['technical', 'content', 'payment', 'other'];
  const reportType = validTypes.includes(type) ? type : 'other';
  const userId = req.session.user ? req.session.user.id : null;

  try {
    await pool.query(
      'INSERT INTO reports (user_id, type, message, contact_email, page_url) VALUES (?, ?, ?, ?, ?)',
      [userId, reportType, message.trim(), (email || '').trim() || null, (page_url || '').slice(0, 500) || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reports — admin dashboard only (admin and above), open ones first
app.get('/api/admin/reports', requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.type, r.message, r.contact_email, r.page_url, r.status, r.created_at,
              u.username
       FROM reports r
       LEFT JOIN users u ON u.id = r.user_id
       ORDER BY (r.status = 'open') DESC, r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark a report resolved
app.post('/api/admin/reports/:id/resolve', requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const [result] = await pool.query("UPDATE reports SET status = 'resolved' WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/test-db', async (req, res) => {
  const [rows] = await pool.query('SELECT 1+1 AS result');
  res.json(rows);
});

// catches errors thrown by multer (bad file type, too large, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'الملف المرفوع ليس صورة') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});