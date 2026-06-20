-- ============================================================
--  College ERP System - PostgreSQL Schema
--  ADBMS Academic Project
--
--  HOW TO RUN:
--  1. Open pgAdmin or psql
--  2. Create a database called: college_erp
--  3. Run this file against that database
--
--  In psql:
--    \c college_erp
--    \i /path/to/schema.sql
-- ============================================================

-- Drop existing tables (in reverse FK order)
DROP TABLE IF EXISTS "Fees"       CASCADE;
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Course"     CASCADE;
DROP TABLE IF EXISTS "Faculty"    CASCADE;
DROP TABLE IF EXISTS "Student"    CASCADE;
DROP TABLE IF EXISTS "Department" CASCADE;

-- -------------------------------------------------------
-- Table: Department
-- -------------------------------------------------------
CREATE TABLE "Department" (
    "DeptID"   SERIAL PRIMARY KEY,
    "DeptName" VARCHAR(100) NOT NULL UNIQUE
);

-- -------------------------------------------------------
-- Table: Student
-- -------------------------------------------------------
CREATE TABLE "Student" (
    "StudentID" SERIAL PRIMARY KEY,
    "Name"      VARCHAR(100) NOT NULL,
    "Email"     VARCHAR(150) NOT NULL UNIQUE,
    "Phone"     VARCHAR(15),
    "Semester"  INTEGER NOT NULL,
    "DeptID"    INTEGER NOT NULL,
    CONSTRAINT fk_student_dept FOREIGN KEY ("DeptID")
        REFERENCES "Department"("DeptID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -------------------------------------------------------
-- Table: Faculty
-- -------------------------------------------------------
CREATE TABLE "Faculty" (
    "FacultyID" SERIAL PRIMARY KEY,
    "Name"      VARCHAR(100) NOT NULL,
    "Email"     VARCHAR(150) NOT NULL UNIQUE,
    "DeptID"    INTEGER NOT NULL,
    CONSTRAINT fk_faculty_dept FOREIGN KEY ("DeptID")
        REFERENCES "Department"("DeptID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -------------------------------------------------------
-- Table: Course
-- -------------------------------------------------------
CREATE TABLE "Course" (
    "CourseID"   SERIAL PRIMARY KEY,
    "CourseName" VARCHAR(150) NOT NULL,
    "Credits"    INTEGER NOT NULL,
    "FacultyID"  INTEGER,
    CONSTRAINT fk_course_faculty FOREIGN KEY ("FacultyID")
        REFERENCES "Faculty"("FacultyID") ON DELETE SET NULL ON UPDATE CASCADE
);

-- -------------------------------------------------------
-- Table: Attendance
-- -------------------------------------------------------
CREATE TABLE "Attendance" (
    "AttendanceID" SERIAL PRIMARY KEY,
    "StudentID"    INTEGER NOT NULL,
    "CourseID"     INTEGER NOT NULL,
    "Date"         DATE NOT NULL,
    "Status"       VARCHAR(10) NOT NULL DEFAULT 'Present'
                   CHECK ("Status" IN ('Present', 'Absent')),
    CONSTRAINT fk_att_student FOREIGN KEY ("StudentID")
        REFERENCES "Student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_att_course  FOREIGN KEY ("CourseID")
        REFERENCES "Course"("CourseID")   ON DELETE CASCADE ON UPDATE CASCADE
);

-- -------------------------------------------------------
-- Table: Fees
-- -------------------------------------------------------
CREATE TABLE "Fees" (
    "FeeID"       SERIAL PRIMARY KEY,
    "StudentID"   INTEGER NOT NULL,
    "Amount"      DECIMAL(10,2) NOT NULL,
    "PaymentDate" DATE,
    "Status"      VARCHAR(10) NOT NULL DEFAULT 'Pending'
                  CHECK ("Status" IN ('Paid', 'Pending')),
    CONSTRAINT fk_fees_student FOREIGN KEY ("StudentID")
        REFERENCES "Student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
--  Sample Data
-- ============================================================

-- Departments
INSERT INTO "Department" ("DeptName") VALUES
    ('Computer Science'),
    ('Information Technology'),
    ('Electronics & Communication'),
    ('Mechanical Engineering'),
    ('Civil Engineering');

-- Faculty
INSERT INTO "Faculty" ("Name", "Email", "DeptID") VALUES
    ('Dr. Ramesh Kumar',   'ramesh.kumar@college.edu',   1),
    ('Prof. Sunita Mehta', 'sunita.mehta@college.edu',   1),
    ('Dr. Anil Sharma',    'anil.sharma@college.edu',    2),
    ('Prof. Priya Nair',   'priya.nair@college.edu',     3),
    ('Dr. Vinod Rao',      'vinod.rao@college.edu',      4);

-- Students
INSERT INTO "Student" ("Name", "Email", "Phone", "Semester", "DeptID") VALUES
    ('Aarav Singh',    'aarav.singh@student.edu',    '9876543210', 3, 1),
    ('Neha Patel',     'neha.patel@student.edu',     '9876543211', 3, 1),
    ('Ravi Verma',     'ravi.verma@student.edu',     '9876543212', 5, 2),
    ('Anjali Gupta',   'anjali.gupta@student.edu',   '9876543213', 1, 3),
    ('Kiran Reddy',    'kiran.reddy@student.edu',    '9876543214', 7, 4),
    ('Pooja Iyer',     'pooja.iyer@student.edu',     '9876543215', 2, 1),
    ('Manish Joshi',   'manish.joshi@student.edu',   '9876543216', 4, 2),
    ('Sneha Kulkarni', 'sneha.kulkarni@student.edu', '9876543217', 6, 5);

-- Courses
INSERT INTO "Course" ("CourseName", "Credits", "FacultyID") VALUES
    ('Database Management Systems',   4, 1),
    ('Data Structures & Algorithms',  4, 2),
    ('Computer Networks',             3, 3),
    ('Digital Electronics',           3, 4),
    ('Engineering Mathematics',       4, 5),
    ('Operating Systems',             3, 1),
    ('Web Technologies',              3, 2);

-- Attendance
INSERT INTO "Attendance" ("StudentID", "CourseID", "Date", "Status") VALUES
    (1, 1, '2026-06-01', 'Present'),
    (1, 1, '2026-06-02', 'Present'),
    (1, 2, '2026-06-01', 'Absent'),
    (2, 1, '2026-06-01', 'Present'),
    (2, 2, '2026-06-01', 'Present'),
    (3, 3, '2026-06-01', 'Present'),
    (4, 4, '2026-06-01', 'Absent'),
    (5, 5, '2026-06-01', 'Present');

-- Fees
INSERT INTO "Fees" ("StudentID", "Amount", "PaymentDate", "Status") VALUES
    (1, 45000.00, '2026-06-05', 'Paid'),
    (2, 45000.00, NULL,         'Pending'),
    (3, 42000.00, '2026-06-10', 'Paid'),
    (4, 40000.00, NULL,         'Pending'),
    (5, 48000.00, '2026-06-08', 'Paid'),
    (6, 45000.00, NULL,         'Pending'),
    (7, 42000.00, '2026-06-12', 'Paid'),
    (8, 40000.00, NULL,         'Pending');
