// Unit Model Interfaces for Khanyi Vending System

export interface Unit {
  id: string;
  unitNumber: string;
  estate: string | Estate; // Can be populated or just ID
  specifications: UnitSpecifications;
  tenant?: string | User; // Can be populated or just ID
  lease?: LeaseInfo;
  status: UnitStatus;
  charges: UnitCharges;
  meter: string | Meter; // Can be populated or just ID
  images?: UnitImage[];
  maintenance?: MaintenanceRecord[];
  amenities?: UnitAmenity[];
  inspections?: InspectionRecord[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;

  // Virtuals
  fullIdentifier?: string;
  leaseStatus?: string;
  description?: string;
}

export interface UnitSpecifications {
  bedrooms?: number;
  bathrooms?: number;
  area?: {
    size: number;
    unit: string; // m²
  };
  floor?: number;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  parking?: {
    spaces: number;
    covered: boolean;
  };
}

export interface LeaseInfo {
  startDate?: Date;
  endDate?: Date;
  monthlyRent?: number;
  deposit?: number;
  status: LeaseStatus;
}

export interface UnitCharges {
  monthlyRent?: number;
  deposit?: number;
  additionalCharges?: AdditionalCharge[];
}

export interface AdditionalCharge {
  description: string;
  amount: number;
  frequency: ChargeFrequency;
}

export interface UnitImage {
  url: string;
  description?: string;
  room?: string;
  isPrimary?: boolean;
}

export interface MaintenanceRecord {
  date: Date;
  type: MaintenanceType;
  description: string;
  cost?: number;
  status: MaintenanceStatus;
  technician?: string;
}

export interface InspectionRecord {
  date: Date;
  type: InspectionType;
  inspector: string;
  rating?: number;
  notes?: string;
  photos?: string[];
  issues?: InspectionIssue[];
}

export interface InspectionIssue {
  description: string;
  severity: IssueSeverity;
  resolved?: boolean;
}

// Types
export type UnitStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
export type LeaseStatus = 'Active' | 'Expired' | 'Terminated' | 'Pending';
export type ChargeFrequency = 'Monthly' | 'Quarterly' | 'Annually' | 'Once-off';
export type MaintenanceType = 'Routine' | 'Emergency' | 'Requested' | 'Preventive';
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type InspectionType = 'Move-in' | 'Move-out' | 'Routine' | 'Complaint';
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type UnitAmenity = 'Air Conditioning' | 'Heating' | 'Built-in Wardrobes' |
  'Dishwasher' | 'Washing Machine Connection' | 'Study Nook' | 'Fireplace' |
  'Solar Geyser' | 'Fiber Internet Ready';

// Request/Response interfaces
export interface UnitCreateRequest {
  unitNumber: string;
  estate: string;
  specifications: UnitSpecifications;
  charges: UnitCharges;
  meter?: string; // Optional - will be auto-generated
  amenities?: UnitAmenity[];
  images?: Omit<UnitImage, 'url'>[];
}

export interface UnitUpdateRequest extends Partial<UnitCreateRequest> {
  status?: UnitStatus;
  tenant?: string;
  lease?: LeaseInfo;
  isActive?: boolean;
}

export interface UnitSearchRequest {
  page?: number;
  limit?: number;
  search?: string;
  estate?: string;
  status?: UnitStatus;
  bedrooms?: number;
  bathrooms?: number;
  minRent?: number;
  maxRent?: number;
  amenities?: UnitAmenity[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UnitStats {
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  maintenanceUnits: number;
  reservedUnits: number;
  averageRent: number;
  occupancyRate: number;
  expiringLeases: number;
}

// Re-export related interfaces for convenience
export interface Estate {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Meter {
  id: string;
  meterNumber: string;
  serialNumber?: string;
}