// Estate Model Interfaces for Khanyi Vending System

import { Address } from './user.interface';

export interface Estate {
  id: string;
  name: string;
  description?: string;
  type: EstateType;
  address: Address;
  coordinates?: Coordinates;
  tariff: TariffInfo;
  amenities: string[];
  isActive: boolean;
  totalUnits: number;
  occupiedUnits: number;
  createdBy: string;
  administrators: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  // Computed properties
  fullAddress: string;
  occupancyRate: number;
  formattedTariff: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TariffInfo {
  rate: number;
  currency: string;
  unit: string;
  lastUpdated: Date;
}

export interface EstateStats {
  totalEstates: number;
  activeEstates: number;
  totalUnits: number;
  occupiedUnits: number;
  totalRevenue: number;
  averageOccupancy: number;
  recentlyAdded: number;
}

export interface EstateDetails extends Omit<Estate, 'administrators'> {
  units: any[];
  revenueStats: EstateRevenueStats;
  usageStats: EstateUsageStats;
  administrators: any[];
  recentPurchases: EstatePurchase[];
  maintenanceRequests: Incident[];
}

export interface EstateRevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageTransactionValue: number;
  revenueGrowth: number;
  revenueByMonth: EstateRevenueByPeriod[];
}

export interface EstateUsageStats {
  totalConsumption: number;
  averageConsumption: number;
  peakUsageTimes: string[];
  consumptionTrends: ConsumptionTrend[];
  efficiencyRating: number;
}

export interface EstateRevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
  units: number;
}

export interface ConsumptionTrend {
  date: Date;
  consumption: number;
  units: number;
  averagePerUnit: number;
}

export interface EstateCreateRequest {
  name: string;
  description?: string;
  type: EstateType;
  address: Address;
  coordinates?: Coordinates;
  tariff: TariffCreateRequest;
  amenities?: string[];
  images?: string[];
}

export interface EstateUpdateRequest {
  name?: string;
  description?: string;
  type?: EstateType;
  address?: Address;
  coordinates?: Coordinates;
  tariff?: TariffUpdateRequest;
  amenities?: string[];
  isActive?: boolean;
  images?: string[];
}

export interface TariffCreateRequest {
  rate: number;
  currency: string;
  unit: string;
}

export interface TariffUpdateRequest {
  rate?: number;
  currency?: string;
  unit?: string;
}

export interface EstateSearchRequest {
  q?: string;
  city?: string;
  province?: string;
  type?: EstateType;
  minTariff?: number;
  maxTariff?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export type EstateType = 'Residential' | 'Student Housing' | 'Mixed Use';

// Related interfaces for estate context
export interface Unit {
  id: string;
  unitNumber: string;
  estate: Estate;
  status: UnitStatus;
  tenant?: EstateUser;
  meter?: Meter;
  specifications: UnitSpecifications;
  lease: LeaseInfo;
  charges: UnitCharges;
}

export interface UnitSpecifications {
  area: {
    size: number;
    unit: string;
  };
  parking: {
    covered: boolean;
    spaces: number;
  };
  bedrooms: number;
  bathrooms: number;
  floor: number;
  hasBalcony: boolean;
  hasGarden: boolean;
}

export interface LeaseInfo {
  status: LeaseStatus;
  startDate?: Date;
  endDate?: Date;
  monthlyRent?: number;
  deposit?: number;
}

export interface UnitCharges {
  monthlyRent: number;
  deposit: number;
  additionalCharges: AdditionalCharge[];
}

export interface AdditionalCharge {
  type: string;
  amount: number;
  frequency: string;
}

export interface Meter {
  id: string;
  meterNumber: string;
  balance: number;
  lastReading: Date;
  status: MeterStatus;
}

export interface EstateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface EstatePurchase {
  id: string;
  amount: number;
  unitsReceived: number;
  createdAt: Date;
  status: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: Date;
}

export type UnitStatus = 'Available' | 'Occupied' | 'Under Maintenance' | 'Reserved';
export type LeaseStatus = 'Active' | 'Expired' | 'Pending' | 'Terminated';
export type MeterStatus = 'Normal' | 'Low Balance' | 'Critical' | 'Inactive';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';