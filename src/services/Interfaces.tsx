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
  id: string;
  subjectCode: string;
  subjectName: string;
  section: string;
  totalClasses: number;
  attendancePercentage: number;
  lastClass: string;
  department: string;
  year: string; 
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