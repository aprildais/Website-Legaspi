// Sample initial data kung walang laman ang LocalStorage
const defaultStudents = [
    { name: 'Juan Dela Cruz', email: 'juan@example.com', program: 'BSIT', year_level: '3rd Year' },
    { name: 'Maria Santos', email: 'maria@example.com', program: 'BSCS', year_level: '2nd Year' }
];

let students = JSON.parse(localStorage.getItem('smart_students')) || defaultStudents;
let deleteTargetIndex = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    renderStudents();
});

// Render Table Data
function renderStudents(filterText = '') {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';

    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(filterText.toLowerCase()) ||
        s.email.toLowerCase().includes(filterText.toLowerCase()) ||
        s.program.toLowerCase().includes(filterText.toLowerCase())
    );

    document.getElementById('totalStudentsCount').textContent = students.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">No student records found.</td></tr>`;
        updateAnalytics();
        return;
    }

    filtered.forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td><span class="badge-program">${escapeHtml(student.program)}</span></td>
            <td>${escapeHtml(student.year_level)}</td>
            <td class="action-cell">
                <button class="btn-edit" onclick="openEditModal(${index})">Edit</button>
                <button class="btn-delete" onclick="openDeleteModal(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateAnalytics();
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]; });
}

// Search
function handleSearch() {
    const text = document.getElementById('searchInput').value;
    renderStudents(text);
}

// Add/Edit Modals
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentIndex').value = '';
    document.getElementById('studentForm').reset();
    document.getElementById('studentModal').classList.add('active');
}

function openEditModal(index) {
    document.getElementById('modalTitle').textContent = 'Edit Student Record';
    document.getElementById('studentIndex').value = index;
    document.getElementById('studentName').value = students[index].name;
    document.getElementById('studentEmail').value = students[index].email;
    document.getElementById('studentProgram').value = students[index].program;
    document.getElementById('studentYear').value = students[index].year_level;
    document.getElementById('studentModal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

// Save Student
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const idx = document.getElementById('studentIndex').value;
    const studentData = {
        name: document.getElementById('studentName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        program: document.getElementById('studentProgram').value.trim().toUpperCase(),
        year_level: document.getElementById('studentYear').value
    };

    if (idx === '') {
        students.push(studentData);
    } else {
        students[idx] = studentData;
    }

    localStorage.setItem('smart_students', JSON.stringify(students));
    closeStudentModal();
    renderStudents();
});

// Delete Logic
function openDeleteModal(index) {
    deleteTargetIndex = index;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    deleteTargetIndex = null;
    document.getElementById('deleteModal').classList.remove('active');
}

function confirmDelete() {
    if (deleteTargetIndex !== null) {
        students.splice(deleteTargetIndex, 1);
        localStorage.setItem('smart_students', JSON.stringify(students));
        renderStudents();
        closeDeleteModal();
    }
}

// Logout Modal
function openLogoutModal() { document.getElementById('logoutModal').classList.add('active'); }
function closeLogoutModal() { document.getElementById('logoutModal').classList.remove('active'); }

// Navigation Tabs
function switchTab(page) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (page === 'dashboard' || page === 'students') {
        document.getElementById('page-dashboard').style.display = 'block';
        document.getElementById(`nav-${page}`).classList.add('active');
    } else {
        document.getElementById(`page-${page}`).style.display = 'block';
        document.getElementById(`nav-${page}`).classList.add('active');
    }
}

// Schedule Switcher
function showSchedule(prog, btn) {
    document.querySelectorAll('.schedule-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`sched-${prog}`).style.display = 'block';
    btn.classList.add('active');
}

// Dynamic Reports & Analytics
function updateAnalytics() {
    const counts = { 'BSIT': 0, 'BSCS': 0, 'BSAIS': 0, 'BSBA': 0 };
    students.forEach(s => {
        const p = s.program.toUpperCase();
        if (counts.hasOwnProperty(p)) counts[p]++;
    });

    const total = students.length;
    const maxCount = Math.max(...Object.values(counts), 1);

    // Bar Chart
    const barContainer = document.getElementById('barChartContainer');
    barContainer.innerHTML = '';
    Object.keys(counts).forEach(code => {
        const cnt = counts[code];
        const pct = Math.round((cnt / maxCount) * 100);
        barContainer.innerHTML += `
            <div class="bar-wrapper">
                <span class="bar-value">${cnt}</span>
                <div class="bar-fill" style="height: ${Math.max(pct, 5)}%;"></div>
                <span class="bar-label">${code}</span>
            </div>
        `;
    });

    // Circular Progress
    const target = 50;
    const capPct = target > 0 ? Math.min(Math.round((total / target) * 100), 100) : 0;
    const dashOffset = 283 - (283 * capPct / 100);
    document.getElementById('circleProgress').style.strokeDashoffset = dashOffset;
    document.getElementById('capacityPctText').textContent = `${capPct}%`;
    document.getElementById('capacityEnrolledText').textContent = `${total} Enrolled`;

    // Reports Table
    const repTbody = document.getElementById('reportsTableBody');
    repTbody.innerHTML = '';
    Object.keys(counts).forEach(code => {
        const cnt = counts[code];
        const pct = total > 0 ? ((cnt / total) * 100).toFixed(1) : 0;
        const dept = (code === 'BSIT' || code === 'BSCS') ? 'College of Computer Studies' : 'College of Business & Accountancy';
        repTbody.innerHTML += `
            <tr>
                <td><span class="badge-program">${code}</span></td>
                <td>${dept}</td>
                <td>${cnt}</td>
                <td><strong>${pct}%</strong></td>
                <td>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </td>
            </tr>
        `;
    });
}