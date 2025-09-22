// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any[];
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  role: 'tenant' | 'estate_admin' | 'system_admin';
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  units?: Unit[];
  managedEstates?: Estate[];
}

// Estate Types
export interface Estate {
  _id: string;
  name: string;
  description?: string;
  type: 'Residential' | 'Student Housing' | 'Mixed Use';
  address: {
    street: string;
    suburb?: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  tariff: {
    rate: number;
    currency: string;
    unit: string;
    lastUpdated: Date;
  };
  management?: {
    company: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  amenities: string[];
  isActive: boolean;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  formattedTariff: string;
  fullAddress: string;
  createdAt: Date;
}

// Unit Types
export interface Unit {
  _id: string;
  unitNumber: string;
  estate: Estate;
  tenant?: User;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  specifications?: {
    bedrooms: number;
    bathrooms: number;
    area: {
      size: number;
      unit: string;
    };
    floor: number;
    hasBalcony: boolean;
    hasGarden: boolean;
    parking: {
      spaces: number;
      covered: boolean;
    };
  };
  charges?: {
    monthlyRent: number;
    deposit: number;
  };
  lease?: {
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
    deposit: number;
    status: string;
  };
  meter?: Meter;
  isActive: boolean;
  createdAt: Date;
}

// Meter Types
export interface Meter {
  _id: string;
  meterNumber: string;
  serialNumber: string;
  unit: string;
  specifications: {
    manufacturer: string;
    model: string;
    type: 'Prepaid' | 'Postpaid' | 'Smart';
    maxLoad: {
      value: number;
      unit: string;
    };
    voltage: {
      value: number;
      unit: string;
    };
    phases: 1 | 3;
  };
  status: 'Active' | 'Inactive' | 'Faulty' | 'Maintenance' | 'Disconnected';
  currentBalance: {
    amount: number;
    units: string;
    lastUpdated: Date;
  };
  installation: {
    date: Date;
    technician?: string;
    location?: string;
  };
  balanceStatus: 'Critical' | 'Low' | 'Normal';
  dailyAverageConsumption: number;
  estimatedDaysRemaining?: number;
  createdAt: Date;
}

// Purchase Types
export interface Purchase {
  _id: string;
  transactionId: string;
  user: User;
  unit: Unit;
  meter: Meter;
  amount: number;
  unitsReceived: number;
  tariffRate: number;
  token: {
    value: string;
    type: string;
    expiryDate: Date;
    isUsed: boolean;
    usedDate?: Date;
  };
  payment: {
    method: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
    reference?: string;
    paidAt?: Date;
    failureReason?: string;
  };
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
  delivery: {
    method: string;
    destination: string;
    deliveredAt?: Date;
    attempts: number;
  };
  fees: {
    transactionFee: number;
    serviceFee: number;
    vatAmount: number;
    totalFees: number;
  };
  totalAmount: number;
  formattedToken: string;
  deliveryStatus: string;
  createdAt: Date;
}

// Incident Types
export interface Incident {
  _id: string;
  incidentNumber: string;
  reporter: {
    user: string;
    name: string;
    phone: string;
    email: string;
  };
  category: string;
  subcategory?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency';
  severity: 'Minor' | 'Major' | 'Critical';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Pending Customer' | 'Pending Internal' | 'Escalated' | 'Resolved' | 'Closed' | 'Cancelled';
  unit?: Unit;
  meter?: Meter;
  purchase?: Purchase;
  assignedTo?: {
    user: User;
    team: string;
    assignedAt: Date;
  };
  resolution?: {
    summary: string;
    details: string;
    resolvedBy: User;
    resolvedAt: Date;
    resolutionTime: number;
  };
  sla: {
    responseTime: number;
    resolutionTime: number;
    responseDeadline: Date;
    resolutionDeadline: Date;
    isBreached: boolean;
  };
  communications: Array<{
    type: string;
    content: string;
    timestamp: Date;
    user: User;
    direction: 'Inbound' | 'Outbound' | 'Internal';
    isPublic: boolean;
  }>;
  ageInHours: number;
  slaStatus: 'Breached' | 'Overdue' | 'Response Overdue' | 'On Track';
  createdAt: Date;
}

// Notification Types
export interface Notification {
  _id: string;
  recipient: {
    user: string;
  };
  title: string;
  message: string;
  type: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  channels: {
    inApp: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      read: boolean;
      readAt?: Date;
    };
    email: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      opened: boolean;
      openedAt?: Date;
      subject?: string;
    };
    sms: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      phoneNumber?: string;
    };
    push: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      clicked: boolean;
      clickedAt?: Date;
    };
  };
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed' | 'Cancelled';
  stats: {
    totalRecipients: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    readCount: number;
    clickCount: number;
  };
  deliveryStatus: 'No Channels' | 'Pending' | 'Delivered' | 'Partial';
  engagementRate: number;
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEstates: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  totalPurchases: number;
  totalRevenue: number;
  openIncidents: number;
  criticalIncidents: number;
  recentActivity: {
    purchases: Purchase[];
    incidents: Incident[];
    newUsers: User[];
  };
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  [key: string]: any;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateEstateForm {
  name: string;
  description?: string;
  type: string;
  address: {
    street: string;
    suburb?: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  tariff: {
    rate: number;
    currency: string;
    unit: string;
  };
  management?: {
    company: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  amenities: string[];
}

export interface CreateUnitForm {
  unitNumber: string;
  estate: string;
  specifications?: {
    bedrooms: number;
    bathrooms: number;
    area: {
      size: number;
      unit: string;
    };
    floor: number;
    hasBalcony: boolean;
    hasGarden: boolean;
    parking: {
      spaces: number;
      covered: boolean;
    };
  };
  charges?: {
    monthlyRent: number;
    deposit: number;
  };
}

export interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  password: string;
  role: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}