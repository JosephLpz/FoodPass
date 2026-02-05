// Types for the FoodPass system

export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'colacion';

export type UserRole = 'admin' | 'operador' | 'supervisor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  rut: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  totalPersons: number;
  totalConsumptions: number;
  costBreakfast: number;
  costLunch: number;
  costDinner: number;
  costSnack: number;
  costEnhanced: number;
  isActive: boolean;
  createdAt: Date;
}

export interface DiningHall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  isActive: boolean;
  todayConsumptions: number;
  totalConsumptions: number;
}

export interface Person {
  id: string;
  qrCode: string;
  name: string;
  rut: string;
  email: string;
  companyId: string;
  companyName: string;
  department: string;
  isActive: boolean;
  photoUrl?: string;
  createdAt: Date;
}

export interface Consumption {
  id: string;
  personId: string;
  personName: string;
  companyId: string;
  companyName: string;
  diningHallId: string;
  diningHallName: string;
  mealType: MealType;
  isEnhanced: boolean;
  costAtTime: number;
  registeredAt: Date;
  registeredBy: string;
}

export interface DashboardStats {
  totalPersonsToday: number;
  totalConsumptions: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  comparisonYesterday: {
    persons: number;
    consumptions: number;
  };
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  companyId?: string;
  diningHallId?: string;
  mealType?: MealType;
}

export interface ReportSummary {
  date: string;
  company: string;
  diningHall: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  enhanced: number;
  total: number;
  estimatedCost: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// QR Registration types
export interface QRValidationResult {
  success: boolean;
  person?: Person;
  mealType?: MealType;
  isEnhanced?: boolean;
  alreadyRegistered?: boolean;
  error?: string;
}
