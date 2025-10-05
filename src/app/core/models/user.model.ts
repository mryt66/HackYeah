/**
 * Role użytkownika w systemie
 */
export enum UserRole {
  /** Podmiot nadzorowany */
  SUBJECT = 'SUBJECT',
  /** Pracownik UKNF */
  UKNF_EMPLOYEE = 'UKNF_EMPLOYEE',
  /** Administrator systemu */
  ADMIN = 'ADMIN'
}

/**
 * Status użytkownika
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}

/**
 * Model użytkownika
 */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  pesel?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response z tokenem JWT
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

/**
 * Registration request
 */
export interface RegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  pesel: string;
  phoneNumber?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  unreadMessages: number;
  activeCases: number;
  pendingAccessRequests?: number; // tylko dla ADMIN
}
