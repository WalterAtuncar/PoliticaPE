import { useState, useEffect, useCallback } from 'react';
import { 
  DataFilters, 
  DatabaseMetrics, 
  SchemaInfo, 
  TableInfo, 
  DataSource, 
  ETLPipeline, 
  DataAlert, 
  DataQualityMetrics,
  BackupInfo,
  DataLineageNode,
  DataLineageLink
} from '../types/data';

// Mock data generator
const generateMockDatabaseMetrics = (): DatabaseMetrics => {
  return {
    totalTables: 128,
    totalSize: 1250, // GB
    totalRows: 1850000000,
    queriesPerSecond: 125,
    avgQueryTime: 45, // ms
    cacheHitRatio: 0.92,
    uptime: 99.98,
    lastBackup: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    activeConnections: 42,
    cpuUsage: 38,
    memoryUsage: 72,
    diskUsage: 68,
    replicationLag: 1.2, // seconds
    slowQueries: 3,
    deadlocks: 0,
    failedJobs: 2,
  };
};

// Generate mock schema info
const generateMockSchemas = (): SchemaInfo[] => {
  return [
    {
      id: 'raw_data',
      name: 'raw_data',
      description: 'Datos crudos sin procesar de diversas fuentes',
      tables: 32,
      size: 450, // GB
      rows: 850000000,
      status: 'healthy',
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      avgGrowthRate: 2.8, // GB per day
      backupStatus: 'success',
      owner: 'data_admin',
    },
    {
      id: 'realtime_data',
      name: 'realtime_data',
      description: 'Datos en tiempo real de redes sociales y monitoreo',
      tables: 18,
      size: 280, // GB
      rows: 420000000,
      status: 'warning',
      lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      avgGrowthRate: 5.2, // GB per day
      backupStatus: 'success',
      owner: 'realtime_service',
    },
    {
      id: 'analytics',
      name: 'analytics',
      description: 'Datos procesados y agregados para análisis',
      tables: 45,
      size: 320, // GB
      rows: 380000000,
      status: 'healthy',
      lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      avgGrowthRate: 1.5, // GB per day
      backupStatus: 'success',
      owner: 'analytics_service',
    },
    {
      id: 'geography',
      name: 'geography',
      description: 'Datos geográficos y demográficos del Perú',
      tables: 12,
      size: 85, // GB
      rows: 120000000,
      status: 'healthy',
      lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      avgGrowthRate: 0.2, // GB per day
      backupStatus: 'success',
      owner: 'geo_admin',
    },
    {
      id: 'auth',
      name: 'auth',
      description: 'Datos de autenticación y autorización',
      tables: 8,
      size: 15, // GB
      rows: 5000000,
      status: 'healthy',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      avgGrowthRate: 0.05, // GB per day
      backupStatus: 'success',
      owner: 'auth_service',
    },
    {
      id: 'system',
      name: 'system',
      description: 'Datos de configuración y operación del sistema',
      tables: 13,
      size: 100, // GB
      rows: 75000000,
      status: 'critical',
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      avgGrowthRate: 0.8, // GB per day
      backupStatus: 'warning',
      owner: 'system_admin',
    },
  ];
};

// Generate mock tables for a schema
const generateMockTables = (schemaId: string): TableInfo[] => {
  const tables: TableInfo[] = [];
  
  const tableCount = schemaId === 'raw_data' ? 32 :
                     schemaId === 'realtime_data' ? 18 :
                     schemaId === 'analytics' ? 45 :
                     schemaId === 'geography' ? 12 :
                     schemaId === 'auth' ? 8 : 13;
  
  const tableNames = {
    raw_data: ['social_posts', 'news_articles', 'political_events', 'candidate_statements', 'media_mentions'],
    realtime_data: ['live_mentions', 'trending_topics', 'sentiment_stream', 'engagement_metrics', 'viral_content'],
    analytics: ['sentiment_analysis', 'engagement_stats', 'regional_metrics', 'demographic_insights', 'campaign_performance'],
    geography: ['departments', 'provinces', 'districts', 'electoral_zones', 'demographic_data'],
    auth: ['users', 'roles', 'permissions', 'sessions', 'audit_logs'],
    system: ['configurations', 'schedules', 'logs', 'alerts', 'metrics'],
  };
  
  const names = tableNames[schemaId as keyof typeof tableNames] || ['table'];
  
  for (let i = 0; i < tableCount; i++) {
    const baseName = names[i % names.length];
    const name = i < names.length ? baseName : `${baseName}_${Math.floor(i / names.length) + 1}`;
    
    tables.push({
      id: `${schemaId}.${name}`,
      name,
      schema: schemaId,
      rows: Math.floor(Math.random() * 50000000) + 1000000,
      size: Math.floor(Math.random() * 50) + 5, // GB
      columns: Math.floor(Math.random() * 30) + 5,
      indexes: Math.floor(Math.random() * 8) + 1,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
      avgQueriesPerMinute: Math.floor(Math.random() * 500) + 10,
      status: Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'healthy',
      dataQuality: Math.random() * 30 + 70, // 70-100%
      hasPartitions: Math.random() > 0.5,
      partitionCount: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 2 : 0,
      hasForeignKeys: Math.random() > 0.3,
      primaryKey: 'id',
    });
  }
  
  return tables;
};

// Generate mock data sources
const generateMockDataSources = (): DataSource[] => {
  return [
    {
      id: 'twitter_api',
      name: 'Twitter API',
      type: 'social_media',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      avgRecordsPerDay: 1250000,
      errorRate: 0.02,
      targetSchema: 'raw_data',
      targetTable: 'social_posts',
      config: {
        apiVersion: 'v2',
        rateLimit: '900 requests/15min',
        authentication: 'OAuth 2.0',
      },
      healthChecks: {
        connectivity: 'passed',
        authentication: 'passed',
        dataQuality: 'warning',
        performance: 'passed',
      },
    },
    {
      id: 'facebook_api',
      name: 'Facebook API',
      type: 'social_media',
      status: 'warning',
      lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      avgRecordsPerDay: 850000,
      errorRate: 0.08,
      targetSchema: 'raw_data',
      targetTable: 'social_posts',
      config: {
        apiVersion: 'v15.0',
        rateLimit: '200 requests/hour',
        authentication: 'OAuth 2.0',
      },
      healthChecks: {
        connectivity: 'passed',
        authentication: 'warning',
        dataQuality: 'passed',
        performance: 'warning',
      },
    },
    {
      id: 'news_scraper',
      name: 'News Scraper',
      type: 'scraper',
      status: 'connected',
      lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      avgRecordsPerDay: 25000,
      errorRate: 0.05,
      targetSchema: 'raw_data',
      targetTable: 'news_articles',
      config: {
        sources: 'El Comercio, La República, Gestión, RPP',
        frequency: '15 minutes',
        parser: 'BeautifulSoup',
      },
      healthChecks: {
        connectivity: 'passed',
        authentication: 'passed',
        dataQuality: 'passed',
        performance: 'passed',
      },
    },
    {
      id: 'inei_api',
      name: 'INEI API',
      type: 'government',
      status: 'error',
      lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      avgRecordsPerDay: 5000,
      errorRate: 0.25,
      targetSchema: 'geography',
      targetTable: 'demographic_data',
      config: {
        apiVersion: 'v1',
        rateLimit: '1000 requests/day',
        authentication: 'API Key',
      },
      healthChecks: {
        connectivity: 'failed',
        authentication: 'passed',
        dataQuality: 'warning',
        performance: 'warning',
      },
    },
    {
      id: 'onpe_api',
      name: 'ONPE API',
      type: 'government',
      status: 'connected',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      avgRecordsPerDay: 10000,
      errorRate: 0.03,
      targetSchema: 'raw_data',
      targetTable: 'electoral_data',
      config: {
        apiVersion: 'v2',
        rateLimit: '500 requests/day',
        authentication: 'API Key',
      },
      healthChecks: {
        connectivity: 'passed',
        authentication: 'passed',
        dataQuality: 'passed',
        performance: 'passed',
      },
    },
  ];
};

// Generate mock ETL pipelines
const generateMockETLPipelines = (): ETLPipeline[] => {
  return [
    {
      id: 'social_sentiment_etl',
      name: 'Social Media Sentiment ETL',
      status: 'running',
      type: 'batch',
      schedule: 'Every 15 minutes',
      lastRun: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      nextRun: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
      avgDuration: 8.5, // minutes
      source: 'raw_data.social_posts',
      destination: 'analytics.sentiment_analysis',
      recordsProcessed: 1250000,
      errorRate: 0.02,
      steps: [
        { name: 'Extract from raw_data', status: 'completed', duration: 2.1 },
        { name: 'Text preprocessing', status: 'completed', duration: 1.8 },
        { name: 'Sentiment analysis', status: 'running', duration: 3.2 },
        { name: 'Geographic enrichment', status: 'pending', duration: 0 },
        { name: 'Load to analytics', status: 'pending', duration: 0 },
      ],
      logs: [
        { timestamp: new Date(Date.now() - 12 * 60 * 1000), level: 'info', message: 'Pipeline started' },
        { timestamp: new Date(Date.now() - 10 * 60 * 1000), level: 'info', message: 'Extracted 1.25M records' },
        { timestamp: new Date(Date.now() - 8 * 60 * 1000), level: 'info', message: 'Text preprocessing completed' },
        { timestamp: new Date(Date.now() - 5 * 60 * 1000), level: 'warning', message: 'High CPU usage detected' },
      ],
    },
    {
      id: 'geographic_enrichment_etl',
      name: 'Geographic Data Enrichment',
      status: 'completed',
      type: 'batch',
      schedule: 'Daily at 02:00',
      lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000), // 16 hours from now
      avgDuration: 45.2, // minutes
      source: 'raw_data.social_posts,geography.districts',
      destination: 'analytics.geographic_insights',
      recordsProcessed: 3500000,
      errorRate: 0.01,
      steps: [
        { name: 'Extract from raw_data', status: 'completed', duration: 8.3 },
        { name: 'Extract from geography', status: 'completed', duration: 2.1 },
        { name: 'Geocoding', status: 'completed', duration: 15.7 },
        { name: 'Join datasets', status: 'completed', duration: 12.5 },
        { name: 'Aggregate by region', status: 'completed', duration: 5.2 },
        { name: 'Load to analytics', status: 'completed', duration: 1.4 },
      ],
      logs: [
        { timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), level: 'info', message: 'Pipeline started' },
        { timestamp: new Date(Date.now() - 7.8 * 60 * 60 * 1000), level: 'info', message: 'Extracted 3.5M records' },
        { timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000), level: 'info', message: 'Geocoding started' },
        { timestamp: new Date(Date.now() - 7.2 * 60 * 60 * 1000), level: 'error', message: 'Geocoding error for 1250 records' },
        { timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), level: 'info', message: 'Pipeline completed successfully' },
      ],
    },
    {
      id: 'realtime_sentiment_stream',
      name: 'Realtime Sentiment Stream',
      status: 'error',
      type: 'streaming',
      schedule: 'Continuous',
      lastRun: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      nextRun: null, // Continuous
      avgDuration: 0, // Continuous
      source: 'twitter_api,facebook_api',
      destination: 'realtime_data.sentiment_stream',
      recordsProcessed: 12500,
      errorRate: 0.15,
      steps: [
        { name: 'Connect to Twitter API', status: 'completed', duration: 0 },
        { name: 'Connect to Facebook API', status: 'error', duration: 0 },
        { name: 'Process stream', status: 'warning', duration: 0 },
        { name: 'Write to realtime_data', status: 'warning', duration: 0 },
      ],
      logs: [
        { timestamp: new Date(Date.now() - 15 * 60 * 1000), level: 'info', message: 'Stream processing started' },
        { timestamp: new Date(Date.now() - 14 * 60 * 1000), level: 'info', message: 'Connected to Twitter API' },
        { timestamp: new Date(Date.now() - 13 * 60 * 1000), level: 'error', message: 'Failed to connect to Facebook API: Rate limit exceeded' },
        { timestamp: new Date(Date.now() - 12 * 60 * 1000), level: 'warning', message: 'Processing with limited data sources' },
      ],
    },
  ];
};

// Generate mock data quality metrics
const generateMockDataQualityMetrics = (): DataQualityMetrics => {
  return {
    overallScore: 87.5,
    completeness: 92.3,
    accuracy: 88.7,
    consistency: 85.1,
    validity: 91.8,
    uniqueness: 94.2,
    timeliness: 82.9,
    bySchema: [
      { schema: 'raw_data', score: 78.5, issues: 1250 },
      { schema: 'realtime_data', score: 82.3, issues: 850 },
      { schema: 'analytics', score: 94.7, issues: 320 },
      { schema: 'geography', score: 97.2, issues: 45 },
      { schema: 'auth', score: 98.5, issues: 12 },
      { schema: 'system', score: 89.8, issues: 180 },
    ],
    topIssues: [
      { table: 'raw_data.social_posts', issue: 'Missing location data', count: 458, severity: 'medium' },
      { table: 'realtime_data.sentiment_stream', issue: 'Duplicate records', count: 325, severity: 'high' },
      { table: 'raw_data.news_articles', issue: 'Invalid dates', count: 287, severity: 'medium' },
      { table: 'system.logs', issue: 'Truncated messages', count: 156, severity: 'low' },
      { table: 'analytics.regional_metrics', issue: 'Inconsistent region codes', count: 98, severity: 'high' },
    ],
    recentRuns: [
      { id: 'dq-1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), tables: 128, issues: 2850, status: 'completed' },
      { id: 'dq-2', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), tables: 128, issues: 3120, status: 'completed' },
      { id: 'dq-3', timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000), tables: 126, issues: 3450, status: 'completed' },
    ],
  };
};

// Generate mock backup info
const generateMockBackupInfo = (): BackupInfo[] => {
  return [
    {
      id: 'backup-1',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      type: 'full',
      size: 1250, // GB
      status: 'completed',
      duration: 45, // minutes
      location: 'AWS S3',
      retentionDays: 30,
      schemas: ['raw_data', 'realtime_data', 'analytics', 'geography', 'auth', 'system'],
      compressionRatio: 0.65,
    },
    {
      id: 'backup-2',
      timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000),
      type: 'full',
      size: 1220, // GB
      status: 'completed',
      duration: 42, // minutes
      location: 'AWS S3',
      retentionDays: 30,
      schemas: ['raw_data', 'realtime_data', 'analytics', 'geography', 'auth', 'system'],
      compressionRatio: 0.67,
    },
    {
      id: 'backup-3',
      timestamp: new Date(Date.now() - 56 * 60 * 60 * 1000),
      type: 'full',
      size: 1180, // GB
      status: 'completed',
      duration: 40, // minutes
      location: 'AWS S3',
      retentionDays: 30,
      schemas: ['raw_data', 'realtime_data', 'analytics', 'geography', 'auth', 'system'],
      compressionRatio: 0.68,
    },
    {
      id: 'backup-4',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'incremental',
      size: 85, // GB
      status: 'completed',
      duration: 12, // minutes
      location: 'AWS S3',
      retentionDays: 7,
      schemas: ['raw_data', 'realtime_data'],
      compressionRatio: 0.72,
    },
    {
      id: 'backup-5',
      timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
      type: 'incremental',
      size: 78, // GB
      status: 'completed',
      duration: 10, // minutes
      location: 'AWS S3',
      retentionDays: 7,
      schemas: ['raw_data', 'realtime_data'],
      compressionRatio: 0.71,
    },
  ];
};

// Generate mock data lineage
const generateMockDataLineage = (): { nodes: DataLineageNode[], links: DataLineageLink[] } => {
  const nodes: DataLineageNode[] = [
    { id: 'raw_social', name: 'raw_data.social_posts', type: 'source', status: 'active' },
    { id: 'raw_news', name: 'raw_data.news_articles', type: 'source', status: 'active' },
    { id: 'geo_districts', name: 'geography.districts', type: 'source', status: 'active' },
    
    { id: 'etl_sentiment', name: 'Sentiment Analysis ETL', type: 'process', status: 'active' },
    { id: 'etl_geo', name: 'Geographic Enrichment', type: 'process', status: 'active' },
    { id: 'etl_news', name: 'News Processing', type: 'process', status: 'warning' },
    
    { id: 'analytics_sentiment', name: 'analytics.sentiment_analysis', type: 'target', status: 'active' },
    { id: 'analytics_geo', name: 'analytics.geographic_insights', type: 'target', status: 'active' },
    { id: 'analytics_news', name: 'analytics.news_insights', type: 'target', status: 'warning' },
    
    { id: 'etl_aggregate', name: 'Metrics Aggregation', type: 'process', status: 'active' },
    
    { id: 'analytics_dashboard', name: 'analytics.dashboard_metrics', type: 'target', status: 'active' },
  ];
  
  const links: DataLineageLink[] = [
    { source: 'raw_social', target: 'etl_sentiment', value: 1 },
    { source: 'raw_news', target: 'etl_news', value: 1 },
    { source: 'geo_districts', target: 'etl_geo', value: 1 },
    { source: 'raw_social', target: 'etl_geo', value: 1 },
    
    { source: 'etl_sentiment', target: 'analytics_sentiment', value: 1 },
    { source: 'etl_geo', target: 'analytics_geo', value: 1 },
    { source: 'etl_news', target: 'analytics_news', value: 1 },
    
    { source: 'analytics_sentiment', target: 'etl_aggregate', value: 1 },
    { source: 'analytics_geo', target: 'etl_aggregate', value: 1 },
    { source: 'analytics_news', target: 'etl_aggregate', value: 1 },
    
    { source: 'etl_aggregate', target: 'analytics_dashboard', value: 1 },
  ];
  
  return { nodes, links };
};

// Generate mock alerts
const generateMockAlerts = (): DataAlert[] => {
  return [
    {
      id: 'alert-1',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'performance',
      severity: 'high',
      status: 'active',
      message: 'High CPU usage detected on database server (85%)',
      source: 'system.metrics',
      affectedComponents: ['PostgreSQL Server'],
      metrics: { value: 85, threshold: 75, unit: '%' },
    },
    {
      id: 'alert-2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'data_quality',
      severity: 'medium',
      status: 'active',
      message: 'Increased rate of missing location data in social posts',
      source: 'raw_data.social_posts',
      affectedComponents: ['Geographic Enrichment ETL'],
      metrics: { value: 12.5, threshold: 5, unit: '%' },
    },
    {
      id: 'alert-3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'pipeline',
      severity: 'critical',
      status: 'active',
      message: 'Facebook API connection failed: Rate limit exceeded',
      source: 'facebook_api',
      affectedComponents: ['Social Media ETL', 'Realtime Sentiment Stream'],
      metrics: { value: 0, threshold: 1, unit: 'connections' },
    },
    {
      id: 'alert-4',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'storage',
      severity: 'low',
      status: 'resolved',
      message: 'Approaching storage limit on analytics schema (85% used)',
      source: 'analytics',
      affectedComponents: ['Analytics Database'],
      metrics: { value: 85, threshold: 90, unit: '%' },
      resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'alert-5',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      type: 'security',
      severity: 'high',
      status: 'resolved',
      message: 'Multiple failed login attempts detected',
      source: 'auth.audit_logs',
      affectedComponents: ['Authentication Service'],
      metrics: { value: 25, threshold: 10, unit: 'attempts' },
      resolvedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
    },
  ];
};

export const useDataManagement = (filters: DataFilters) => {
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>(generateMockDatabaseMetrics());
  const [schemas, setSchemas] = useState<SchemaInfo[]>(generateMockSchemas());
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>(generateMockDataSources());
  const [etlPipelines, setEtlPipelines] = useState<ETLPipeline[]>(generateMockETLPipelines());
  const [alerts, setAlerts] = useState<DataAlert[]>(generateMockAlerts());
  const [dataQualityMetrics, setDataQualityMetrics] = useState<DataQualityMetrics>(generateMockDataQualityMetrics());
  const [backups, setBackups] = useState<BackupInfo[]>(generateMockBackupInfo());
  const [dataLineage, setDataLineage] = useState(generateMockDataLineage());
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load tables for selected schema
  useEffect(() => {
    if (filters.schema !== 'all') {
      setTables(generateMockTables(filters.schema));
    } else {
      // Load tables for all schemas
      const allTables: TableInfo[] = [];
      schemas.forEach(schema => {
        allTables.push(...generateMockTables(schema.id));
      });
      setTables(allTables);
    }
  }, [filters.schema, schemas]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDatabaseMetrics(generateMockDatabaseMetrics());
    setSchemas(generateMockSchemas());
    setDataSources(generateMockDataSources());
    setEtlPipelines(generateMockETLPipelines());
    setAlerts(generateMockAlerts());
    setDataQualityMetrics(generateMockDataQualityMetrics());
    setBackups(generateMockBackupInfo());
    setDataLineage(generateMockDataLineage());
    
    setIsRefreshing(false);
  }, []);

  // Filter tables based on filters
  const filteredTables = tables.filter(table => {
    if (filters.search && !table.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.status !== 'all' && table.status !== filters.status) {
      return false;
    }
    
    if (filters.volume !== 'all') {
      if (filters.volume === 'high' && table.rows < 1000000) return false;
      if (filters.volume === 'medium' && (table.rows < 100000 || table.rows >= 1000000)) return false;
      if (filters.volume === 'low' && table.rows >= 100000) return false;
    }
    
    return true;
  });

  // Filter ETL pipelines based on filters
  const filteredPipelines = etlPipelines.filter(pipeline => {
    if (filters.search && !pipeline.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.status !== 'all') {
      if (filters.status === 'healthy' && pipeline.status !== 'running' && pipeline.status !== 'completed') return false;
      if (filters.status === 'warning' && pipeline.status !== 'warning') return false;
      if (filters.status === 'critical' && pipeline.status !== 'error' && pipeline.status !== 'failed') return false;
    }
    
    return true;
  });

  // Filter alerts based on filters
  const filteredAlerts = alerts.filter(alert => {
    if (filters.search && !alert.message.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.severity !== 'all' && alert.severity !== filters.severity) {
      return false;
    }
    
    if (filters.status !== 'all') {
      if (filters.status === 'healthy' && alert.status !== 'resolved') return false;
      if (filters.status === 'critical' && alert.status !== 'active') return false;
    }
    
    return true;
  });

  return {
    databaseMetrics,
    schemas,
    tables: filteredTables,
    dataSources,
    etlPipelines: filteredPipelines,
    alerts: filteredAlerts,
    dataQualityMetrics,
    backups,
    dataLineage,
    isLoading,
    isRefreshing,
    refreshData,
  };
};