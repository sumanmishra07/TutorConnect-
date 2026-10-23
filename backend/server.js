import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const app = express();
app.use(cors(), express.json());

const TABLES = ['tutors', 'batches', 'students', 'attendance', 'homework', 'schedule', 'announcements'];
const run = async (res, q) => {
  const { data, error } = await q;
  error ? res.status(400).json({ error: error.message }) : res.json(data);
};

app.get('/api/health', (_, r) => r.json({ ok: true }));
app.use('/api/:t', (q, r, n) => (TABLES.includes(q.params.t) ? n() : r.status(404).json({ error: 'Unknown resource' })));

app.get('/api/:t', (q, r) => {
  let b = sb.from(q.params.t).select('*').order('created_at', { ascending: false });
  for (const [k, v] of Object.entries(q.query)) b = b.eq(k, v); // e.g. /api/tutors?subject=Maths
  run(r, b);
});
app.post('/api/:t', (q, r) => run(r, sb.from(q.params.t).insert(q.body).select().single()));
app.patch('/api/:t/:id', (q, r) => run(r, sb.from(q.params.t).update(q.body).eq('id', q.params.id).select().single()));
app.delete('/api/:t/:id', (q, r) => run(r, sb.from(q.params.t).delete().eq('id', q.params.id)));

app.listen(process.env.PORT || 4000, () => console.log('TutorConnect API running'));
