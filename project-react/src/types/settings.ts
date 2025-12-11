export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  permissions: string[];
  loginAttempts: number;
  twoFactorEnabled: boolean;
  ipWhitelist?: string[];
}

export interface UserPreferences {
  language: 'es' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  alerts: {
    security: boolean;
    system: boolean;
    campaigns: boolean;
    analytics: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: string[];
  refreshInterval: number;
  defaultView: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  resource: string;
  description: string;
}

export interface PermissionMatrix {
  [module: string]: {
    [action: string]: boolean;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failure';
  changes?: {
    field: string;
    oldValue: string | number | boolean | null;
    newValue: string | number | boolean | null;
  }[];
}

export interface APIKey {
  id: string;
  name: string;
  service: 'twitter' | 'facebook' | 'openai' | 'geographic' | 'custom';
  key: string;
  secret?: string;
  status: 'active' | 'inactive' | 'expired';
  lastUsed?: Date;
  usageCount: number;
  rateLimit: number;
  createdAt: Date;
  expiresAt?: Date;
  permissions: string[];
}

export interface SystemConfig {
  general: GeneralConfig;
  security: SecurityConfig;
  notifications: NotificationConfig;
  integrations: IntegrationConfig;
  backup: BackupConfig;
}

export interface GeneralConfig {
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  language: string;
  dataRetentionDays: number;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expirationDays: number;
    historyCount: number;
  };
  sessionTimeout: number;
  maxConcurrentSessions: number;
  twoFactorRequired: boolean;
  ipWhitelistEnabled: boolean;
  allowedIPs: string[];
  loginAttemptLimit: number;
  lockoutDuration: number;
}

export interface NotificationConfig {
  emailTemplates: EmailTemplate[];
  pushSettings: PushSettings;
  alertThresholds: AlertThresholds;
  smtpConfig: SMTPConfig;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'password_reset' | 'alert' | 'report';
  variables: string[];
}

export interface PushSettings {
  enabled: boolean;
  vapidPublicKey: string;
  vapidPrivateKey: string;
}

export interface AlertThresholds {
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivity: number;
  };
  system: {
    errorRate: number;
    queueLength: number;
  };
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface IntegrationConfig {
  database: DatabaseConfig;
  redis: RedisConfig;
  externalAPIs: ExternalAPIConfig[];
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  status: 'connected' | 'disconnected' | 'error';
  lastHealthCheck?: Date;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
  status: 'connected' | 'disconnected' | 'error';
  lastHealthCheck?: Date;
}

export interface ExternalAPIConfig {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastHealthCheck?: Date;
  responseTime?: number;
  errorRate: number;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    type: 'local' | 's3' | 'gcs';
    path: string;
    credentials?: Record<string, string>;
  };
  compression: boolean;
  encryption: boolean;
  lastBackup?: Date;
  nextBackup?: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'expired';
}

export interface BulkOperation {
  id: string;
  type: 'user_import' | 'user_export' | 'role_assignment' | 'notification_send';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface SettingsFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'suspended';
  role: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} 