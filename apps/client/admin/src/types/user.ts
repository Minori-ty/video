export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLoginAt: string | null;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  profilePicture: string | null;
  bio: string | null;
  timezone: string | null;
}

export interface PaginatedUsers {
  total: number;
  items: User[];
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  profilePicture?: string;
  bio?: string;
  timezone?: string;
  role?: Exclude<Role, 'SUPERADMIN'>;
}

export interface ResetPasswordData {
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}
