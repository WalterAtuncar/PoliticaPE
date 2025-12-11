export interface DataFilters {
  schema: string;
  timeRange: string;
  status: string;
  severity: string;
  volume: string;
  search: string;
}

export interface DatabaseMetrics {
  totalTables: number;
  totalSize: number; // GB
  totalRows: number;
  queriesPerSecond: number;
  avgQueryTime: number; // ms
  cacheHitRatio: number;
  uptime: number; // percentage
  lastBackup: Date;
  activeConnections: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  replicationLag: number; // seconds
  slowQueries: number;
  deadlocks: number;
  failedJobs: number;
}

export interface SchemaInfo {
  id: string;
  name: string;
  description: string;
  tables: number;
  size: number; // GB
  rows: number;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  lastUpdated: Date;
  avgGrowthRate: number; // GB per day
  backupStatus: 'success' | 'warning' | 'error';
  owner: string;
}

export interface TableInfo {
  id: string;
  name: string;
  schema: string;
  rows: number;
  size: number; // GB
  columns: number;
  indexes: number;
  lastUpdated: Date;
  avgQueriesPerMinute: number;
  status: 'healthy' | 'warning' | 'critical';
  dataQuality: number; // percentage
  hasPartitions: boolean;
  partitionCount: number;
  hasForeignKeys: boolean;
  primaryKey: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'social_media' | 'scraper' | 'government' | 'api' | 'file_import';
  status: 'connected' | 'warning' | 'error' | 'maintenance';
  lastSync: Date;
  avgRecordsPerDay: number;
  errorRate: number;
  targetSchema: string;
  targetTable: string;
  config: Record<string, string>;
  healthChecks: {
    connectivity: 'passed' | 'warning' | 'failed';
    authentication: 'passed' | 'warning' | 'failed';
    dataQuality: 'passed' | 'warning' | 'failed';
    performance: 'passed' | 'warning' | 'failed';
  };
}

export interface ETLPipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'warning' | 'error' | 'scheduled';
  type: 'batch' | 'streaming';
  schedule: string;
  lastRun: Date;
  nextRun: Date | null;
  avgDuration: number; // minutes
  source: string;
  destination: string;
  recordsProcessed: number;
  errorRate: number;
  steps: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error' | 'warning';
    duration: number; // minutes
  }[];
  logs: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
}

export interface DataAlert {
  id: string;
  timestamp: Date;
  type: 'performance' | 'data_quality' | 'pipeline' | 'storage' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'acknowledged';
  message: string;
  source: string;
  affectedComponents: string[];
  metrics: {
    value: number;
    threshold: number;
    unit: string;
  };
  resolvedAt?: Date;
}

export interface DataQualityMetrics {
  overallScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  timeliness: number;
  bySchema: {
    schema: string;
    score: number;
    issues: number;
  }[];
  topIssues: {
    table: string;
    issue: string;
    count: number;
    severity: 'high' | 'medium' | 'low';
  }[];
  recentRuns: {
    id: string;
    timestamp: Date;
    tables: number;
    issues: number;
    status: 'completed' | 'failed' | 'running';
  }[];
}

export interface DataLineageNode {
  id: string;
  name: string;
  type: 'source' | 'process' | 'target';
  status: 'active' | 'warning' | 'error';
}

export interface DataLineageLink {
  source: string;
  target: string;
  value: number;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number; // GB
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  duration: number; // minutes
  location: string;
  retentionDays: number;
  schemas: string[];
  compressionRatio: number;
}