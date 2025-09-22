// User Model Interfaces for Khanyi Vending System

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  address?: Address;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  profileImage?: string;
}

export interface Address {
  street: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  tenants: number;
  estateAdmins: number;
  systemAdmins: number;
  recentRegistrations: number;
  verifiedUsers: number;
}

export interface UserProfile extends User {
  estates?: any[];
  units?: any[];
  purchases?: any[];
  notifications?: any[];
  totalPurchases: number;
  totalSpent: number;
  averagePurchase: number;
  lastActivity?: Date;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber?: string;
  password: string;
  role: UserRole;
  address?: Address;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  address?: Address;
  profileImage?: string;
}

export type UserRole = 'tenant' | 'estate_admin' | 'system_admin';

export interface UserSearchRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  estateId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthUser {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends UserCreateRequest {}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Note: Estate, Unit, Purchase, and Notification interfaces
// are defined in their respective dedicated interface files