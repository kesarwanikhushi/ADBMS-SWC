/*  app.js - College ERP System Frontend Logic
    All API calls go to the backend Express server at /api/...
*/

const API = '';  // same origin - no need for absolute URL

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigate(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Deactivate all nav links
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));

    // Show target page
    const page = document.getElementById('page-' + pageName);
    if (page) page.classList.add('active');

    // Activate nav link
    const link = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (link) link.classList.add('active');

    // Load data for the active page
    switch (pageName) {
        case 'students':   loadStudents(); loadDepartmentsInto('sDept'); break;
        case 'faculty':    loadFaculty();  loadDepartmentsInto('fDept'); break;
        case 'courses':    loadCourses();  loadFacultyInto('cFaculty');  break;
        case 'attendance':
            loadAttendance();
            loadStudentsInto('attStudent');
            loadCoursesInto('attCourse');
            // Set today's date by default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('attDate').value = today;
            break;
        case 'fees':
            loadFees();
            loadStudentsInto('feStudent');
            break;
    }
}

// Wire up nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        navigate(this.dataset.page);
    });
});

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

// Show alert message inside a page
function showAlert(id, message, type) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.className = 'alert show alert-' + type;
    setTimeout(() => { el.classList.remove('show'); }, 3500);
}

// Format date string (YYYY-MM-DD → DD/MM/YYYY)
function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN');
}

// Generic API call helper
async function apiCall(method, url, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(API + url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

/* ---- Populate department dropdown ---- */
async function loadDepartmentsInto(selectId) {
    try {
        const depts = await apiCall('GET', '/api/departments');
        const sel   = document.getElementById(selectId);
        const curr  = sel.value;
        // Keep placeholder option, rebuild rest
        sel.innerHTML = '<option value="">-- Select --</option>';
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value       = d.DeptID;
            opt.textContent = d.DeptName;
            sel.appendChild(opt);
        });
        if (curr) sel.value = curr;
    } catch (err) {
        console.error('Failed to load departments', err);
    }
}

/* ---- Populate faculty dropdown ---- */
async function loadFacultyInto(selectId) {
    try {
        const faculty = await apiCall('GET', '/api/faculty');
        const sel     = document.getElementById(selectId);
        const curr    = sel.value;
        sel.innerHTML = '<option value="">-- None --</option>';
        faculty.forEach(f => {
            const opt = document.createElement('option');
            opt.value       = f.FacultyID;
            opt.textContent = f.Name;
            sel.appendChild(opt);
        });
        if (curr) sel.value = curr;
    } catch (err) {
        console.error('Failed to load faculty', err);
    }
}

/* ---- Populate students dropdown ---- */
async function loadStudentsInto(selectId) {
    try {
        const students = await apiCall('GET', '/api/students');
        const sel      = document.getElementById(selectId);
        const curr     = sel.value;
        sel.innerHTML  = '<option value="">-- Select Student --</option>';
        students.forEach(s => {
            const opt = document.createElement('option');
            opt.value       = s.StudentID;
            opt.textContent = `${s.Name} (${s.DeptName})`;
            sel.appendChild(opt);
        });
        if (curr) sel.value = curr;
    } catch (err) {
        console.error('Failed to load students', err);
    }
}

/* ---- Populate courses dropdown ---- */
async function loadCoursesInto(selectId) {
    try {
        const courses = await apiCall('GET', '/api/courses');
        const sel     = document.getElementById(selectId);
        const curr    = sel.value;
        sel.innerHTML = '<option value="">-- Select Course --</option>';
        courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value       = c.CourseID;
            opt.textContent = c.CourseName;
            sel.appendChild(opt);
        });
        if (curr) sel.value = curr;
    } catch (err) {
        console.error('Failed to load courses', err);
    }
}

/* ============================================================
   STUDENTS MODULE
   ============================================================ */

async function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">Loading...</td></tr>';
    try {
        const students = await apiCall('GET', '/api/students');
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students found.</td></tr>';
            return;
        }
        tbody.innerHTML = students.map(s => `
            <tr>
                <td>${s.StudentID}</td>
                <td>${s.Name}</td>
                <td>${s.Email}</td>
                <td>${s.Phone || '—'}</td>
                <td>${s.Semester}</td>
                <td>${s.DeptName}</td>
                <td>
                    <button class="btn btn-edit" onclick="editStudent(${s.StudentID})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteStudent(${s.StudentID}, '${s.Name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Error: ${err.message}</td></tr>`;
    }
}

async function submitStudentForm(e) {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const body = {
        Name:     document.getElementById('sName').value.trim(),
        Email:    document.getElementById('sEmail').value.trim(),
        Phone:    document.getElementById('sPhone').value.trim(),
        Semester: document.getElementById('sSemester').value,
        DeptID:   document.getElementById('sDept').value
    };
    try {
        if (id) {
            await apiCall('PUT', `/api/students/${id}`, body);
            showAlert('studentAlert', 'Student updated successfully!', 'success');
        } else {
            await apiCall('POST', '/api/students', body);
            showAlert('studentAlert', 'Student added successfully!', 'success');
        }
        cancelStudentEdit();
        loadStudents();
    } catch (err) {
        showAlert('studentAlert', err.message, 'error');
    }
}

async function editStudent(id) {
    try {
        const s = await apiCall('GET', `/api/students/${id}`);
        document.getElementById('studentId').value    = s.StudentID;
        document.getElementById('sName').value        = s.Name;
        document.getElementById('sEmail').value       = s.Email;
        document.getElementById('sPhone').value       = s.Phone || '';
        document.getElementById('sSemester').value    = s.Semester;
        await loadDepartmentsInto('sDept');
        document.getElementById('sDept').value        = s.DeptID;
        document.getElementById('studentFormTitle').textContent  = 'Edit Student';
        document.getElementById('studentSubmitBtn').textContent  = 'Update Student';
        document.getElementById('studentFormCard').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showAlert('studentAlert', err.message, 'error');
    }
}

async function deleteStudent(id, name) {
    if (!confirm(`Delete student "${name}"? This will also remove related attendance and fee records.`)) return;
    try {
        await apiCall('DELETE', `/api/students/${id}`);
        showAlert('studentAlert', 'Student deleted.', 'success');
        loadStudents();
    } catch (err) {
        showAlert('studentAlert', err.message, 'error');
    }
}

function cancelStudentEdit() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value              = '';
    document.getElementById('studentFormTitle').textContent = 'Add New Student';
    document.getElementById('studentSubmitBtn').textContent = 'Add Student';
}

/* ============================================================
   FACULTY MODULE
   ============================================================ */

async function loadFaculty() {
    const tbody = document.getElementById('facultyTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">Loading...</td></tr>';
    try {
        const faculty = await apiCall('GET', '/api/faculty');
        if (faculty.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No faculty found.</td></tr>';
            return;
        }
        tbody.innerHTML = faculty.map(f => `
            <tr>
                <td>${f.FacultyID}</td>
                <td>${f.Name}</td>
                <td>${f.Email}</td>
                <td>${f.DeptName}</td>
                <td>
                    <button class="btn btn-edit" onclick="editFaculty(${f.FacultyID})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteFaculty(${f.FacultyID}, '${f.Name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">Error: ${err.message}</td></tr>`;
    }
}

async function submitFacultyForm(e) {
    e.preventDefault();
    const id   = document.getElementById('facultyId').value;
    const body = {
        Name:   document.getElementById('fName').value.trim(),
        Email:  document.getElementById('fEmail').value.trim(),
        DeptID: document.getElementById('fDept').value
    };
    try {
        if (id) {
            await apiCall('PUT', `/api/faculty/${id}`, body);
            showAlert('facultyAlert', 'Faculty updated successfully!', 'success');
        } else {
            await apiCall('POST', '/api/faculty', body);
            showAlert('facultyAlert', 'Faculty added successfully!', 'success');
        }
        cancelFacultyEdit();
        loadFaculty();
    } catch (err) {
        showAlert('facultyAlert', err.message, 'error');
    }
}

async function editFaculty(id) {
    try {
        const f = await apiCall('GET', `/api/faculty/${id}`);
        document.getElementById('facultyId').value = f.FacultyID;
        document.getElementById('fName').value     = f.Name;
        document.getElementById('fEmail').value    = f.Email;
        await loadDepartmentsInto('fDept');
        document.getElementById('fDept').value     = f.DeptID;
        document.getElementById('facultyFormTitle').textContent  = 'Edit Faculty';
        document.getElementById('facultySubmitBtn').textContent  = 'Update Faculty';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showAlert('facultyAlert', err.message, 'error');
    }
}

async function deleteFaculty(id, name) {
    if (!confirm(`Delete faculty member "${name}"?`)) return;
    try {
        await apiCall('DELETE', `/api/faculty/${id}`);
        showAlert('facultyAlert', 'Faculty deleted.', 'success');
        loadFaculty();
    } catch (err) {
        showAlert('facultyAlert', err.message, 'error');
    }
}

function cancelFacultyEdit() {
    document.getElementById('facultyForm').reset();
    document.getElementById('facultyId').value              = '';
    document.getElementById('facultyFormTitle').textContent = 'Add New Faculty';
    document.getElementById('facultySubmitBtn').textContent = 'Add Faculty';
}

/* ============================================================
   COURSES MODULE
   ============================================================ */

async function loadCourses() {
    const tbody = document.getElementById('courseTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">Loading...</td></tr>';
    try {
        const courses = await apiCall('GET', '/api/courses');
        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No courses found.</td></tr>';
            return;
        }
        tbody.innerHTML = courses.map(c => `
            <tr>
                <td>${c.CourseID}</td>
                <td>${c.CourseName}</td>
                <td>${c.Credits}</td>
                <td>${c.FacultyName || '—'}</td>
                <td>
                    <button class="btn btn-edit" onclick="editCourse(${c.CourseID})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCourse(${c.CourseID}, '${c.CourseName}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">Error: ${err.message}</td></tr>`;
    }
}

async function submitCourseForm(e) {
    e.preventDefault();
    const id   = document.getElementById('courseId').value;
    const body = {
        CourseName: document.getElementById('cName').value.trim(),
        Credits:    document.getElementById('cCredits').value,
        FacultyID:  document.getElementById('cFaculty').value || null
    };
    try {
        if (id) {
            await apiCall('PUT', `/api/courses/${id}`, body);
            showAlert('courseAlert', 'Course updated successfully!', 'success');
        } else {
            await apiCall('POST', '/api/courses', body);
            showAlert('courseAlert', 'Course added successfully!', 'success');
        }
        cancelCourseEdit();
        loadCourses();
    } catch (err) {
        showAlert('courseAlert', err.message, 'error');
    }
}

async function editCourse(id) {
    try {
        const c = await apiCall('GET', `/api/courses/${id}`);
        document.getElementById('courseId').value   = c.CourseID;
        document.getElementById('cName').value      = c.CourseName;
        document.getElementById('cCredits').value   = c.Credits;
        await loadFacultyInto('cFaculty');
        document.getElementById('cFaculty').value   = c.FacultyID || '';
        document.getElementById('courseFormTitle').textContent  = 'Edit Course';
        document.getElementById('courseSubmitBtn').textContent  = 'Update Course';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showAlert('courseAlert', err.message, 'error');
    }
}

async function deleteCourse(id, name) {
    if (!confirm(`Delete course "${name}"?`)) return;
    try {
        await apiCall('DELETE', `/api/courses/${id}`);
        showAlert('courseAlert', 'Course deleted.', 'success');
        loadCourses();
    } catch (err) {
        showAlert('courseAlert', err.message, 'error');
    }
}

function cancelCourseEdit() {
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value              = '';
    document.getElementById('courseFormTitle').textContent = 'Add New Course';
    document.getElementById('courseSubmitBtn').textContent = 'Add Course';
}

/* ============================================================
   ATTENDANCE MODULE
   ============================================================ */

async function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Loading...</td></tr>';
    try {
        const records = await apiCall('GET', '/api/attendance');
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No attendance records found.</td></tr>';
            return;
        }
        tbody.innerHTML = records.map(a => `
            <tr>
                <td>${a.AttendanceID}</td>
                <td>${a.StudentName}</td>
                <td>${a.CourseName}</td>
                <td>${fmtDate(a.Date)}</td>
                <td>
                    <span class="badge badge-${a.Status.toLowerCase()}">${a.Status}</span>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="deleteAttendance(${a.AttendanceID})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Error: ${err.message}</td></tr>`;
    }
}

async function submitAttendanceForm(e) {
    e.preventDefault();
    const body = {
        StudentID: document.getElementById('attStudent').value,
        CourseID:  document.getElementById('attCourse').value,
        Date:      document.getElementById('attDate').value,
        Status:    document.getElementById('attStatus').value
    };
    try {
        await apiCall('POST', '/api/attendance', body);
        showAlert('attendanceAlert', 'Attendance marked successfully!', 'success');
        document.getElementById('attendanceForm').reset();
        // Reset date to today
        document.getElementById('attDate').value = new Date().toISOString().split('T')[0];
        loadAttendance();
    } catch (err) {
        showAlert('attendanceAlert', err.message, 'error');
    }
}

async function deleteAttendance(id) {
    if (!confirm('Delete this attendance record?')) return;
    try {
        await apiCall('DELETE', `/api/attendance/${id}`);
        showAlert('attendanceAlert', 'Attendance record deleted.', 'success');
        loadAttendance();
    } catch (err) {
        showAlert('attendanceAlert', err.message, 'error');
    }
}

/* ============================================================
   FEES MODULE
   ============================================================ */

async function loadFees() {
    const tbody = document.getElementById('feeTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Loading...</td></tr>';
    try {
        const fees = await apiCall('GET', '/api/fees');
        if (fees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No fee records found.</td></tr>';
            return;
        }
        tbody.innerHTML = fees.map(f => `
            <tr>
                <td>${f.FeeID}</td>
                <td>${f.StudentName}</td>
                <td>₹${parseFloat(f.Amount).toLocaleString('en-IN')}</td>
                <td>${fmtDate(f.PaymentDate)}</td>
                <td>
                    <span class="badge badge-${f.Status.toLowerCase()}">${f.Status}</span>
                </td>
                <td>
                    <button class="btn btn-edit" onclick="editFee(${f.FeeID})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteFee(${f.FeeID})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Error: ${err.message}</td></tr>`;
    }
}

async function submitFeeForm(e) {
    e.preventDefault();
    const id   = document.getElementById('feeId').value;
    const body = {
        StudentID:   document.getElementById('feStudent').value,
        Amount:      document.getElementById('feAmount').value,
        PaymentDate: document.getElementById('feDate').value || null,
        Status:      document.getElementById('feStatus').value
    };
    try {
        if (id) {
            await apiCall('PUT', `/api/fees/${id}`, body);
            showAlert('feeAlert', 'Fee record updated successfully!', 'success');
        } else {
            await apiCall('POST', '/api/fees', body);
            showAlert('feeAlert', 'Fee record added successfully!', 'success');
        }
        cancelFeeEdit();
        loadFees();
    } catch (err) {
        showAlert('feeAlert', err.message, 'error');
    }
}

async function editFee(id) {
    try {
        const f = await apiCall('GET', `/api/fees/${id}`);
        document.getElementById('feeId').value    = f.FeeID;
        document.getElementById('feAmount').value = f.Amount;
        document.getElementById('feDate').value   = f.PaymentDate ? f.PaymentDate.split('T')[0] : '';
        document.getElementById('feStatus').value = f.Status;
        await loadStudentsInto('feStudent');
        document.getElementById('feStudent').value = f.StudentID;
        document.getElementById('feeFormTitle').textContent  = 'Edit Fee Record';
        document.getElementById('feeSubmitBtn').textContent  = 'Update Fee Record';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showAlert('feeAlert', err.message, 'error');
    }
}

async function deleteFee(id) {
    if (!confirm('Delete this fee record?')) return;
    try {
        await apiCall('DELETE', `/api/fees/${id}`);
        showAlert('feeAlert', 'Fee record deleted.', 'success');
        loadFees();
    } catch (err) {
        showAlert('feeAlert', err.message, 'error');
    }
}

function cancelFeeEdit() {
    document.getElementById('feeForm').reset();
    document.getElementById('feeId').value              = '';
    document.getElementById('feeFormTitle').textContent = 'Add Fee Record';
    document.getElementById('feeSubmitBtn').textContent = 'Add Fee Record';
}

/* ============================================================
   INIT - Load home page on startup
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
    navigate('home');
});
