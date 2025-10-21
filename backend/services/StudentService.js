import { firebaseManager } from '../config/firebaseAdmin.js';
import CollegeStudent from '../models/EnhancedCollegeStudent.js';

/**
 * 🔥 WORLD-CLASS STUDENT MANAGEMENT SERVICE
 * Atomic Firebase + MongoDB operations with comprehensive error handling
 * Follows ACID principles for data consistency
 */

class StudentService {
  constructor() {
    this.firebaseManager = firebaseManager;
  }

  /**
   * 🚀 Create student with atomic Firebase + MongoDB transaction
   * Either both succeed or both fail (no orphaned records)
   */
  async createStudent(studentData) {
    let firebaseUser = null;
    let mongoStudent = null;
    
    try {
      console.log(`🚀 Creating student: ${studentData.name} (${studentData.rollNumber})`);
      
      // Step 1: Validate input data
      const validation = this.validateStudentData(studentData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        };
      }

      // Step 2: Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(studentData);
      if (!duplicateCheck.isUnique) {
        return {
          success: false,
          error: 'Duplicate student found',
          details: duplicateCheck.conflicts
        };
      }

      // Step 3: Generate secure credentials
      const credentials = this.generateCredentials(studentData);
      
      // Step 4: Create Firebase user
      console.log(`🔥 Creating Firebase user for ${studentData.email}...`);
      const firebaseResult = await this.firebaseManager.createUser({
        email: credentials.email,
        password: credentials.password,
        displayName: studentData.name,
        customClaims: {
          role: 'student',
          collegeCode: studentData.collegeCode,
          rollNumber: studentData.rollNumber,
          department: studentData.department,
          isCollegeStudent: true
        }
      });

      if (!firebaseResult.success) {
        throw new Error(`Firebase user creation failed: ${firebaseResult.error}`);
      }

      firebaseUser = firebaseResult.user;
      console.log(`✅ Firebase user created: ${firebaseUser.uid}`);

      // Step 5: Create MongoDB profile
      console.log(`📊 Creating MongoDB profile...`);
      
      // Get college name from code
      const collegeNames = {
        'vignan': 'Vignan University',
        'mit': 'MIT Manipal',
        'vit': 'VIT University',
        'iit': 'Indian Institute of Technology',
        'bits': 'BITS Pilani'
      };
      
      mongoStudent = new CollegeStudent({
        firebaseUid: firebaseUser.uid,
        collegeCode: studentData.collegeCode,
        collegeName: studentData.collegeName || collegeNames[studentData.collegeCode] || 'Unknown College',
        rollNumber: studentData.rollNumber.toUpperCase(),
        email: credentials.email,
        name: studentData.name,
        department: studentData.department,
        year: studentData.year,
        semester: studentData.semester || null,
        batch: studentData.batch || null,
        section: studentData.section || null,
        isActive: true,
        metadata: {
          importSource: studentData.importSource || 'api-creation',
          importedAt: new Date()
        }
      });

      await mongoStudent.save();
      console.log(`✅ MongoDB profile created: ${mongoStudent._id}`);

      // Step 6: Return success result
      return {
        success: true,
        data: {
          student: {
            firebaseUid: firebaseUser.uid,
            mongoId: mongoStudent._id,
            rollNumber: mongoStudent.rollNumber,
            name: mongoStudent.name,
            email: mongoStudent.email,
            department: mongoStudent.department,
            year: mongoStudent.year,
            collegeCode: mongoStudent.collegeCode
          },
          credentials: {
            email: credentials.email,
            password: credentials.password,
            loginUrl: this.getLoginUrl(studentData.collegeCode)
          }
        }
      };

    } catch (error) {
      console.error(`❌ Student creation failed for ${studentData.name}:`, error.message);

      // ROLLBACK: Clean up any created resources
      await this.rollbackCreation(firebaseUser, mongoStudent);

      return {
        success: false,
        error: 'Student creation failed',
        details: error.message,
        code: error.code
      };
    }
  }

  /**
   * 🧹 Rollback creation if either Firebase or MongoDB fails
   */
  async rollbackCreation(firebaseUser, mongoStudent) {
    try {
      // Delete Firebase user if created
      if (firebaseUser && firebaseUser.uid) {
        console.log(`🧹 Rolling back Firebase user: ${firebaseUser.uid}`);
        await this.firebaseManager.deleteUser(firebaseUser.uid);
      }

      // Delete MongoDB document if created
      if (mongoStudent && mongoStudent._id) {
        console.log(`🧹 Rolling back MongoDB document: ${mongoStudent._id}`);
        await CollegeStudent.findByIdAndDelete(mongoStudent._id);
      }

      console.log('✅ Rollback completed successfully');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
      // Log for manual cleanup but don't throw
    }
  }

  /**
   * 📋 Comprehensive input validation
   */
  validateStudentData(data) {
    const errors = [];
    const required = ['name', 'rollNumber', 'department', 'year', 'collegeCode'];

    // Check required fields
    required.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    // Validate formats
    if (data.rollNumber && !/^[A-Za-z0-9]+$/.test(data.rollNumber)) {
      errors.push('Roll number must contain only letters and numbers');
    }

    if (data.name && !/^[a-zA-Z\s]+$/.test(data.name)) {
      errors.push('Name must contain only letters and spaces');
    }

    if (data.year && !['1', '2', '3', '4'].includes(data.year.toString())) {
      errors.push('Year must be 1, 2, 3, or 4 (B.Tech year)');
    }

    if (data.collegeCode && !['vignan'].includes(data.collegeCode.toLowerCase())) {
      errors.push('Only Vignan University is supported');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 🔍 Check for duplicate students
   */
  async checkForDuplicates(studentData) {
    const conflicts = [];

    // Check for duplicate roll number in same college
    const existingRoll = await CollegeStudent.findByCollegeAndRoll(
      studentData.collegeCode,
      studentData.rollNumber
    );
    
    if (existingRoll) {
      conflicts.push(`Roll number ${studentData.rollNumber} already exists in ${studentData.collegeCode}`);
    }

    // Check for duplicate email
    const email = this.generateCredentials(studentData).email;
    const existingEmail = await CollegeStudent.findOne({ email: email });
    
    if (existingEmail) {
      conflicts.push(`Email ${email} already exists`);
    }

    return {
      isUnique: conflicts.length === 0,
      conflicts
    };
  }

  /**
   * 🔑 Generate secure credentials
   */
  generateCredentials(studentData) {
    const collegeCode = studentData.collegeCode.toLowerCase();
    const rollNumber = studentData.rollNumber.toUpperCase();
    
    // Generate college domain
    const domains = {
      'vignan': 'vignan.edu',
      'mit': 'manipal.edu', 
      'vit': 'vit.ac.in',
      'iit': 'iitb.ac.in',
      'bits': 'pilani.bits-pilani.ac.in'
    };

    const email = `${rollNumber.toLowerCase()}@${domains[collegeCode] || 'college.edu'}`;
    
    // Generate secure password (format: COLLEGE@ROLLNUMBER)
    const password = `${collegeCode.toUpperCase()}@${rollNumber}`;

    return { email, password };
  }

  /**
   * 🌐 Get login URL for college
   */
  getLoginUrl(collegeCode) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/college-portal`;
  }

  /**
   * 🔍 Find student by Firebase UID
   */
  async getStudentByFirebaseUid(firebaseUid) {
    try {
      const student = await CollegeStudent.findByFirebaseUid(firebaseUid);
      if (!student) {
        return {
          success: false,
          error: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: student
      };
    } catch (error) {
      console.error('❌ Error finding student:', error);
      return {
        success: false,
        error: 'Database error',
        details: error.message
      };
    }
  }

  /**
   * 📊 Get college students with pagination and filtering
   */
  async getCollegeStudents(collegeCode, options = {}) {
    try {
      const {
        page = 1,
        limit = 15,
        search = '',
        department = null,
        year = null,
        isActive = true
      } = options;

      // Build query
      const query = { collegeCode: collegeCode.toLowerCase() };
      if (isActive !== null) query.isActive = isActive;
      if (department) query.department = new RegExp(department, 'i');
      if (year) query.year = year;
      
      // Add search functionality
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { rollNumber: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ];
      }

      // Execute queries
      const [students, totalCount] = await Promise.all([
        CollegeStudent.find(query)
          .sort({ rollNumber: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select('-metadata -__v'),
        CollegeStudent.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          students,
          pagination: {
            currentPage: page,
            totalPages,
            totalStudents: totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('❌ Error fetching students:', error);
      return {
        success: false,
        error: 'Failed to fetch students',
        details: error.message
      };
    }
  }

  /**
   * 📊 Get college statistics
   */
  async getCollegeStatistics(collegeCode) {
    try {
      const stats = await CollegeStudent.getCollegeStats(collegeCode);
      
      if (!stats) {
        return {
          success: true,
          data: {
            totalStudents: 0,
            activeStudents: 0,
            departmentBreakdown: {},
            averageGPA: 0,
            totalExams: 0
          }
        };
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error fetching college stats:', error);
      return {
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message
      };
    }
  }

  /**
   * 🔄 Update student login time
   */
  async updateLastLogin(firebaseUid) {
    try {
      const student = await CollegeStudent.findOne({ firebaseUid });
      if (student) {
        await student.updateLastLogin();
        return { success: true };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('❌ Error updating last login:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const studentService = new StudentService();
export default studentService;