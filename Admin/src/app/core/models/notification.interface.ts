// Notification Model Interfaces for Khanyi Vending System

export interface Notification {
  id: string;
  recipient: NotificationRecipient;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  actions: NotificationAction[];
  channels: NotificationChannels;
  schedule: NotificationSchedule;
  stats: NotificationStats;
  metadata: NotificationMetadata;
  status: NotificationStatus;
  relatedEntities?: RelatedEntities;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface NotificationRecipient {
  user?: string; // User ID for individual notifications
  criteria?: NotificationCriteria; // For broadcast notifications
}

export interface NotificationCriteria {
  role: string[]; // ['tenant', 'estate_admin']
  estate?: string; // Estate ID
  units: string[]; // Unit IDs
  balanceBelow?: number; // Target users with balance below this amount
  lastLoginBefore?: Date; // Target inactive users
}

export interface NotificationAction {
  id: string;
  label: string;
  type: ActionType;
  value: string;
  style: ActionStyle;
}

export interface NotificationChannels {
  inApp: ChannelStatus;
  email: EmailChannelStatus;
  sms: SmsChannelStatus;
  push: PushChannelStatus;
}

export interface ChannelStatus {
  enabled: boolean;
  delivered: boolean;
  read?: boolean;
  clicked?: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
}

export interface EmailChannelStatus extends ChannelStatus {
  opened?: boolean;
  openedAt?: Date;
}

export interface SmsChannelStatus extends ChannelStatus {
  phoneNumber?: string;
}

export interface PushChannelStatus extends ChannelStatus {
  deviceTokens?: string[];
}

export interface NotificationSchedule {
  sendAt?: Date;
  recurring?: RecurringSchedule;
  timezone: string;
}

export interface RecurringSchedule {
  enabled: boolean;
  frequency?: RecurringFrequency;
  interval?: number;
  endDate?: Date;
  maxOccurrences?: number;
}

export interface NotificationStats {
  totalRecipients: number;
  deliveryAttempts: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  readCount: number;
  clickCount: number;
  lastDeliveryAttempt?: Date;
}

export interface NotificationMetadata {
  source: string;
  tags: string[];
  campaignId?: string;
  templateId?: string;
}

export interface RelatedEntities {
  unit?: RelatedUnit;
  meter?: string;
  purchase?: string;
  incident?: string;
  estate?: string;
}

export interface RelatedUnit {
  id: string;
  unitNumber: string;
  fullIdentifier: string;
  leaseStatus: string;
  description: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: string[];
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  recipient: NotificationRecipient;
  channels: string[];
  actions?: NotificationActionRequest[];
  schedule?: NotificationScheduleRequest;
  metadata?: Partial<NotificationMetadata>;
  expiresAt?: Date;
}

export interface NotificationActionRequest {
  label: string;
  type: ActionType;
  value: string;
  style?: ActionStyle;
}

export interface NotificationScheduleRequest {
  sendAt?: Date;
  recurring?: RecurringScheduleRequest;
  timezone?: string;
}

export interface RecurringScheduleRequest {
  frequency: RecurringFrequency;
  interval?: number;
  endDate?: Date;
  maxOccurrences?: number;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  criteria: NotificationCriteria;
  channels: string[];
  schedule?: NotificationScheduleRequest;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface NotificationSearchRequest {
  userId?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  startDate?: Date;
  endDate?: Date;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationAnalytics {
  totalNotifications: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  channelPerformance: ChannelPerformance[];
  typeBreakdown: TypeBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  engagementTrends: EngagementTrend[];
}

export interface ChannelPerformance {
  channel: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
}

export interface TypeBreakdown {
  type: NotificationType;
  count: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: NotificationCategory;
  count: number;
  percentage: number;
}

export interface EngagementTrend {
  date: Date;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
}

export type NotificationType =
  | 'system_alert'
  | 'maintenance_notice'
  | 'payment_reminder'
  | 'low_balance'
  | 'purchase_success'
  | 'purchase_failed'
  | 'account_update'
  | 'promotional'
  | 'general';

export type NotificationCategory =
  | 'System'
  | 'Maintenance'
  | 'Billing'
  | 'Account'
  | 'Marketing'
  | 'Security'
  | 'General';

export type NotificationPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type NotificationStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed' | 'Cancelled';

export type ActionType = 'URL' | 'Deep Link' | 'API Call' | 'Dismiss';

export type ActionStyle = 'Primary' | 'Secondary' | 'Success' | 'Warning' | 'Danger';

export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type VariableType = 'string' | 'number' | 'date' | 'boolean' | 'currency';