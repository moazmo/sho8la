// === Config ===
var API_URL = 'http://localhost:3000/api';
var UNIVERSITIES = ['Cairo University', 'Ain Shams', 'AUC', 'GUC', 'FCAIH'];

// === Helpers ===
function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }
function getUser() { try { return JSON.parse(sessionStorage.getItem('user')); } catch (e) { return null; } }
function setUser(user) { sessionStorage.setItem('user', JSON.stringify(user)); }
function clearUser() { sessionStorage.removeItem('user'); }
function isRole(r) { var u = getUser(); return u && u.role === r; }

async function api(endpoint, options) {
    options = options || {};
    try {
        var res = await fetch(API_URL + endpoint, {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        return await res.json();
    } catch (e) { console.error('API Error:', e); return null; }
}

// === Init ===
function init() { updateUI(); }

// === UI ===
function updateUI() {
    var u = getUser(), nav = $('.nav-links'), auth = $('#navAuth');
    if (!nav || !auth) return;

    if (u) {
        var links = { freelancer: 'jobs:Find Work,proposals:My Proposals,messages:Messages,wallet:Wallet', client: 'my-jobs:My Jobs,post-job:Post Job,messages:Messages,wallet:Wallet', admin: 'admin:Dashboard' };
        nav.innerHTML = (links[u.role] || '').split(',').map(function (l) { var p = l.split(':'); return '<a onclick="navigate(\'' + p[0] + '\')">' + p[1] + '</a>'; }).join('');
        auth.innerHTML = '<span class="user-name">' + u.name + '</span><button class="btn-text" onclick="navigate(\'profile\')">Profile</button><button class="btn-text" onclick="logout()">Logout</button>';
        var hero = $('#home-page .hero-btns'); if (hero) hero.classList.add('hidden');
    } else {
        nav.innerHTML = '<a onclick="navigate(\'jobs\')">Find Work</a><a onclick="navigate(\'post-job\')">Post Job</a>';
        auth.innerHTML = '<button class="btn-text" onclick="openAuth(true)">Login</button><button class="btn btn-small" onclick="openAuth(false)">Sign Up</button>';
        var hero = $('#home-page .hero-btns'); if (hero) hero.classList.remove('hidden');
    }
}

// === Navigation ===
function navigate(page) {
    $$('.page').forEach(function (p) { p.classList.remove('active'); });
    var el = $('#' + page + '-page'); if (el) el.classList.add('active');
    window.scrollTo(0, 0);
    var fn = { jobs: renderJobs, 'my-jobs': renderMyJobs, proposals: renderProposals, profile: renderProfile, verify: renderVerify, admin: renderAdmin, wallet: renderWallet, messages: renderMessages };
    if (fn[page]) fn[page]();
}

// === Auth ===
var isLogin = true;
function openAuth(login) {
    isLogin = login;
    $('#authTitle').textContent = login ? 'Login' : 'Create Account';
    $('#authBtn').textContent = login ? 'Login' : 'Sign Up';
    $('#nameGroup').className = 'form-group' + (login ? ' hidden' : '');
    $('#roleGroup').className = 'form-group' + (login ? ' hidden' : '');
    $('#authSwitch').textContent = login ? "Don't have an account? Sign Up" : 'Have an account? Login';
    $('#authForm').reset();
    openModal('authModal');
}
function toggleAuthMode() { openAuth(!isLogin); }

async function handleAuth(e) {
    e.preventDefault();
    var f = e.target, email = f.email.value, pass = f.password.value;
    if (isLogin) {
        var res = await api('/auth/login', { method: 'POST', body: { email: email, password: pass } });
        if (res && res.success) {
            setUser(res.user); closeModal('authModal'); updateUI();
            navigate(res.user.role === 'admin' ? 'admin' : res.user.role === 'client' ? 'my-jobs' : 'jobs');
        } else { alert('Invalid credentials'); }
    } else {
        var res = await api('/auth/register', { method: 'POST', body: { email: email, password: pass, name: f.name.value, role: f.role.value } });
        if (res && res.success) {
            setUser(res.user); closeModal('authModal'); updateUI();
            navigate(res.user.role === 'client' ? 'my-jobs' : 'jobs');
        } else { alert(res ? res.message : 'Registration failed'); }
    }
}
function logout() { clearUser(); updateUI(); navigate('home'); }

// === Jobs ===
async function renderJobs() {
    var jobs = await api('/jobs') || [];
    var q = ($('#searchInput') || {}).value || '', cat = ($('#categoryFilter') || {}).value || '';
    var list = $('#jobsList'); if (!list) return;
    var u = getUser();
    var proposals = u ? await api('/proposals/freelancer/' + u.id) || [] : [];

    var filtered = jobs.filter(function (j) { return (!q || j.title.toLowerCase().includes(q.toLowerCase())) && (!cat || j.category === cat); });
    list.innerHTML = filtered.length ? filtered.map(function (j) {
        var applied = proposals.some(function (p) { return p.jobId === j.id; });
        var btn = applied ? '<span class="status-applied">✓ Applied</span>' : (!u || u.role === 'freelancer') ? '<button class="btn btn-small" onclick="openProposalModal(' + j.id + ')">Apply</button>' : '';
        return '<div class="card"><h3>' + j.title + '</h3><div class="card-meta">by ' + j.clientName + '</div><p>' + j.description + '</p><div class="tags">' + j.skills.map(function (s) { return '<span class="tag">' + s + '</span>'; }).join('') + '</div><div class="card-footer"><span class="card-budget">' + j.budget + ' EGP</span>' + btn + '</div></div>';
    }).join('') : '<div class="empty-state"><p>No jobs found</p></div>';
}

async function renderMyJobs() {
    var u = getUser(), list = $('#myJobsList'); if (!list || !u) return;
    var jobs = await api('/jobs/my/' + u.id) || [];
    var allProposals = await api('/proposals') || [];
    var reviews = await api('/reviews') || [];

    list.innerHTML = jobs.length ? jobs.map(function (j) {
        var jp = allProposals.filter(function (p) { return p.jobId === j.id; });
        var hasReview = reviews.some(function (r) { return r.jobId === j.id; });

        var ph = jp.length ? '<div class="proposals-preview">' + jp.map(function (p) {
            var act = '';
            if (p.status === 'pending') {
                act = '<button class="btn btn-small" onclick="event.stopPropagation();updateProposal(' + p.id + ',\'accepted\')">Accept</button><button class="btn btn-small btn-outline" onclick="event.stopPropagation();updateProposal(' + p.id + ',\'rejected\')">Reject</button>';
            } else if (p.status === 'accepted') {
                if (j.status === 'completed') {
                    act = '<span class="status-badge completed">✓ Completed</span>';
                    if (!hasReview) act += '<button class="btn btn-small" onclick="event.stopPropagation();openReviewModal(' + j.id + ',\'' + p.freelancerId + '\',\'' + p.freelancerName + '\')">Review</button>';
                } else {
                    act = '<span class="status-badge in-progress">In Progress</span>';
                    act += '<button class="btn btn-small" onclick="event.stopPropagation();startChat(\'' + p.freelancerId + '\',\'' + p.freelancerName + '\')">💬 Chat</button>';
                    act += '<button class="btn btn-small btn-success" onclick="event.stopPropagation();completeJob(' + j.id + ',' + p.bidAmount + ')">✓ Complete</button>';
                }
            } else {
                act = '<span class="status-badge ' + p.status + '">' + p.status + '</span>';
            }
            return '<div class="mini-proposal"><span><b>' + p.freelancerName + '</b> - ' + p.bidAmount + ' EGP</span><div class="proposal-actions">' + act + '</div></div>';
        }).join('') + '</div>' : '';

        var statusLabel = j.status === 'completed' ? '✓ Completed' : j.status === 'in-progress' ? '🔄 In Progress' : '🟢 Open';
        return '<div class="card"><div class="card-header"><h3>' + j.title + '</h3><span class="status-badge ' + j.status + '">' + statusLabel + '</span></div><p>' + j.description + '</p><div class="card-footer"><span class="card-budget">' + j.budget + ' EGP</span><span>' + jp.length + ' proposals</span></div>' + ph + '</div>';
    }).join('') : '<div class="empty-state"><p>No jobs yet</p><button class="btn" onclick="navigate(\'post-job\')">Post Job</button></div>';
}

async function completeJob(jobId, amount) {
    if (!confirm('Complete this job and pay ' + amount + ' EGP to the freelancer?')) return;
    await api('/jobs/' + jobId, { method: 'PATCH', body: { status: 'completed' } });
    alert('🎉 Job completed! ' + amount + ' EGP transferred to freelancer.');
    renderMyJobs();
}

async function postJob(e) {
    e.preventDefault(); var u = getUser();
    if (!u) return openAuth(false);
    if (u.role !== 'client') return alert('Only clients can post');
    var f = e.target, skills = f.skills.value ? f.skills.value.split(',').map(function (s) { return s.trim(); }) : [];
    await api('/jobs', { method: 'POST', body: { clientId: u.id, clientName: u.name, title: f.title.value, description: f.description.value, category: f.category.value, budget: +f.budget.value, skills: skills } });
    f.reset(); alert('Job posted!'); navigate('my-jobs');
}

// === Proposals ===
function openProposalModal(jobId) {
    if (!getUser()) return openAuth(true);
    if (isRole('client') || isRole('admin')) return alert('Freelancers only');
    $('#proposalForm').reset(); $('[name="jobId"]').value = jobId; openModal('proposalModal');
}

async function submitProposal(e) {
    e.preventDefault(); var u = getUser(); if (!u || u.role !== 'freelancer') return;
    var f = e.target, jobId = +f.jobId.value;
    var jobs = await api('/jobs') || [];
    var job = jobs.find(function (j) { return j.id === jobId; });
    await api('/proposals', { method: 'POST', body: { jobId: jobId, jobTitle: job ? job.title : '', clientId: job ? job.clientId : '', freelancerId: u.id, freelancerName: u.name, bidAmount: +f.bidAmount.value, deliveryDays: +f.deliveryDays.value, coverLetter: f.coverLetter.value } });
    closeModal('proposalModal'); alert('Proposal sent!'); renderJobs();
}

async function renderProposals() {
    var u = getUser(), list = $('#proposalsList'); if (!list) return;
    if (!u) return list.innerHTML = '<div class="empty-state"><p>Please login</p></div>';
    var proposals = await api('/proposals/freelancer/' + u.id) || [];

    list.innerHTML = proposals.length ? proposals.map(function (p) {
        var statusIcon = p.status === 'accepted' ? '✓' : p.status === 'rejected' ? '✗' : '⏳';
        var chatBtn = p.status === 'accepted' ? '<button class="btn btn-small" onclick="startChat(\'' + p.clientId + '\',\'Client\')">💬 Chat</button>' : '';
        return '<div class="proposal-item"><h3>' + p.jobTitle + '</h3><div class="proposal-meta"><span>💰 ' + p.bidAmount + ' EGP</span><span>📅 ' + p.deliveryDays + ' days</span></div><div class="proposal-actions"><span class="status-badge ' + p.status + '">' + statusIcon + ' ' + p.status + '</span>' + chatBtn + '</div></div>';
    }).join('') : '<div class="empty-state"><p>No proposals yet</p><button class="btn" onclick="navigate(\'jobs\')">Browse Jobs</button></div>';
}

async function updateProposal(id, status) {
    await api('/proposals/' + id, { method: 'PATCH', body: { status: status } });
    renderMyJobs();
}

// === Messages ===
var activeChat = null;
var chatRefreshInterval = null;

async function renderMessages() {
    var u = getUser(), c = $('#messagesContent'); if (!c || !u) return;
    var msgs = await api('/messages/' + u.id) || [];
    var convos = {};

    msgs.forEach(function (m) {
        var otherId = m.from === u.id ? m.to : m.from;
        var otherName = m.from === u.id ? m.toName : m.fromName;
        if (!convos[otherId]) convos[otherId] = { id: otherId, name: otherName, last: m };
        else if (new Date(m.time) > new Date(convos[otherId].last.time)) convos[otherId].last = m;
    });

    var keys = Object.keys(convos);
    keys.sort(function (a, b) { return new Date(convos[b].last.time) - new Date(convos[a].last.time); });

    var convoList = keys.length ? keys.map(function (k) {
        var co = convos[k];
        var isActive = activeChat && activeChat.id === k;
        var preview = co.last.text.length > 25 ? co.last.text.substring(0, 25) + '...' : co.last.text;
        return '<div class="conversation-item' + (isActive ? ' active' : '') + '" onclick="openChat(\'' + co.id + '\',\'' + co.name + '\')"><div class="convo-header"><h4>' + co.name + '</h4></div><p>' + preview + '</p></div>';
    }).join('') : '<div class="empty-state"><p>No messages yet</p></div>';

    var chatArea = activeChat ? '<div class="chat-header"><span>' + activeChat.name + '</span><button class="btn-text" onclick="closeChat()">✕</button></div><div class="chat-messages" id="chatMessages"></div><form class="chat-input" onsubmit="sendMessage(event)"><input name="msg" placeholder="Type a message..." autocomplete="off" required><button class="btn">Send</button></form>' : '<div class="chat-placeholder"><p>👈 Select a conversation</p></div>';

    c.innerHTML = '<div class="messages-layout"><div class="conversations-list"><div class="convo-header-title">Conversations</div>' + convoList + '</div><div class="chat-area">' + chatArea + '</div></div>';
    if (activeChat) loadChatMessages();
}

function startChat(userId, userName) {
    activeChat = { id: userId, name: userName };
    navigate('messages');
}

function openChat(userId, userName) {
    activeChat = { id: userId, name: userName };
    renderMessages();
    startChatRefresh();
}

function closeChat() {
    activeChat = null; stopChatRefresh(); renderMessages();
}

function startChatRefresh() {
    stopChatRefresh();
    chatRefreshInterval = setInterval(function () { if (activeChat) loadChatMessages(); }, 3000);
}

function stopChatRefresh() {
    if (chatRefreshInterval) { clearInterval(chatRefreshInterval); chatRefreshInterval = null; }
}

async function loadChatMessages() {
    var u = getUser(), c = $('#chatMessages'); if (!c || !activeChat) return;
    var msgs = await api('/messages/' + u.id) || [];
    msgs = msgs.filter(function (m) { return (m.from === u.id && m.to === activeChat.id) || (m.from === activeChat.id && m.to === u.id); });
    msgs.sort(function (a, b) { return new Date(a.time) - new Date(b.time); });

    c.innerHTML = msgs.length ? msgs.map(function (m) {
        var isMine = m.from === u.id;
        var time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return '<div class="message ' + (isMine ? 'sent' : 'received') + '"><p>' + m.text + '</p><span class="message-time">' + time + '</span></div>';
    }).join('') : '<div class="chat-empty"><p>No messages yet. Say hi! 👋</p></div>';
    c.scrollTop = c.scrollHeight;
}

async function sendMessage(e) {
    e.preventDefault(); if (!activeChat) return;
    var u = getUser(), input = e.target.msg, text = input.value.trim();
    if (!text) return;
    await api('/messages', { method: 'POST', body: { from: u.id, fromName: u.name, to: activeChat.id, toName: activeChat.name, text: text } });
    input.value = ''; loadChatMessages();
}

// === Reviews ===
function openReviewModal(jobId, freelancerId, freelancerName) {
    $('[name="reviewJobId"]').value = jobId;
    $('[name="reviewFreelancerId"]').value = freelancerId;
    $('#reviewFreelancerName').textContent = freelancerName;
    openModal('reviewModal');
}

async function submitReview(e) {
    e.preventDefault(); var u = getUser(), f = e.target;
    await api('/reviews', { method: 'POST', body: { jobId: +f.reviewJobId.value, freelancerId: f.reviewFreelancerId.value, clientId: u.id, rating: +f.rating.value, comment: f.comment.value } });
    closeModal('reviewModal'); alert('⭐ Review submitted!'); renderMyJobs();
}

// === Verification ===
async function renderVerify() {
    var u = getUser(), c = $('#verifyContent'); if (!c || !u) return;
    var v = await api('/verifications/user/' + u.id);
    if (v) {
        var cls = v.status === 'verified' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning';
        var icon = v.status === 'verified' ? '✓' : v.status === 'rejected' ? '✗' : '⏳';
        var retry = v.status === 'rejected' ? '<button class="btn" onclick="resetVerify()">Try Again</button>' : '';
        c.innerHTML = '<div class="verify-card ' + cls + '"><h3>' + icon + ' ' + v.status.charAt(0).toUpperCase() + v.status.slice(1) + '</h3><p><b>University:</b> ' + v.university + '</p><p><b>ID:</b> ' + v.studentId + '</p>' + retry + '</div>';
    } else {
        var opts = UNIVERSITIES.map(function (u) { return '<option>' + u + '</option>'; }).join('');
        c.innerHTML = '<form class="form-card" onsubmit="submitVerify(event)"><div class="form-group"><label>University</label><select name="university" required><option value="">Select</option>' + opts + '</select></div><div class="form-group"><label>Student ID</label><input name="studentId" required></div><div class="form-group"><label>ID Photo</label><input type="file" name="doc" accept="image/*" required></div><button class="btn btn-full">Submit</button></form>';
    }
}

async function submitVerify(e) {
    e.preventDefault(); var u = getUser(), f = e.target;
    await api('/verifications', { method: 'POST', body: { userId: u.id, userName: u.name, userEmail: u.email, university: f.university.value, studentId: f.studentId.value } });
    alert('Submitted! Admin will review soon.'); renderVerify();
}

async function resetVerify() {
    var u = getUser();
    await api('/verifications/user/' + u.id, { method: 'DELETE' });
    renderVerify();
}

// === Wallet ===
async function renderWallet() {
    var u = getUser(), c = $('#walletContent'); if (!c || !u) return;
    var w = await api('/wallet/' + u.id) || { balance: 0, transactions: [] };
    var btn = u.role === 'client' ? '<button class="btn" onclick="openModal(\'addFundsModal\')">+ Add Funds</button>' : '<button class="btn" onclick="withdraw()">💸 Withdraw</button>';

    var txs = w.transactions.length ? w.transactions.slice().reverse().slice(0, 10).map(function (t) {
        var icon = t.type === 'credit' ? '↓' : '↑';
        var sign = t.type === 'credit' ? '+' : '-';
        return '<div class="transaction-item"><div class="transaction-info"><span class="transaction-type">' + icon + ' ' + t.desc + '</span><span class="transaction-date">' + new Date(t.date).toLocaleDateString() + '</span></div><span class="transaction-amount ' + t.type + '">' + sign + t.amount + ' EGP</span></div>';
    }).join('') : '<div class="empty-state"><p>No transactions</p></div>';

    c.innerHTML = '<div class="wallet-grid"><div class="wallet-balance"><div class="balance-amount">' + w.balance + ' EGP</div><div class="balance-label">Balance</div></div><div class="wallet-actions">' + btn + '</div></div><h3 class="section-title">History</h3><div class="transactions-list">' + txs + '</div>';
}

async function addFunds(e) {
    e.preventDefault(); var amt = +$('[name="fundAmount"]').value; if (amt < 100) return alert('Min 100 EGP');
    var u = getUser();
    await api('/wallet/' + u.id + '/transaction', { method: 'POST', body: { type: 'credit', amount: amt, desc: 'Added funds' } });
    closeModal('addFundsModal'); alert(amt + ' EGP added!'); renderWallet();
}

async function withdraw() {
    var u = getUser();
    var w = await api('/wallet/' + u.id) || { balance: 0 };
    if (w.balance < 100) return alert('Min 100 EGP to withdraw');
    var amt = prompt('Amount (max ' + w.balance + '):');
    if (!amt || +amt < 100 || +amt > w.balance) return alert('Invalid');
    await api('/wallet/' + u.id + '/transaction', { method: 'POST', body: { type: 'debit', amount: +amt, desc: 'Withdrawal' } });
    alert('Withdrawn!'); renderWallet();
}

// === Admin ===
async function renderAdmin() {
    if (!isRole('admin')) return navigate('home');
    var stats = await api('/stats') || {};
    var pending = await api('/verifications/pending') || [];

    $('#adminStats').innerHTML = '<div class="stat-card"><div class="stat-num">' + (stats.jobs || 0) + '</div><div class="stat-label">Jobs</div></div><div class="stat-card"><div class="stat-num">' + (stats.proposals || 0) + '</div><div class="stat-label">Proposals</div></div><div class="stat-card"><div class="stat-num">' + (stats.users || 0) + '</div><div class="stat-label">Users</div></div><div class="stat-card"><div class="stat-num">' + pending.length + '</div><div class="stat-label">Pending</div></div>';

    $('#pendingVerifications').innerHTML = pending.length ? pending.map(function (v) {
        return '<div class="verify-item"><div class="verify-info"><h4>' + v.userName + '</h4><p>' + v.userEmail + '</p><p><b>' + v.university + '</b> - ' + v.studentId + '</p></div><div class="verify-actions"><button class="btn btn-small btn-success" onclick="verifyAction(' + v.id + ',\'verified\')">✓</button><button class="btn btn-small btn-danger" onclick="verifyAction(' + v.id + ',\'rejected\')">✗</button></div></div>';
    }).join('') : '<div class="empty-state"><p>No pending</p></div>';
}

async function verifyAction(id, status) {
    await api('/verifications/' + id, { method: 'PATCH', body: { status: status } });
    renderAdmin();
}

// === Profile ===
async function renderProfile() {
    var u = getUser(), c = $('#profileContent'); if (!c || !u) return;
    var v = await api('/verifications/user/' + u.id);
    var verified = v && v.status === 'verified', badge = verified ? '<span class="verified-badge">✓ Verified</span>' : '';
    var reviews = await api('/reviews/freelancer/' + u.id) || [];
    var rating = reviews.length ? { avg: (reviews.reduce(function (a, r) { return a + r.rating; }, 0) / reviews.length).toFixed(1), count: reviews.length } : null;
    var ratingTxt = u.role === 'freelancer' && rating ? '<p>⭐ ' + rating.avg + ' (' + rating.count + ' reviews)</p>' : '';
    var w = await api('/wallet/' + u.id) || { balance: 0 };
    var walletTxt = u.role !== 'admin' ? '<p>💰 ' + w.balance + ' EGP</p>' : '';
    var verifyBtn = u.role === 'freelancer' && !verified ? '<div class="profile-card"><h3>Get Verified</h3><button class="btn" onclick="navigate(\'verify\')">Verify Now</button></div>' : '';

    c.innerHTML = '<div class="profile-card"><div class="profile-header"><div class="profile-info"><h2>' + u.name + '</h2><p>' + u.email + '</p><p>Role: <b>' + u.role + '</b></p></div>' + badge + '</div></div><div class="profile-card"><h3>Stats</h3>' + ratingTxt + walletTxt + '</div>' + verifyBtn;
}

// === Contact ===
function submitContact(e) { e.preventDefault(); alert('Thank you!'); e.target.reset(); }

// === Modals ===
function openModal(id) { var m = $('#' + id); if (m) m.classList.add('active'); }
function closeModal(id) { var m = $('#' + id); if (m) m.classList.remove('active'); }
window.onclick = function (e) { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); };

// === Start ===
document.addEventListener('DOMContentLoaded', init);
