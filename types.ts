
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  FORWARDED = 'FORWARDED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  LOCKED = 'LOCKED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  passwordHash: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  quantity: number;
  unit: string;
  co2Saved: number;
  evidenceUrl: string; // Base64 for demo
  status: ActivityStatus;
  managerRemarks?: string;
  adminRemarks?: string;
  timestamp: number;
  updatedAt: number;
}

export interface Target {
  id: string;
  title: string;
  category: string;
  targetValue: number; // in kg CO2
  currentValue: number;
  startDate: number;
  endDate: number;
  isCertified: boolean;
  certifiedBy?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  details: string;
  ipAddress: string;
}

export interface EmissionFactor {
  id: string;
  activityName: string;
  factor: number; // kg CO2 per unit
  unit: string;
}
