// Local Storage Keys
const STORAGE_USER = 'sho8la_user';
const STORAGE_JOBS = 'sho8la_jobs';
const STORAGE_PROFILES = 'sho8la_profiles';
const STORAGE_VERIFICATION = 'sho8la_verification';

// Sample Jobs Data
const defaultJobs = [
    { id: 1, title: 'Build E-commerce Website', client: 'Ahmed M.', desc: 'Full-stack e-commerce platform with payment integration.', category: 'web', budget: '500-2000', tags: ['React', 'Node.js', 'MongoDB'] },
    { id: 2, title: 'Mobile App UI Design', client: 'Sara K.', desc: 'Design user interface for a student study planning app.', category: 'design', budget: '300-1000', tags: ['Figma', 'UI/UX'] },
    { id: 3, title: 'Data Analysis Project', client: 'Dr. Hassan', desc: 'Analyze dataset and create visualizations using Python.', category: 'data', budget: '400-1500', tags: ['Python', 'Data Analysis'] },
    { id: 4, title: 'Write Technical Blog Posts', client: 'Tech Magazine', desc: 'Write 5 in-depth blog posts about web development trends.', category: 'writing', budget: '250-750', tags: ['Writing', 'Tech'] },
    { id: 5, title: 'Database Optimization', client: 'Dev Team', desc: 'Optimize slow SQL queries and improve database performance.', category: 'web', budget: '600-2000', tags: ['SQL', 'Database'] },
    { id: 6, title: 'SEO Audit & Strategy', client: 'Marketing Co.', desc: 'Perform SEO audit and create optimization strategy for website.', category: 'writing', budget: '350-1200', tags: ['SEO', 'Marketing'] }
];

// Initialize App
function initApp() {
    loadJobs();
    updateAuthUI();
    renderJobs();
}

// Navigation
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(page + '-page');
    if (pageEl) {
        pageEl.classList.add('active');
        
        if (page === 'jobs') renderJobs();
        if (page === 'profile') renderProfile();
        if (page === 'verify') renderVerification();
    }
}

// Auth Functions
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    const user = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'freelancer',
        joinDate: new Date().toLocaleDateString(),
        isVerified: false
    };
    
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    updateAuthUI();
    toggleLoginModal();
    form.reset();
    alert('Login successful! Welcome ' + user.name);
}

function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const role = form.querySelector('select').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    const user = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        role: role,
        joinDate: new Date().toLocaleDateString(),
        isVerified: false
    };
    
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    updateAuthUI();
    toggleRegisterModal();
    form.reset();
    alert('Account created successfully! Welcome to Sho8la');
}

function logout() {
    localStorage.removeItem(STORAGE_USER);
    updateAuthUI();
    navigate('home');
    alert('Logged out successfully');
}

function updateAuthUI() {
    const user = getUser();
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    
    if (user) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userDisplay.textContent = user.name;
        userDisplay.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userDisplay.style.display = 'none';
    }
}

function getUser() {
    const userData = localStorage.getItem(STORAGE_USER);
    return userData ? JSON.parse(userData) : null;
}

// Jobs Functions
function loadJobs() {
    const stored = localStorage.getItem(STORAGE_JOBS);
    if (!stored) {
        localStorage.setItem(STORAGE_JOBS, JSON.stringify(defaultJobs));
    }
}

function getJobs() {
    const stored = localStorage.getItem(STORAGE_JOBS);
    return stored ? JSON.parse(stored) : defaultJobs;
}

function renderJobs(filter = '') {
    const jobs = getJobs();
    const searchTerm = document.getElementById('jobSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('jobFilter')?.value || '';
    
    const filtered = jobs.filter(job => {
        const matchSearch = job.title.toLowerCase().includes(searchTerm) || 
                          job.desc.toLowerCase().includes(searchTerm);
        const matchCategory = !category || job.category === category;
        return matchSearch && matchCategory;
    });
    
    const jobsList = document.getElementById('jobsList');
    if (!jobsList) return;
    
    jobsList.innerHTML = filtered.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p class="job-client">Posted by ${job.client}</p>
            <p class="job-desc">${job.desc}</p>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="job-footer">
                <span class="job-budget">${job.budget} EGP</span>
                <button class="btn-small" onclick="applyJob(${job.id})">Apply Now</button>
            </div>
        </div>
    `).join('');
}

function filterJobs() {
    renderJobs();
}

function applyJob(jobId) {
    const user = getUser();
    if (!user) {
        alert('Please login to apply for jobs');
        toggleLoginModal();
        return;
    }
    
    alert('Application sent! We will notify you when the client responds.');
}

function postJob(event) {
    event.preventDefault();
    const user = getUser();
    
    if (!user) {
        alert('Please login to post a job');
        toggleLoginModal();
        return;
    }
    
    if (user.role !== 'client') {
        alert('Only clients can post jobs. Switch to client role.');
        return;
    }
    
    const form = event.target;
    const title = form.querySelector('input[type="text"]').value;
    const desc = form.querySelector('textarea').value;
    const category = form.querySelectorAll('select')[0].value;
    const budget = form.querySelector('input[type="number"]').value;
    const skills = form.querySelector('input[placeholder*="comma"]')?.value || '';
    
    const newJob = {
        id: Date.now(),
        title: title,
        client: user.name,
        desc: desc,
        category: category,
        budget: budget + ' EGP',
        tags: skills ? skills.split(',').map(s => s.trim()) : []
    };
    
    const jobs = getJobs();
    jobs.unshift(newJob);
    localStorage.setItem(STORAGE_JOBS, JSON.stringify(jobs));
    
    form.reset();
    alert('Job posted successfully!');
    navigate('jobs');
}

// Profile Functions
function renderProfile() {
    const user = getUser();
    const profileContent = document.getElementById('profileContent');
    
    if (!user) {
        profileContent.innerHTML = `
            <div class="profile-card">
                <p>Please login to view your profile</p>
                <button class="btn-primary" onclick="toggleLoginModal()">Login</button>
            </div>
        `;
        return;
    }
    
    const verification = getVerification();
    const verificationBadge = verification && verification.status === 'verified' 
        ? '<span class="profile-badge">✓ Verified</span>' 
        : '';
    
    profileContent.innerHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-info">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>
                    <p>Role: <strong>${user.role === 'student' ? 'Freelancer' : 'Client'}</strong></p>
                    <p>Member since: ${user.joinDate}</p>
                </div>
                ${verificationBadge}
            </div>
        </div>
        
        <div class="profile-card">
            <h3>Profile Completion</h3>
            <div style="display: grid; gap: 10px; margin-top: 15px;">
                <div>
                    <strong>Email:</strong> ${user.email} ✓
                </div>
                <div>
                    <strong>University Verification:</strong> 
                    ${verification && verification.status === 'verified' ? '✓ Verified' : '⚠️ Not verified'}
                </div>
                <div>
                    <button class="btn-primary" onclick="navigate('verify')" style="margin-top: 10px;">
                        ${verification ? 'Update Verification' : 'Verify Now'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Verification Functions
function renderVerification() {
    const user = getUser();
    const verification = getVerification();
    const statusDiv = document.getElementById('verificationStatus');
    const verifyForm = document.getElementById('verifyForm');
    
    if (!user) {
        statusDiv.innerHTML = '<p>Please login first</p>';
        verifyForm.style.display = 'none';
        return;
    }
    
    if (verification && verification.status === 'verified') {
        statusDiv.innerHTML = `
            <div class="verification-status">
                <h3>✓ Verified</h3>
                <p>Your university ID has been verified!</p>
                <p><strong>University:</strong> ${verification.university}</p>
                <p><strong>Verified on:</strong> ${verification.verifiedAt}</p>
            </div>
        `;
        verifyForm.style.display = 'none';
    } else {
        verifyForm.style.display = 'block';
        statusDiv.innerHTML = '';
    }
}

function submitVerification(event) {
    event.preventDefault();
    const form = event.target;
    const university = form.querySelector('select').value;
    const studentId = form.querySelector('input[type="text"]').value;
    
    const verification = {
        status: 'verified',
        university: university,
        studentId: studentId,
        verifiedAt: new Date().toLocaleDateString()
    };
    
    localStorage.setItem(STORAGE_VERIFICATION, JSON.stringify(verification));
    
    const user = getUser();
    user.isVerified = true;
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    
    form.reset();
    renderVerification();
    updateAuthUI();
    alert('Verification submitted successfully!');
}

function getVerification() {
    const stored = localStorage.getItem(STORAGE_VERIFICATION);
    return stored ? JSON.parse(stored) : null;
}

// Modal Functions
function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.toggle('active');
}

function toggleRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.toggle('active');
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        loginModal.classList.remove('active');
    }
    if (event.target === registerModal) {
        registerModal.classList.remove('active');
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initApp);
