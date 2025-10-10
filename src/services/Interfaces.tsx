export interface FilterButtonsProps {
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
  label: string;
  onSelect: (option: string) => void
}

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  year: string;
  subject_code: string;
  department: string;
  section: string;
  assignment_id: number;
}

export interface CR {
  id: string;
  student_id: string;
  name: string;
  email: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
}

// ClassAssignment Interface
export interface ClassAssignment {
  assignmentId: number;
  subjectCode: string;
  subjectName: string;
  subjectMnemonic?: string;
  section: string;
  department: string;
  year: string;
  yearBatch?: string;
  completedSessions: number;
  classAttendanceAvg: number;
  lastClassDate: string | null;
  lastClassTopic?: string | null;
}

// Recent Activity Interface
export interface RecentActivity {
  id: string;
  class: string; // Class identifier e.g., "OS2025 - E3 CSE Sec-D"
  date: string; // Date string in format 'DD/MM/YYYY'
  topic: string;
  attended: number;
  totalStudents?: number; // Optional: total number of students
  period?: number; // Optional: if you have multiple periods
  timeSlot?: string; // Optional: e.g., "8:30 - 9:30 AM"
  classId?: string; // Optional: reference to the Class id
}

// Interface for attendance data from backend
export interface AttendanceSession {
  session_id: number;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  venue: string;
  status: boolean;
  present_count: number;
  absent_count: number;
  total_students: number;
  students: StudentAttendance[];
}

export interface StudentAttendance {
  student_id: string;
  student_name: string;
  status: boolean; // true for present, false for absent
}

export interface AttendanceData {
  [date: string]: AttendanceSession[];
}