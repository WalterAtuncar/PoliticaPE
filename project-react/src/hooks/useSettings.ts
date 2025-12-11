import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Role,
  Permission,
  AuditLog,
  APIKey,
  SystemConfig,
  UserSession,
  BulkOperation,
  SettingsFilters
} from '../types/settings';

// Mock data generators
const generateMockUsers = (): User[] => {
  return [
    {
      id: 'user-1',
      email: 'carlos.mendoza@politicape.com',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: 'super_admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      permissions: ['*'],
      loginAttempts: 0,
      twoFactorEnabled: true,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          sms: false,
          alerts: {
            security: true,
            system: true,
            campaigns: true,
            analytics: true
          },
          frequency: 'immediate'
        },
        dashboard: {
          layout: 'grid',
          widgets: ['metrics', 'alerts', 'activity'],
          refreshInterval: 30,
          defaultView: 'dashboard'
        }
      }
    },
    {
      id: 'user-2',
      email: 'maria.torres@politicape.com',
      firstName: 'María',
      lastName: 'Torres',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e8db2d?w=150',
      role: 'analytics_manager',
      status: 'active',
      lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      createdAt: new Date('2023-02-20'),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      permissions: ['analytics.*', 'dashboard.read', 'reports.*'],
      loginAttempts: 0,
      twoFactorEnabled: true,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false,
          alerts: {
            security: false,
            system: true,
            campaigns: true,
            analytics: true
          },
          frequency: 'hourly'
        },
        dashboard: {
          layout: 'list',
          widgets: ['analytics', 'trends', 'reports'],
          refreshInterval: 60,
          defaultView: 'analytics'
        }
      }
    },
    {
      id: 'user-3',
      email: 'luis.garcia@politicape.com',
      firstName: 'Luis',
      lastName: 'García',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'campaign_coordinator',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      permissions: ['campaigns.*', 'dashboard.read', 'social.read'],
      loginAttempts: 1,
      twoFactorEnabled: false,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'auto',
        notifications: {
          email: true,
          push: false,
          sms: false,
          alerts: {
            security: false,
            system: false,
            campaigns: true,
            analytics: false
          },
          frequency: 'daily'
        },
        dashboard: {
          layout: 'grid',
          widgets: ['campaigns', 'social', 'performance'],
          refreshInterval: 120,
          defaultView: 'campaigns'
        }
      }
    },
    {
      id: 'user-4',
      email: 'ana.vargas@politicape.com',
      firstName: 'Ana',
      lastName: 'Vargas',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      role: 'data_analyst',
      status: 'active',
      lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      createdAt: new Date('2023-04-05'),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: ['data.*', 'analytics.read', 'dashboard.read'],
      loginAttempts: 0,
      twoFactorEnabled: true,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          sms: false,
          alerts: {
            security: false,
            system: true,
            campaigns: false,
            analytics: true
          },
          frequency: 'immediate'
        },
        dashboard: {
          layout: 'list',
          widgets: ['data', 'quality', 'pipelines'],
          refreshInterval: 30,
          defaultView: 'data'
        }
      }
    },
    {
      id: 'user-5',
      email: 'pedro.silva@politicape.com',
      firstName: 'Pedro',
      lastName: 'Silva',
      role: 'viewer',
      status: 'suspended',
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      permissions: ['dashboard.read'],
      loginAttempts: 5,
      twoFactorEnabled: false,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'light',
        notifications: {
          email: false,
          push: false,
          sms: false,
          alerts: {
            security: false,
            system: false,
            campaigns: false,
            analytics: false
          },
          frequency: 'weekly'
        },
        dashboard: {
          layout: 'grid',
          widgets: ['overview'],
          refreshInterval: 300,
          defaultView: 'dashboard'
        }
      }
    }
  ];
};

const generateMockRoles = (): Role[] => {
  return [
    {
      id: 'super_admin',
      name: 'Super Administrador',
      description: 'Acceso completo a todas las funcionalidades del sistema',
      permissions: [
        { id: 'all', module: '*', action: '*', resource: '*', description: 'Todos los permisos' }
      ],
      isSystem: true,
      userCount: 1,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'analytics_manager',
      name: 'Gerente de Analytics',
      description: 'Gestión completa de analytics y reportes',
      permissions: [
        { id: 'analytics_read', module: 'analytics', action: 'read', resource: '*', description: 'Ver analytics' },
        { id: 'analytics_write', module: 'analytics', action: 'write', resource: '*', description: 'Editar analytics' },
        { id: 'analytics_export', module: 'analytics', action: 'export', resource: '*', description: 'Exportar reportes' },
        { id: 'dashboard_read', module: 'dashboard', action: 'read', resource: '*', description: 'Ver dashboard' },
        { id: 'reports_all', module: 'reports', action: '*', resource: '*', description: 'Gestión de reportes' }
      ],
      isSystem: false,
      userCount: 1,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-02-01')
    },
    {
      id: 'campaign_coordinator',
      name: 'Coordinador de Campañas',
      description: 'Gestión de campañas y contenido social',
      permissions: [
        { id: 'campaigns_read', module: 'campaigns', action: 'read', resource: '*', description: 'Ver campañas' },
        { id: 'campaigns_write', module: 'campaigns', action: 'write', resource: '*', description: 'Editar campañas' },
        { id: 'campaigns_create', module: 'campaigns', action: 'create', resource: '*', description: 'Crear campañas' },
        { id: 'campaigns_delete', module: 'campaigns', action: 'delete', resource: '*', description: 'Eliminar campañas' },
        { id: 'social_read', module: 'social', action: 'read', resource: '*', description: 'Ver redes sociales' },
        { id: 'dashboard_read', module: 'dashboard', action: 'read', resource: '*', description: 'Ver dashboard' }
      ],
      isSystem: false,
      userCount: 1,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-03-01')
    },
    {
      id: 'data_analyst',
      name: 'Analista de Datos',
      description: 'Análisis y gestión de datos',
      permissions: [
        { id: 'data_read', module: 'data', action: 'read', resource: '*', description: 'Ver datos' },
        { id: 'data_write', module: 'data', action: 'write', resource: '*', description: 'Editar datos' },
        { id: 'data_admin', module: 'data', action: 'admin', resource: '*', description: 'Administrar datos' },
        { id: 'analytics_read', module: 'analytics', action: 'read', resource: '*', description: 'Ver analytics' },
        { id: 'dashboard_read', module: 'dashboard', action: 'read', resource: '*', description: 'Ver dashboard' }
      ],
      isSystem: false,
      userCount: 1,
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-03-15')
    },
    {
      id: 'viewer',
      name: 'Visualizador',
      description: 'Solo lectura del dashboard principal',
      permissions: [
        { id: 'dashboard_read', module: 'dashboard', action: 'read', resource: '*', description: 'Ver dashboard' }
      ],
      isSystem: false,
      userCount: 1,
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-03-01')
    }
  ];
};

const generateMockAuditLogs = (): AuditLog[] => {
  return [
    {
      id: 'audit-1',
      userId: 'user-1',
      userName: 'Carlos Mendoza',
      action: 'user.create',
      resource: 'users',
      details: 'Creó nuevo usuario: Ana Vargas',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success',
      changes: [
        { field: 'email', oldValue: null, newValue: 'ana.vargas@politicape.com' },
        { field: 'role', oldValue: null, newValue: 'data_analyst' },
        { field: 'status', oldValue: null, newValue: 'active' }
      ]
    },
    {
      id: 'audit-2',
      userId: 'user-2',
      userName: 'María Torres',
      action: 'role.update',
      resource: 'roles',
      details: 'Modificó permisos del rol Analytics Manager',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'success',
      changes: [
        { field: 'permissions', oldValue: 'analytics.read', newValue: 'analytics.read,analytics.export' }
      ]
    },
    {
      id: 'audit-3',
      userId: 'user-5',
      userName: 'Pedro Silva',
      action: 'auth.login_failed',
      resource: 'authentication',
      details: 'Intento de login fallido - credenciales incorrectas',
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'failure'
    },
    {
      id: 'audit-4',
      userId: 'user-3',
      userName: 'Luis García',
      action: 'campaign.create',
      resource: 'campaigns',
      details: 'Creó nueva campaña: Elecciones Regionales 2024',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: 'success',
      changes: [
        { field: 'name', oldValue: null, newValue: 'Elecciones Regionales 2024' },
        { field: 'budget', oldValue: null, newValue: '50000' },
        { field: 'status', oldValue: null, newValue: 'active' }
      ]
    },
    {
      id: 'audit-5',
      userId: 'user-1',
      userName: 'Carlos Mendoza',
      action: 'system.config_update',
      resource: 'system_config',
      details: 'Actualizó configuración de seguridad',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'success',
      changes: [
        { field: 'sessionTimeout', oldValue: '3600', newValue: '7200' },
        { field: 'twoFactorRequired', oldValue: false, newValue: true }
      ]
    }
  ];
};

const generateMockAPIKeys = (): APIKey[] => {
  return [
    {
      id: 'api-1',
      name: 'Twitter API v2',
      service: 'twitter',
      key: 'tw_****_****_****_abcd',
      secret: 'tw_secret_****_****_efgh',
      status: 'active',
      lastUsed: new Date(Date.now() - 15 * 60 * 1000),
      usageCount: 125000,
      rateLimit: 900,
      createdAt: new Date('2023-01-15'),
      expiresAt: new Date('2024-01-15'),
      permissions: ['read', 'write']
    },
    {
      id: 'api-2',
      name: 'Facebook Graph API',
      service: 'facebook',
      key: 'fb_****_****_****_1234',
      secret: 'fb_secret_****_****_5678',
      status: 'warning',
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      usageCount: 89000,
      rateLimit: 200,
      createdAt: new Date('2023-02-01'),
      expiresAt: new Date('2024-02-01'),
      permissions: ['read']
    },
    {
      id: 'api-3',
      name: 'OpenAI GPT-4',
      service: 'openai',
      key: 'sk-****_****_****_wxyz',
      status: 'active',
      lastUsed: new Date(Date.now() - 45 * 60 * 1000),
      usageCount: 15000,
      rateLimit: 3000,
      createdAt: new Date('2023-03-01'),
      permissions: ['read', 'write']
    },
    {
      id: 'api-4',
      name: 'Servicio Geográfico Nacional',
      service: 'geographic',
      key: 'geo_****_****_****_9876',
      status: 'active',
      lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      usageCount: 5000,
      rateLimit: 1000,
      createdAt: new Date('2023-02-15'),
      permissions: ['read']
    },
    {
      id: 'api-5',
      name: 'Custom Analytics API',
      service: 'custom',
      key: 'custom_****_****_****_abcd',
      status: 'expired',
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      usageCount: 0,
      rateLimit: 500,
      createdAt: new Date('2023-01-01'),
      expiresAt: new Date('2023-12-31'),
      permissions: ['read']
    }
  ];
};

const generateMockSystemConfig = (): SystemConfig => {
  return {
    general: {
      companyName: 'PoliticaPE',
      logo: '/logo.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      timezone: 'America/Lima',
      language: 'es',
      dataRetentionDays: 365,
      maintenanceMode: false,
      allowRegistration: false
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        expirationDays: 90,
        historyCount: 5
      },
      sessionTimeout: 7200,
      maxConcurrentSessions: 3,
      twoFactorRequired: true,
      ipWhitelistEnabled: false,
      allowedIPs: [],
      loginAttemptLimit: 5,
      lockoutDuration: 1800
    },
    notifications: {
      emailTemplates: [
        {
          id: 'welcome',
          name: 'Bienvenida',
          subject: 'Bienvenido a PoliticaPE',
          content: 'Hola {{firstName}}, bienvenido a la plataforma...',
          type: 'welcome',
          variables: ['firstName', 'lastName', 'email']
        }
      ],
      pushSettings: {
        enabled: true,
        vapidPublicKey: 'BK***',
        vapidPrivateKey: 'pk***'
      },
      alertThresholds: {
        performance: {
          cpuUsage: 80,
          memoryUsage: 85,
          diskUsage: 90,
          responseTime: 2000
        },
        security: {
          failedLogins: 5,
          suspiciousActivity: 10
        },
        system: {
          errorRate: 5,
          queueLength: 1000
        }
      },
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'noreply@politicape.com',
        password: '****',
        fromEmail: 'noreply@politicape.com',
        fromName: 'PoliticaPE'
      }
    },
    integrations: {
      database: {
        host: 'localhost',
        port: 5432,
        database: 'politicape',
        username: 'postgres',
        password: '****',
        ssl: true,
        poolSize: 20,
        connectionTimeout: 30000,
        status: 'connected',
        lastHealthCheck: new Date(Date.now() - 5 * 60 * 1000)
      },
      redis: {
        host: 'localhost',
        port: 6379,
        password: '****',
        database: 0,
        status: 'connected',
        lastHealthCheck: new Date(Date.now() - 2 * 60 * 1000)
      },
      externalAPIs: [
        {
          id: 'twitter-api',
          name: 'Twitter API',
          url: 'https://api.twitter.com/2/',
          status: 'active',
          lastHealthCheck: new Date(Date.now() - 10 * 60 * 1000),
          responseTime: 250,
          errorRate: 0.5
        },
        {
          id: 'facebook-api',
          name: 'Facebook Graph API',
          url: 'https://graph.facebook.com/',
          status: 'active',
          lastHealthCheck: new Date(Date.now() - 15 * 60 * 1000),
          responseTime: 180,
          errorRate: 1.2
        }
      ]
    },
    backup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12
      },
      storage: {
        type: 's3',
        path: 's3://politicape-backups/',
        credentials: {
          accessKey: 'AKIA****',
          secretKey: '****'
        }
      },
      compression: true,
      encryption: true,
      lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextBackup: new Date(Date.now() + 18 * 60 * 60 * 1000)
    }
  };
};

const generateMockUserSessions = (): UserSession[] => {
  return [
    {
      id: 'session-1',
      userId: 'user-1',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Lima, Perú',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'session-2',
      userId: 'user-2',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Arequipa, Perú',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active'
    }
  ];
};

export const useSettings = (filters: SettingsFilters) => {
  const [users, setUsers] = useState<User[]>(generateMockUsers());
  const [roles, setRoles] = useState<Role[]>(generateMockRoles());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(generateMockAuditLogs());
  const [apiKeys, setAPIKeys] = useState<APIKey[]>(generateMockAPIKeys());
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(generateMockSystemConfig());
  const [userSessions, setUserSessions] = useState<UserSession[]>(generateMockUserSessions());
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter users based on filters
  const filteredUsers = users.filter(user => {
    if (filters.search && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.status !== 'all' && user.status !== filters.status) {
      return false;
    }
    
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    
    return true;
  });

  // Filter audit logs based on filters
  const filteredAuditLogs = auditLogs.filter(log => {
    if (filters.search && !log.details.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.dateRange.start && log.timestamp < filters.dateRange.start) {
      return false;
    }
    
    if (filters.dateRange.end && log.timestamp > filters.dateRange.end) {
      return false;
    }
    
    return true;
  });

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUsers(generateMockUsers());
    setRoles(generateMockRoles());
    setAuditLogs(generateMockAuditLogs());
    setAPIKeys(generateMockAPIKeys());
    setSystemConfig(generateMockSystemConfig());
    setUserSessions(generateMockUserSessions());
    
    setIsRefreshing(false);
  }, []);

  // User management functions
  const createUser = useCallback(async (userData: Partial<User>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: userData.role || 'viewer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
      loginAttempts: 0,
      twoFactorEnabled: false,
      preferences: {
        language: 'es',
        timezone: 'America/Lima',
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          sms: false,
          alerts: {
            security: false,
            system: false,
            campaigns: false,
            analytics: false
          },
          frequency: 'daily'
        },
        dashboard: {
          layout: 'grid',
          widgets: ['overview'],
          refreshInterval: 300,
          defaultView: 'dashboard'
        }
      }
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsLoading(false);
    
    return newUser;
  }, []);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, ...userData, updatedAt: new Date() }
        : user
    ));
    
    setIsLoading(false);
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    setIsLoading(false);
  }, []);

  // API Key management
  const createAPIKey = useCallback(async (keyData: Partial<APIKey>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newKey: APIKey = {
      id: `api-${Date.now()}`,
      name: keyData.name || '',
      service: keyData.service || 'custom',
      key: `key_${Math.random().toString(36).substring(2, 15)}`,
      status: 'active',
      usageCount: 0,
      rateLimit: keyData.rateLimit || 1000,
      createdAt: new Date(),
      permissions: keyData.permissions || ['read']
    };
    
    setAPIKeys(prev => [...prev, newKey]);
    setIsLoading(false);
    
    return newKey;
  }, []);

  const rotateAPIKey = useCallback(async (keyId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAPIKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, key: `key_${Math.random().toString(36).substring(2, 15)}`, updatedAt: new Date() }
        : key
    ));
    
    setIsLoading(false);
  }, []);

  // System config update
  const updateSystemConfig = useCallback(async (configData: Partial<SystemConfig>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSystemConfig(prev => ({ ...prev, ...configData }));
    setIsLoading(false);
  }, []);

  return {
    users: filteredUsers,
    roles,
    auditLogs: filteredAuditLogs,
    apiKeys,
    systemConfig,
    userSessions,
    bulkOperations,
    isLoading,
    isRefreshing,
    refreshData,
    createUser,
    updateUser,
    deleteUser,
    createAPIKey,
    rotateAPIKey,
    updateSystemConfig
  };
}; 