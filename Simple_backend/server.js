const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// === Data Helpers ===
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// === Auth ===
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const data = readData();
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, name, role } = req.body;
    const data = readData();
    if (data.users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email exists' });
    }
    const user = { id: 'u' + Date.now(), email, password, name, role };
    data.users.push(user);
    writeData(data);
    const { password: p, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

// === Jobs ===
app.get('/api/jobs', (req, res) => {
    const data = readData();
    res.json(data.jobs.filter(j => j.status === 'open'));
});

app.get('/api/jobs/my/:clientId', (req, res) => {
    const data = readData();
    res.json(data.jobs.filter(j => j.clientId === req.params.clientId));
});

app.post('/api/jobs', (req, res) => {
    const data = readData();
    const job = { id: Date.now(), status: 'open', ...req.body };
    data.jobs.unshift(job);
    writeData(data);
    res.json({ success: true, job });
});

app.patch('/api/jobs/:id', (req, res) => {
    const data = readData();
    const job = data.jobs.find(j => j.id === +req.params.id);
    if (!job) return res.status(404).json({ success: false });

    // If completing job, transfer payment
    if (req.body.status === 'completed' && job.status !== 'completed') {
        const proposal = data.proposals.find(p => p.jobId === job.id && p.status === 'accepted');
        if (proposal) {
            const clientId = job.clientId;
            const freelancerId = proposal.freelancerId;
            const amount = proposal.bidAmount;

            // Init wallets if needed
            if (!data.wallets[clientId]) data.wallets[clientId] = { balance: 0, transactions: [] };
            if (!data.wallets[freelancerId]) data.wallets[freelancerId] = { balance: 0, transactions: [] };

            // Deduct from client
            data.wallets[clientId].balance -= amount;
            data.wallets[clientId].transactions.push({ type: 'debit', amount, desc: 'Payment for: ' + job.title, date: new Date().toISOString() });

            // Add to freelancer
            data.wallets[freelancerId].balance += amount;
            data.wallets[freelancerId].transactions.push({ type: 'credit', amount, desc: 'Earned from: ' + job.title, date: new Date().toISOString() });
        }
    }

    Object.assign(job, req.body);
    writeData(data);
    res.json({ success: true, job });
});

// === Proposals ===
app.get('/api/proposals', (req, res) => {
    res.json(readData().proposals);
});

app.get('/api/proposals/freelancer/:id', (req, res) => {
    res.json(readData().proposals.filter(p => p.freelancerId === req.params.id));
});

app.get('/api/proposals/job/:id', (req, res) => {
    res.json(readData().proposals.filter(p => p.jobId === +req.params.id));
});

app.post('/api/proposals', (req, res) => {
    const data = readData();
    const proposal = { id: Date.now(), status: 'pending', ...req.body };
    data.proposals.push(proposal);
    writeData(data);
    res.json({ success: true, proposal });
});

app.patch('/api/proposals/:id', (req, res) => {
    const data = readData();
    const p = data.proposals.find(x => x.id === +req.params.id);
    if (p) {
        Object.assign(p, req.body);
        if (req.body.status === 'accepted') {
            data.proposals.filter(x => x.jobId === p.jobId && x.id !== p.id).forEach(x => x.status = 'rejected');
            const job = data.jobs.find(j => j.id === p.jobId);
            if (job) job.status = 'in-progress';
        }
        writeData(data);
        res.json({ success: true, proposal: p });
    } else {
        res.status(404).json({ success: false });
    }
});

// === Verifications ===
app.get('/api/verifications', (req, res) => {
    res.json(readData().verifications);
});

app.get('/api/verifications/user/:id', (req, res) => {
    res.json(readData().verifications.find(v => v.userId === req.params.id) || null);
});

app.get('/api/verifications/pending', (req, res) => {
    res.json(readData().verifications.filter(v => v.status === 'pending'));
});

app.post('/api/verifications', (req, res) => {
    const data = readData();
    const v = { id: Date.now(), status: 'pending', ...req.body };
    data.verifications.push(v);
    writeData(data);
    res.json({ success: true, verification: v });
});

app.patch('/api/verifications/:id', (req, res) => {
    const data = readData();
    const v = data.verifications.find(x => x.id === +req.params.id);
    if (v) {
        Object.assign(v, req.body);
        writeData(data);
        res.json({ success: true, verification: v });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/verifications/user/:id', (req, res) => {
    const data = readData();
    data.verifications = data.verifications.filter(v => v.userId !== req.params.id);
    writeData(data);
    res.json({ success: true });
});

// === Wallet ===
app.get('/api/wallet/:userId', (req, res) => {
    const data = readData();
    if (!data.wallets[req.params.userId]) {
        data.wallets[req.params.userId] = { balance: 0, transactions: [] };
        writeData(data);
    }
    res.json(data.wallets[req.params.userId]);
});

app.post('/api/wallet/:userId/transaction', (req, res) => {
    const data = readData();
    const { userId } = req.params;
    const { type, amount, desc } = req.body;

    if (!data.wallets[userId]) data.wallets[userId] = { balance: 0, transactions: [] };

    if (type === 'credit') data.wallets[userId].balance += amount;
    else data.wallets[userId].balance -= amount;

    data.wallets[userId].transactions.push({ type, amount, desc, date: new Date().toISOString() });
    writeData(data);
    res.json({ success: true, wallet: data.wallets[userId] });
});

// === Messages ===
app.get('/api/messages/:userId', (req, res) => {
    const msgs = readData().messages;
    res.json(msgs.filter(m => m.from === req.params.userId || m.to === req.params.userId));
});

app.post('/api/messages', (req, res) => {
    const data = readData();
    const msg = { id: Date.now(), time: new Date().toISOString(), ...req.body };
    data.messages.push(msg);
    writeData(data);
    res.json({ success: true, message: msg });
});

// === Reviews ===
app.get('/api/reviews', (req, res) => {
    res.json(readData().reviews);
});

app.get('/api/reviews/freelancer/:id', (req, res) => {
    res.json(readData().reviews.filter(r => r.freelancerId === req.params.id));
});

app.post('/api/reviews', (req, res) => {
    const data = readData();
    const review = { id: Date.now(), date: new Date().toISOString(), ...req.body };
    data.reviews.push(review);
    writeData(data);
    res.json({ success: true, review });
});

// === Stats (Admin) ===
app.get('/api/stats', (req, res) => {
    const data = readData();
    res.json({
        jobs: data.jobs.length,
        proposals: data.proposals.length,
        users: data.users.length,
        pendingVerifications: data.verifications.filter(v => v.status === 'pending').length
    });
});

// === Start Server ===
app.listen(PORT, () => {
    console.log(`🚀 Sho8la API running at http://localhost:${PORT}`);
});
