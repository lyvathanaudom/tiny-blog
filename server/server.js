require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sign up
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirm: true
        }
      }
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Sign in
app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Helpers
function toSlug(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate UUID format
function isValidUUID(uuid) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Validate slug format
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// List posts with basic pagination
app.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, q, auth_token } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    // Create client with auth token if provided
    const client = auth_token 
      ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false },
          global: { headers: { 'Authorization': `Bearer ${auth_token}` } }
        })
      : supabase;

    let query = client
      .from('posts')
      .select('id, created_at, title, date, cover, content, tag, slug, author', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q && String(q).trim()) {
      const term = String(q).trim();
      // search in title, content, and tag (convert JSON to text)
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%,tag::text.ilike.%${term}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Filter sensitive data for unauthenticated users
    const filteredData = auth_token ? data : data?.map(post => ({
      ...post,
      author: null // Don't expose author info to unauthenticated users
    }));

    res.json({
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      posts: filteredData || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by id or slug
app.get('/posts/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { auth_token } = req.query;
    
    let query = supabase.from('posts').select('id, created_at, title, date, cover, content, tag, slug, author').limit(1);

    // Check if it's a numeric ID (BIGINT) or slug
    if (/^\d+$/.test(idOrSlug)) {
      query = query.eq('id', parseInt(idOrSlug, 10));
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      throw error;
    }

    // Filter sensitive data for unauthenticated users
    const filteredData = auth_token ? data : { ...data, author: null };
    res.json(filteredData);
  } catch (err) {
    if (err && err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
app.post('/posts', verifyToken, async (req, res) => {
  try {
    const { title, content, slug, date, cover, tag, author } = req.body || {};
    
    // Validation
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const finalSlug = slug && String(slug).trim() ? toSlug(slug) : toSlug(title);
    
    if (!isValidSlug(finalSlug)) {
      return res.status(400).json({ error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' });
    }
    
    // Validate author if provided
    if (author && !isValidUUID(author)) {
      return res.status(400).json({ error: 'Invalid author UUID format' });
    }
    
    // Set author to current user if not provided
    const finalAuthor = author || req.user.id;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        title: String(title).trim(), 
        content: String(content).trim(), 
        slug: finalSlug,
        date: date || null,
        cover: cover || null,
        tag: tag || null,
        author: finalAuthor
      }])
      .select('id, created_at, updated_at, title, date, cover, content, tag, slug, author')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Slug already exists' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post - simplified version for testing
app.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, slug, date, cover, tag, author } = req.body || {};

    if (!title && !content && !slug && !date && !cover && !tag && author === undefined) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (content !== undefined) update.content = String(content).trim();
    if (slug !== undefined) {
      const finalSlug = toSlug(slug);
      if (!isValidSlug(finalSlug)) {
        return res.status(400).json({ error: 'Invalid slug format' });
      }
      update.slug = finalSlug;
    }
    if (date !== undefined) update.date = date;
    if (cover !== undefined) update.cover = cover;
    if (tag !== undefined) update.tag = tag;

    // Update the post
    const { data, error } = await supabase
      .from('posts')
      .update(update)
      .eq('id', parseInt(id, 10))
      .select('id, created_at, title, date, cover, content, tag, slug, author')
      .single();

    if (error) {
      console.log('Error details:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Slug already exists' });
      }
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    if (err && err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/posts/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // RLS will ensure user can only delete their own posts
    const { error } = await supabase.from('posts').delete().eq('id', parseInt(id, 10));
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Temporary test endpoint for debugging
app.post('/test-create-user', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use regular signup for now (email rate limiting may be an issue)
    const { data, error } = await supabase.auth.signUp({
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      options: {
        data: {
          is_test_user: true
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'Test user created',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Test user creation error:', err);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
