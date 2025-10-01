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