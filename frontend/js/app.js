
const S = [{ n: "Aarav Sharma", s: "p", f: "Paid" }, { n: "Diya Verma", s: "p", f: "Paid" }, { n: "Kabir Singh", s: "a", f: "Pending" }, { n: "Meera Nair", s: "p", f: "Pending" }, { n: "Rohan Gupta", s: "a", f: "Paid" }];
const rows = document.getElementById("rows");
function draw() {
    rows.innerHTML = S.map((x, i) => `<div class="row"><span class="n">${x.n}</span><button class="tg ${x.s}" data-a="${i}">${x.s === "p" ? "Present" : "Absent"}</button><button class="tg ${x.f === "Paid" ? "p" : "f"}" data-f="${i}">${x.f}</button></div>`).join("");
    document.getElementById("cnt").textContent = S.filter(x => x.s === "p").length + " of " + S.length + " present";
    document.getElementById("pend").textContent = S.filter(x => x.f === "Pending").length;
}
rows.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a !== undefined) { const x = S[b.dataset.a]; x.s = x.s === "p" ? "a" : "p" }
    if (b.dataset.f !== undefined) { const x = S[b.dataset.f]; x.f = x.f === "Paid" ? "Pending" : "Paid" } draw()
});
draw();
const $ = (q, r = document) => r.querySelector(q), esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CLS = ['Class 6–8', 'Class 9–10', 'Class 11–12'], SUB = ['Maths', 'Science', 'English', 'Physics', 'Chemistry', 'Hindi'], DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], KEY = 'tc2';
const sb = supabase.createClient(TC.SUPABASE_URL, TC.SUPABASE_KEY); let session = null, ready = false, TUTORS = [];
const blank = () => ({ batches: [], students: [], att: {}, homework: [], schedule: [], notes: [], me: null }); let D = blank();
async function api(path, opt = {}) { const h = { 'Content-Type': 'application/json' }; if (session) h.Authorization = 'Bearer ' + session.access_token; const res = await fetch(TC.API + path, { ...opt, headers: h }); const j = await res.json().catch(() => null); if (!res.ok) throw new Error(j && j.error || 'Request failed'); return j }
let sv; const save = () => { clearTimeout(sv); sv = setTimeout(() => session && api('/api/workspace', { method: 'PUT', body: JSON.stringify(D) }).catch(e => toast('Could not save: ' + e.message)), 400) };
async function loadWs() { try { const w = await api('/api/workspace'); D = Object.assign(blank(), w || {}); if (!D.me) D.me = { name: (session.user.email || 'Tutor').split('@')[0] } } catch (e) { toast(e.message) } }
const fromDb = t => ({ id: t.id, name: t.name, q: t.qualification || '', s: t.subject || '', c: t.class_range || '', l: t.location || '', fee: t.fee || '', ph: t.phone || '', bio: t.bio || '' });
const toDb = o => ({ name: o.name, qualification: o.q, subject: o.s, class_range: o.c, location: o.l, fee: o.fee, phone: o.ph, bio: o.bio });
let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 1800) };
const bOpts = () => D.batches.map(b => b.name), inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const field = x => { const o = typeof x.o === 'function' ? x.o() : x.o; return `<label>${x.l}${o ? `<select name="${x.n}" required>${o.map(v => `<option>${esc(v)}</option>`).join('')}</select>` : x.t === 'area' ? `<textarea name="${x.n}" rows="2" required></textarea>` : `<input name="${x.n}" type="${x.t || 'text'}" ${x.t === 'number' ? 'min="0"' : ''} ${x.opt ? '' : 'required'}>`}</label>` };
const form = (f, btn) => `<form class="frm" id="f">${f.map(field).join('')}<button class="btn">${btn || 'Add'}</button></form>`;
const CFG = {
    batches: { t: 'Batches', h: 'Create batch', b: 'Add batch', f: [{ n: 'name', l: 'Batch name' }, { n: 'cls', l: 'Class', o: CLS }, { n: 'subject', l: 'Subject', o: SUB }], fmt: i => `<b>${esc(i.name)}</b><small>${esc(i.cls)} · ${esc(i.subject)}</small>`, e: 'No batches yet. Add your first batch above.' },
    students: { t: 'Students', h: 'Add student', b: 'Add student', f: [{ n: 'name', l: 'Student name' }, { n: 'batch', l: 'Batch', o: bOpts }, { n: 'phone', l: 'Parent phone', t: 'tel' }, { n: 'fee', l: 'Monthly fee (₹)', t: 'number' }], fmt: i => `<b>${esc(i.name)}</b><small>${esc(i.batch)} · ${esc(i.phone)} · ${inr(i.fee)}</small>`, e: 'No students yet. Add a student above.' },
    homework: { t: 'Homework and materials', h: 'Post homework', b: 'Post homework', f: [{ n: 'title', l: 'Title' }, { n: 'batch', l: 'Batch', o: bOpts }, { n: 'due', l: 'Due date', t: 'date' }, { n: 'info', l: 'Details or link', t: 'area' }], fmt: i => `<b>${esc(i.title)}</b><small>${esc(i.batch)} · due ${esc(i.due)}</small><small>${esc(i.info)}</small>`, e: 'No homework posted yet.' },
    schedule: { t: 'Schedule', h: 'Add class', b: 'Add class', f: [{ n: 'batch', l: 'Batch', o: bOpts }, { n: 'day', l: 'Day', o: DAYS }, { n: 'time', l: 'Time', t: 'time' }], fmt: i => `<b>${esc(i.day)} · ${esc(i.time)}</b><small>${esc(i.batch)}</small>`, e: 'No classes scheduled yet.' },
    notes: { t: 'Announcements', h: 'Create announcement', b: 'Add announcement', f: [{ n: 'title', l: 'Title' }, { n: 'cat', l: 'Category', o: ['General', 'Exam', 'Holiday', 'Fee reminder'] }, { n: 'msg', l: 'Message', t: 'area' }], fmt: i => `<b>${esc(i.title)}<span class="bd">${esc(i.cat || 'General')}</span></b><small>${esc(i.d)}</small><small>${esc(i.msg)}</small>`, e: 'No announcements yet.' }
};
const IC = { overview: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>', batches: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>', students: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4.5a3.5 3.5 0 010 7M22 20c0-3-2-5-4-5.5"/>', attendance: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-6"/>', fees: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>', homework: '<path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z"/><path d="M8 8h6"/>', schedule: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', notes: '<path d="M3 11v3l12 5V6L3 11z"/><path d="M19 9v6"/>', settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>', bell: '<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', out: '<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>' };
const ic = n => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const TABS = [['overview', 'Overview', 'overview'], ['batches', 'Batches', 'batches'], ['students', 'Students', 'students'], ['attendance', 'Attendance', 'attendance'], ['fees', 'Fees', 'fees'], ['homework', 'Homework', 'homework'], ['schedule', 'Schedule', 'schedule'], ['notes', 'Announcements', 'notes'], ['settings', 'Settings', 'settings']];
const st = {};
function crud(k) {
    const c = CFG[k]; if (c.f.some(x => typeof x.o === 'function' && !x.o().length)) return '<div class="cd"><div class="empty">Add a batch first, then come back here.</div></div>';
    const q = (st.q || '').toLowerCase(), it = D[k].filter(i => !q || JSON.stringify(i).toLowerCase().includes(q)), del = i => `<button class="x" data-del="${i.id}" aria-label="Delete">${ic('trash')}</button>`;
    let body; if (!it.length) body = `<div class="empty">${q ? 'No results for your search.' : c.e}</div>`;
    else if (k === 'students') body = `<div class="tw"><table><thead><tr><th>Student</th><th>Batch</th><th>Parent phone</th><th>Fee</th><th>Status</th><th></th></tr></thead><tbody>${it.map(s => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.batch)}</td><td>${esc(s.phone)}</td><td>${inr(s.fee)}</td><td><span class="bd ${s.paid ? '' : 'wn'}">${s.paid ? 'Paid' : 'Pending'}</span></td><td class="r">${del(s)}</td></tr>`).join('')}</tbody></table></div>`;
    else body = `<div class="list">${it.map(i => `<div class="li"><div>${c.fmt(i)}</div>${del(i)}</div>`).join('')}</div>`;
    return `<section class="cd"><h2>${c.h}</h2>${form(c.f, c.b)}</section><section class="cd"><h2>${c.t} <span class="cnt">${it.length}</span></h2>${body}</section>`
}
function bindCrud(k) {
    const f = $('#f'); if (f) f.onsubmit = e => { e.preventDefault(); const o = Object.fromEntries(new FormData(f)); o.id = Date.now(); if (o.fee) o.fee = +o.fee; if (k === 'students') o.paid = false; if (k === 'notes') o.d = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); D[k].unshift(o); save(); toast('Added'); route() };
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { D[k] = D[k].filter(x => x.id != b.dataset.del); save(); toast('Removed'); route() })
}
function overview() {
    const me = D.me || { name: 'Tutor' }, h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const pend = D.students.filter(s => !s.paid).reduce((a, s) => a + s.fee, 0), np = D.students.filter(s => !s.paid).length; let pr = 0, tot = 0;
    for (const k in D.att) { const n = D.students.filter(s => s.batch === k.split('|')[1]).length, a = Object.values(D.att[k]).filter(v => v === false).length; tot += n; pr += Math.max(n - a, 0) }
    const col = D.students.filter(s => s.paid).reduce((a, s) => a + s.fee, 0), pc = col + pend ? Math.round(col / (col + pend) * 100) : 0; const L = (a, e) => a.length ? a.join('') : `<div class="empty">${e}</div>`;
    return `<section class="cd welcome"><div><h2>${g}, ${esc(me.name)}</h2><p>Here is what is happening in your classes today.</p></div><div class="qa"><a class="btn" href="#/dash/students">Add student</a><a class="btn ghost" href="#/dash/attendance">Mark attendance</a><a class="btn ghost" href="#/dash/notes">Post announcement</a></div></section>
<div class="stats"><div class="stat"><i class="si">${ic('students')}</i><span>Total students</span><b>${D.students.length}</b></div><div class="stat"><i class="si">${ic('batches')}</i><span>Active batches</span><b>${D.batches.length}</b></div><div class="stat"><i class="si">${ic('attendance')}</i><span>Attendance rate</span><b>${tot ? Math.round(pr / tot * 100) + '%' : 'No data'}</b></div><div class="stat"><i class="si">${ic('fees')}</i><span>Pending fees</span><b>${inr(pend)}</b><small>${np} students</small></div><div class="stat"><i class="si">${ic('schedule')}</i><span>Upcoming classes</span><b>${D.schedule.length}</b><small>This week</small></div></div>
<section class="cd"><h2>Fee collection</h2><div class="prog" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pc}%"></div></div><small class="pm">${inr(col)} collected of ${inr(col + pend)} · ${np} students pending</small></section>
<div class="cols"><section class="cd"><h2>Upcoming classes</h2><div class="list">${L(D.schedule.slice(0, 4).map(x => `<div class="li"><div><b>${esc(x.day)} · ${esc(x.time)}</b><small>${esc(x.batch)}</small></div></div>`), 'No classes scheduled yet.')}</div></section><section class="cd"><h2>Recent announcements</h2><div class="list">${L(D.notes.slice(0, 3).map(n => `<div class="li"><div><b>${esc(n.title)}</b><small>${esc(n.d)}</small></div></div>`), 'No announcements yet.')}</div></section></div>`
}
function settings() { const m = D.me || { name: 'Tutor' }; return `<section class="cd"><h2>Profile settings</h2><form class="frm" id="sf"><label>Display name<input name="name" value="${esc(m.name)}" required></label><label>Centre or class name<input name="centre" value="${esc(m.centre || '')}"></label><button class="btn">Save changes</button></form></section>` }
function attendance() {
    const bs = bOpts(); if (!bs.length) return '<div class="empty">Add a batch and students first.</div>';
    if (!bs.includes(st.ab)) st.ab = bs[0]; st.ad = st.ad || new Date().toISOString().slice(0, 10);
    const rec = D.att[st.ad + '|' + st.ab] || {}, l = D.students.filter(s => s.batch === st.ab), p = l.filter(s => rec[s.id] !== false).length;
    return `<div class="filters sm"><select id="ab" aria-label="Batch">${bs.map(x => `<option ${x === st.ab ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select><input id="ad" type="date" value="${st.ad}" aria-label="Date"></div>
<div class="reg"><div class="reg-h"><b>${esc(st.ab)}</b><small>${p} of ${l.length} present</small></div>${l.map(s => `<div class="row"><span class="n">${esc(s.name)}</span><button class="tg ${rec[s.id] === false ? 'a' : 'p'}" data-at="${s.id}">${rec[s.id] === false ? 'Absent' : 'Present'}</button></div>`).join('') || '<div class="empty">No students in this batch.</div>'}</div>`
}
function fees() {
    const c = D.students.filter(s => s.paid).reduce((a, s) => a + s.fee, 0), p = D.students.filter(s => !s.paid).reduce((a, s) => a + s.fee, 0);
    return `<div class="stats"><div class="stat"><b>${inr(c)}</b><span>Collected</span></div><div class="stat"><b>${inr(p)}</b><span>Pending</span></div></div><div class="list">${D.students.map(s => `<div class="li"><div><b>${esc(s.name)}</b><small>${esc(s.batch)} · ${inr(s.fee)}</small></div><button class="pill tg ${s.paid ? 'p' : 'f'}" data-fee="${s.id}">${s.paid ? 'Paid' : 'Pending'}</button></div>`).join('') || '<div class="empty">Add students to track fees.</div>'}</div>`
}
function dash(sub) {
    sub = sub || 'overview'; if (sub !== st.sub) { st.q = ''; st.sub = sub }
    const T = TABS.find(t => t[0] === sub) || TABS[0], me = D.me || { name: 'Tutor' };
    const body = sub === 'overview' ? overview() : sub === 'attendance' ? attendance() : sub === 'fees' ? fees() : sub === 'settings' ? settings() : CFG[sub] ? crud(sub) : overview();
    $('#app').innerHTML = `<div class="shell"><aside class="sb"><a class="brand" href="#/"><i>T</i>TutorConnect</a><nav aria-label="Dashboard">${TABS.map(t => `<a href="#/dash/${t[0]}" class="${t[0] === T[0] ? 'on' : ''}">${ic(t[2])}${t[1]}</a>`).join('')}</nav><div class="sbf"><div class="me"><span class="av sm">${esc(me.name[0])}</span><div><b>${esc(me.name)}</b><small>Tutor</small></div></div><a href="#/" id="lo">${ic('out')}Log out</a><a href="#/dash" id="reset">Clear my data</a></div></aside><div class="main"><header class="top"><button class="ib mn" id="mn" aria-label="Open menu">${ic('menu')}</button><h1>${T[1]}</h1>${CFG[sub] ? `<label class="srch">${ic('search')}<input id="q" type="search" placeholder="Search ${T[1].toLowerCase()}" value="${esc(st.q)}"></label>` : ''}<button class="ib" id="bell" aria-label="Notifications">${ic('bell')}<i class="dot"></i></button><span class="av sm">${esc(me.name[0])}</span></header><div class="content">${body}</div></div></div><div class="scrim" id="scrim"></div>`;
    if (CFG[sub]) bindCrud(sub);
    $('#lo').onclick = () => sb.auth.signOut(); $('#mn').onclick = () => document.body.classList.toggle('open'); $('#scrim').onclick = () => document.body.classList.remove('open');
    $('#bell').onclick = () => toast(D.notes[0] ? 'Latest: ' + D.notes[0].title : 'No new notifications');
    const q = $('#q'); if (q) q.oninput = () => { st.q = q.value; route(); const n = $('#q'); n.focus(); n.setSelectionRange(99, 99) };
    const sf = $('#sf'); if (sf) sf.onsubmit = e => { e.preventDefault(); D.me = Object.fromEntries(new FormData(sf)); save(); toast('Settings saved'); route() };
    $('#reset').onclick = e => { e.preventDefault(); if (confirm('Delete all your data? This cannot be undone.')) { D = blank(); save(); toast('Data reset'); route() } };
    const ab = $('#ab'); if (ab) { ab.onchange = () => { st.ab = ab.value; route() }; $('#ad').onchange = e => { st.ad = e.target.value || st.ad; route() } }
    document.querySelectorAll('[data-at]').forEach(b => b.onclick = () => { const k = st.ad + '|' + st.ab, r = D.att[k] = D.att[k] || {}; r[b.dataset.at] = r[b.dataset.at] === false; save(); route() });
    document.querySelectorAll('[data-fee]').forEach(b => b.onclick = () => { const s = D.students.find(x => x.id == b.dataset.fee); s.paid = !s.paid; save(); route() })
}
function find() {
    $('#app').innerHTML = `<div class="wrap pg"><h1>Find a trusted tutor</h1><p class="lead">Search by class, subject and location.</p><div class="filters"><select id="qc" aria-label="Class"><option value="">All classes</option>${CLS.map(x => `<option>${x}</option>`).join('')}</select><select id="qs" aria-label="Subject"><option value="">All subjects</option>${SUB.map(x => `<option>${x}</option>`).join('')}</select><input id="ql" type="search" placeholder="Search location" aria-label="Location"></div><div class="tutors" id="tl"></div></div>`;
    const L = () => {
        const q = $('#ql').value.trim().toLowerCase(), r = TUTORS.filter(t => (!$('#qc').value || t.c === $('#qc').value) && (!$('#qs').value || t.s === $('#qs').value) && (!q || t.l.toLowerCase().includes(q)));
        $('#tl').innerHTML = r.length ? r.map(t => `<div class="t"><div class="av">${esc(t.name[0])}</div><h3>${esc(t.name)}</h3><p>${esc(t.q)}</p><div class="tags"><span>${esc(t.s)}</span><span>${esc(t.c)}</span><span>${esc(t.l)}</span></div><p style="margin-top:14px"><button class="btn ghost" style="padding:8px 16px;font-size:14px" data-v="${t.id}">View profile</button></p></div>`).join('') : '<div class="empty">No tutors match yet. Try a different class, subject or location.</div>';
        document.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const t = TUTORS.find(x => x.id == b.dataset.v), m = $('#modal'); m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true"><div class="av">${esc(t.name[0])}</div><h3>${esc(t.name)}</h3><p>${esc(t.q)}</p><p>${esc(t.bio)}</p><div class="tags"><span>${esc(t.s)}</span><span>${esc(t.c)}</span><span>${esc(t.l)}</span><span>${esc(t.fee)}</span></div><p style="margin-top:18px"><a class="btn" href="tel:${esc(t.ph.replace(/\s/g, ''))}">Call ${esc(t.ph)}</a> <button class="btn ghost" id="mc">Close</button></p></div>`; m.hidden = false; $('#mc').onclick = () => m.hidden = true; m.onclick = e => { if (e.target === m) m.hidden = true } })
    };
    ['#qc', '#qs'].forEach(i => $(i).onchange = L); $('#ql').oninput = L; L(); api('/api/tutors').then(x => { TUTORS = x.map(fromDb); L() }).catch(() => { $('#tl').innerHTML = '<div class="empty">Could not load tutors. Is the backend running?</div>' })
}
function register() {
    $('#app').innerHTML = `<div class="wrap pg"><h1>Create your tutor profile</h1><p class="lead sm">Students and parents will find you in the tutor directory.</p>${form([{ n: 'name', l: 'Full name' }, { n: 'q', l: 'Qualification and experience' }, { n: 's', l: 'Main subject', o: SUB }, { n: 'c', l: 'Classes taught', o: CLS }, { n: 'l', l: 'Location' }, { n: 'fee', l: 'Fee (e.g. ₹1,000/month)' }, { n: 'ph', l: 'Phone', t: 'tel' }, { n: 'bio', l: 'About your teaching', t: 'area' }], 'Publish profile')}</div>`;
    $('#f').onsubmit = async e => { e.preventDefault(); const o = Object.fromEntries(new FormData($('#f'))); try { await api('/api/tutors', { method: 'POST', body: JSON.stringify(toDb(o)) }); toast('Profile published'); location.hash = '#/find' } catch (x) { toast(x.message) } }
}
function login(mode) {
    mode = mode === 'up' ? 'up' : 'in'; const inn = mode === 'in';
    $('#app').innerHTML = `<div class="authp"><form class="cd authc" id="lf"><a class="brand" href="#/"><i>T</i>TutorConnect</a><h2>${inn ? 'Log in to your account' : 'Create your account'}</h2><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Password<input name="password" type="password" minlength="6" required autocomplete="${inn ? 'current-password' : 'new-password'}"></label><button class="btn">${inn ? 'Log in' : 'Create account'}</button><p class="alt">${inn ? 'New here? <a href="#/login/up">Create an account</a>' : 'Already registered? <a href="#/login">Log in</a>'}</p></form></div>`;
    $('#lf').onsubmit = async e => { e.preventDefault(); const f = Object.fromEntries(new FormData($('#lf'))); const { data, error } = inn ? await sb.auth.signInWithPassword(f) : await sb.auth.signUp(f); if (error) return toast(error.message); if (!data.session) toast('Check your email to confirm, then log in') }
}
function route() {
    if (!ready) return; const h = location.hash, app = $('#app'), home = $('#home'); $('#modal').hidden = true; document.body.classList.remove('open'); document.body.classList.toggle('appmode', h.startsWith('#/dash'));
    const p = h.startsWith('#/') ? h.slice(2).split('/') : [''];
    document.querySelectorAll('.links a[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === p[0]));
    if (!p[0]) { home.hidden = false; app.hidden = true; const el = h.length > 1 && !h.startsWith('#/') ? $(h) : null; el ? el.scrollIntoView() : scrollTo(0, 0); return }
    if ((p[0] === 'dash' || p[0] === 'register') && !session) { location.hash = '#/login'; return } home.hidden = true; app.hidden = false;
    ({ dash: () => dash(p[1]), find, register, login: () => login(p[1]) }[p[0]] || (() => { location.hash = '#/' }))();
    if (h !== st.last) scrollTo(0, 0); st.last = h
}
addEventListener('hashchange', route);
sb.auth.onAuthStateChange(async (ev, s) => { session = s; if (s) await loadWs(); else D = blank(); ready = true; if (s && location.hash.startsWith('#/login')) location.hash = '#/dash'; else route() });
