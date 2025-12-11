import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Database,
  Box,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataLineageNode, DataLineageLink } from '../../types/data';

interface DataLineageProps {
  dataLineage: {
    nodes: DataLineageNode[];
    links: DataLineageLink[];
  };
  isLoading: boolean;
}

export const DataLineage: React.FC<DataLineageProps> = ({ dataLineage, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const getNodeColor = (type: string, status: string) => {
    if (status === 'error' || status === 'failed') return '#EF4444'; // red
    if (status === 'warning') return '#F59E0B'; // yellow
    
    switch (type) {
      case 'source': return '#3B82F6'; // blue
      case 'process': return '#8B5CF6'; // purple
      case 'target': return '#10B981'; // green
      default: return '#6B7280'; // gray
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source': return <Database className="h-4 w-4" />;
      case 'process': return <Box className="h-4 w-4" />;
      case 'target': return <Database className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const filteredNodes = dataLineage.nodes.filter(node => 
    searchTerm ? node.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const filteredLinks = dataLineage.links.filter(link => 
    filteredNodes.some(node => node.id === link.source) && 
    filteredNodes.some(node => node.id === link.target)
  );

  // Simple force-directed layout simulation
  const nodePositions: Record<string, { x: number, y: number }> = {};
  const nodeWidth = 180;
  const nodeHeight = 60;
  const horizontalSpacing = 250;
  const verticalSpacing = 100;

  // Group nodes by type
  const sourceNodes = filteredNodes.filter(node => node.type === 'source');
  const processNodes = filteredNodes.filter(node => node.type === 'process');
  const targetNodes = filteredNodes.filter(node => node.type === 'target');

  // Position nodes in columns by type
  sourceNodes.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100,
      y: 100 + index * (nodeHeight + verticalSpacing)
    };
  });

  processNodes.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100 + horizontalSpacing,
      y: 100 + index * (nodeHeight + verticalSpacing)
    };
  });

  targetNodes.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100 + horizontalSpacing * 2,
      y: 100 + index * (nodeHeight + verticalSpacing)
    };
  });

  // Calculate SVG dimensions
  const maxX = Math.max(...Object.values(nodePositions).map(pos => pos.x)) + nodeWidth + 100;
  const maxY = Math.max(...Object.values(nodePositions).map(pos => pos.y)) + nodeHeight + 100;

  // Generate path for links
  const generatePath = (link: DataLineageLink) => {
    const source = nodePositions[link.source];
    const target = nodePositions[link.target];
    
    if (!source || !target) return '';
    
    const sourceX = source.x + nodeWidth;
    const sourceY = source.y + nodeHeight / 2;
    const targetX = target.x;
    const targetY = target.y + nodeHeight / 2;
    
    return `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Linaje de Datos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualización de flujos y transformaciones de datos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nodos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                variant="outline"
                size="sm"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                variant="outline"
                size="sm"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lineage Visualization */}
      <Card glass className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Fuente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Proceso</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Destino</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Warning</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-auto border border-gray-200/50 dark:border-gray-700/50 rounded-lg" style={{ height: '600px' }}>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.3s ease' }}>
              <svg width={maxX} height={maxY} className="bg-white/30 dark:bg-gray-900/30">
                {/* Links */}
                {filteredLinks.map((link) => (
                  <g key={`${link.source}-${link.target}`}>
                    <path
                      d={generatePath(link)}
                      stroke={selectedNode && (selectedNode === link.source || selectedNode === link.target) ? '#3B82F6' : '#9CA3AF'}
                      strokeWidth={selectedNode && (selectedNode === link.source || selectedNode === link.target) ? 3 : 2}
                      fill="none"
                      strokeDasharray={selectedNode && (selectedNode === link.source || selectedNode === link.target) ? '' : '5,5'}
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                      </marker>
                    </defs>
                  </g>
                ))}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const position = nodePositions[node.id] || { x: 0, y: 0 };
                  const isSelected = selectedNode === node.id;
                  
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${position.x}, ${position.y})`}
                      onClick={() => setSelectedNode(isSelected ? null : node.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        width={nodeWidth}
                        height={nodeHeight}
                        rx={8}
                        fill={getNodeColor(node.type, node.status)}
                        fillOpacity={0.2}
                        stroke={getNodeColor(node.type, node.status)}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={isSelected ? 1 : 0.6}
                      />
                      <foreignObject width={nodeWidth} height={nodeHeight}>
                        <div
                          className="h-full flex items-center px-3"
                          style={{ fontFamily: 'sans-serif' }}
                        >
                          <div className="mr-2">
                            {getNodeIcon(node.type)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-sm font-medium truncate">{node.name}</div>
                            <div className="text-xs opacity-70">{node.type}</div>
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles del Nodo
            </h3>
            
            {(() => {
              const node = dataLineage.nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Información General
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{node.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{node.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                        <span className={`text-sm font-medium ${
                          node.status === 'active' ? 'text-green-600 dark:text-green-400' :
                          node.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {node.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Conexiones
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fuentes:</h5>
                        <div className="space-y-1">
                          {dataLineage.links
                            .filter(link => link.target === node.id)
                            .map(link => {
                              const sourceNode = dataLineage.nodes.find(n => n.id === link.source);
                              return (
                                <div key={link.source} className="flex items-center space-x-2 text-sm">
                                  <Database className="h-3 w-3 text-blue-500" />
                                  <span className="text-gray-900 dark:text-white">{sourceNode?.name}</span>
                                </div>
                              );
                            })}
                          {dataLineage.links.filter(link => link.target === node.id).length === 0 && (
                            <span className="text-sm text-gray-500">Ninguna</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destinos:</h5>
                        <div className="space-y-1">
                          {dataLineage.links
                            .filter(link => link.source === node.id)
                            .map(link => {
                              const targetNode = dataLineage.nodes.find(n => n.id === link.target);
                              return (
                                <div key={link.target} className="flex items-center space-x-2 text-sm">
                                  <ArrowRight className="h-3 w-3 text-green-500" />
                                  <span className="text-gray-900 dark:text-white">{targetNode?.name}</span>
                                </div>
                              );
                            })}
                          {dataLineage.links.filter(link => link.source === node.id).length === 0 && (
                            <span className="text-sm text-gray-500">Ninguno</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  );
};