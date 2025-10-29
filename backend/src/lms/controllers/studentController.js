const { Student } = require('../models');

/**
 * @desc    Get all students (with filters)
 * @route   GET /api/lms/admin/students
 * @access  Private (Admin only)
 */
const getAllStudents = async (req, res) => {
  try {
    const { college, branch, section, year, semester, search } = req.query;

    // Build filter
    const filter = {};
    if (college) filter.college = college;
    if (branch) filter.branch = branch;
    if (section) filter.section = section.toUpperCase();
    if (year) filter.year = year;
    if (semester) filter.semester = semester;

    // Search by name, email, or registration number
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/lms/admin/students/:id
 * @access  Private (Admin only)
 */
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    });
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/lms/admin/students
 * @access  Private (Admin only)
 */
const createStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      registrationNumber,
      name,
      college,
      branch,
      section,
      year,
      semester
    } = req.body;

    // Validate required fields
    if (!email || !password || !registrationNumber || !name || !college || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { registrationNumber }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or registration number already exists'
      });
    }

    // Create student
    const student = new Student({
      email,
      password,
      registrationNumber,
      name,
      college,
      branch,
      section: section?.toUpperCase(),
      year,
      semester,
      createdBy: req.userId
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: student.toPublicJSON()
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk create students
 * @route   POST /api/lms/admin/students/bulk
 * @access  Private (Admin only)
 */
const bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of students'
      });
    }

    const createdStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      try {
        const studentData = students[i];
        
        // Check if student already exists
        const existingStudent = await Student.findOne({
          $or: [
            { email: studentData.email },
            { registrationNumber: studentData.registrationNumber }
          ]
        });

        if (existingStudent) {
          errors.push({
            row: i + 1,
            email: studentData.email,
            error: 'Student already exists'
          });
          continue;
        }

        const student = new Student({
          ...studentData,
          section: studentData.section?.toUpperCase(),
          createdBy: req.userId
        });

        await student.save();
        createdStudents.push(student.toPublicJSON());
      } catch (error) {
        errors.push({
          row: i + 1,
          email: students[i].email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdStudents.length} students`,
      created: createdStudents.length,
      failed: errors.length,
      students: createdStudents,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk create students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create students',
      error: error.message
    });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/lms/admin/students/:id
 * @access  Private (Admin only)
 */
const updateStudent = async (req, res) => {
  try {
    const updates = req.body;

    // Don't allow updating createdBy
    delete updates.createdBy;

    // Convert section to uppercase if present
    if (updates.section) {
      updates.section = updates.section.toUpperCase();
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};

/**
 * @desc    Delete student (soft delete - deactivate)
 * @route   DELETE /api/lms/admin/students/:id
 * @access  Private (Admin only)
 */
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
      student
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};

/**
 * @desc    Activate student
 * @route   PUT /api/lms/admin/students/:id/activate
 * @access  Private (Admin only)
 */
const activateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student activated successfully',
      student
    });
  } catch (error) {
    console.error('Activate student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate student',
      error: error.message
    });
  }
};

/**
 * @desc    Reset student password
 * @route   PUT /api/lms/admin/students/:id/reset-password
 * @access  Private (Admin only)
 */
const resetStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  activateStudent,
  resetStudentPassword
};
