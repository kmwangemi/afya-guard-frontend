export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'investigator' | 'analyst' | 'auditor' | 'readonly';
  department?: string;
  is_active: boolean;
}
