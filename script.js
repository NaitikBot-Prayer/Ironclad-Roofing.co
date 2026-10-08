// ===== LOCALSTORAGE HELPERS =====
const STORAGE_KEY = 'studentRecords';

function getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ===== DOM ELEMENTS =====
const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editIndexInput = document.getElementById('edit-index');
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search');
const statsSpan = document.getElementById('stats');
const toast = document.getElementById('toast');

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== RENDER TABLE =====
function renderTable(filter = '') {
    const students = getStudents();
    const filtered = filter
        ? students.filter(s =>
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.roll.toLowerCase().includes(filter.toLowerCase()) ||
            s.course.toLowerCase().includes(filter.toLowerCase())
        )
        : students;

    statsSpan.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-msg">No students found</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map((s, i) => {
        const originalIndex = students.indexOf(s);
        return `
            <tr>
                <td>${i + 1}</td>
                <td>${s.name}</td>
                <td>${s.roll}</td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td>${s.course}</td>
                <td>${s.marks}%</td>
                <td>
                    <button class="btn-edit" onclick="editStudent(${originalIndex})">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteStudent(${originalIndex})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== ADD / UPDATE STUDENT =====
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const course = document.getElementById('course').value;
    const marks = document.getElementById('marks').value;
    const editIndex = parseInt(editIndexInput.value);

    const student = { name, roll, email, phone, course, marks: Number(marks) };
    const students = getStudents();

    // Check duplicate roll (skip when editing same record)
    const isDuplicate = students.some(
        (s, i) => s.roll === roll && i !== editIndex
    );
    if (isDuplicate) {
        showToast('Roll number already exists!', 'error');
        return;
    }

    if (editIndex === -1) {
        // CREATE
        students.push(student);
        showToast('✅ Student added successfully!');
    } else {
        // UPDATE
        students[editIndex] = student;
        showToast('✅ Student updated successfully!');
    }

    saveStudents(students);
    resetForm();
    renderTable(searchInput.value);
});

// ===== EDIT STUDENT =====
function editStudent(index) {
    const students = getStudents();
    const s = students[index];

    document.getElementById('name').value = s.name;
    document.getElementById('roll').value = s.roll;
    document.getElementById('email').value = s.email;
    document.getElementById('phone').value = s.phone;
    document.getElementById('course').value = s.course;
    document.getElementById('marks').value = s.marks;

    editIndexInput.value = index;
    formTitle.textContent = 'Edit Student';
    submitBtn.textContent = '💾 Update Student';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// ===== DELETE STUDENT =====
function deleteStudent(index) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const students = getStudents();
    students.splice(index, 1);
    saveStudents(students);

    showToast('🗑️ Student deleted!');
    renderTable(searchInput.value);
}

// ===== CANCEL EDIT =====
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    editIndexInput.value = -1;
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = '➕ Add Student';
    cancelBtn.style.display = 'none';
}

// ===== SEARCH =====
searchInput.addEventListener('input', function () {
    renderTable(this.value);
});

// ===== INITIAL RENDER =====
renderTable();   