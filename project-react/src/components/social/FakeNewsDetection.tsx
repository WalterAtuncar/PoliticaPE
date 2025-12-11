import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  X, 
  ExternalLink, 
  MessageSquare,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Info,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialPost, SocialFilters } from '../../types/social';

interface FakeNewsDetectionProps {
  posts: SocialPost[];
  isLoading: boolean;
  filters: SocialFilters;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: MessageSquare,
  youtube: Youtube,
};

const platformColors = {
  twitter: '#1DA1F2',
  facebook: '#4267B2',
  instagram: '#E4405F',
  tiktok: '#000000',
  youtube: '#FF0000',
};

const riskLevels = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

export const FakeNewsDetection: React.FC<FakeNewsDetectionProps> = ({
  posts,
  isLoading,
  filters,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [verifiedPosts, setVerifiedPosts] = useState<string[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleVerify = (postId: string) => {
    setVerifiedPosts(prev => [...prev, postId]);
    setFlaggedPosts(prev => prev.filter(id => id !== postId));
  };

  const handleFlag = (postId: string) => {
    setFlaggedPosts(prev => [...prev, postId]);
    setVerifiedPosts(prev => prev.filter(id => id !== postId));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Filter posts that are potentially fake news
  const suspiciousPosts = posts.filter(post => post.fakeNewsScore && post.fakeNewsScore > 0.3);
  
  // Apply additional filters
  const filteredPosts = suspiciousPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === 'all' || 
      (riskFilter === 'high' && post.fakeNewsScore && post.fakeNewsScore >= 0.7) ||
      (riskFilter === 'medium' && post.fakeNewsScore && post.fakeNewsScore >= 0.4 && post.fakeNewsScore < 0.7) ||
      (riskFilter === 'low' && post.fakeNewsScore && post.fakeNewsScore < 0.4);
    
    return matchesSearch && matchesRisk;
  });

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 0.7) return 'Alto';
    if (score >= 0.4) return 'Medio';
    return 'Bajo';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detección de Fake News
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suspiciousPosts.length} publicaciones potencialmente falsas detectadas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </form>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todos los niveles</option>
              <option value="high">Riesgo alto</option>
              <option value="medium">Riesgo medio</option>
              <option value="low">Riesgo bajo</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Fake News Detection System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspicious Posts List */}
        <div className="lg:col-span-2">
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Contenido Sospechoso
            </h3>
            
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => {
                  const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || MessageSquare;
                  const isSelected = selectedPost === post.id;
                  const isVerified = verifiedPosts.includes(post.id);
                  const isFlagged = flaggedPosts.includes(post.id);
                  const riskLevel = getRiskLevel(post.fakeNewsScore || 0);
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedPost(isSelected ? null : post.id)}
                      className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      } ${
                        isVerified ? 'border-green-300 dark:border-green-700' : 
                        isFlagged ? 'border-red-300 dark:border-red-700' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {post.author}
                              </h4>
                              <PlatformIcon 
                                className="h-4 w-4" 
                                style={{ color: platformColors[post.platform as keyof typeof platformColors] || '#6B7280' }}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatTimeAgo(post.timestamp)}</span>
                              <span>•</span>
                              <span>{post.region}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${riskLevels[riskLevel]}`}>
                            Riesgo {getRiskLabel(post.fakeNewsScore || 0)}
                          </span>
                          
                          {isVerified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                              Verificado
                            </span>
                          )}
                          
                          {isFlagged && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium">
                              Falso
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            <span>Score: {(post.fakeNewsScore || 0).toFixed(2)}</span>
                          </div>
                          
                          {post.fakeNewsCategories && (
                            <div className="flex items-center space-x-1">
                              <Info className="h-3 w-3 text-blue-500" />
                              <span>{post.fakeNewsCategories.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(post.id);
                            }}
                            className={`p-1 rounded ${
                              isVerified ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlag(post.id);
                            }}
                            className={`p-1 rounded ${
                              isFlagged ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          <a 
                            href="#" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No se encontró contenido sospechoso
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No hay publicaciones que coincidan con los filtros seleccionados
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setRiskFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Fact Checking Panel */}
        <div>
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Panel de Fact-Checking
            </h3>
            
            {selectedPost ? (
              <div className="space-y-4">
                {(() => {
                  const post = posts.find(p => p.id === selectedPost);
                  if (!post) return null;
                  
                  const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || MessageSquare;
                  const riskLevel = getRiskLevel(post.fakeNewsScore || 0);
                  
                  return (
                    <>
                      <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {post.author}
                              </h4>
                              <PlatformIcon 
                                className="h-4 w-4" 
                                style={{ color: platformColors[post.platform as keyof typeof platformColors] || '#6B7280' }}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatTimeAgo(post.timestamp)}</span>
                              <span>•</span>
                              <span>{post.region}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                          {post.content}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-300">
                            Análisis de Veracidad
                          </h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-yellow-800 dark:text-yellow-400">Score de Falsedad</span>
                              <span className={`font-medium ${
                                riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                                riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-green-600 dark:text-green-400'
                              }`}>
                                {(post.fakeNewsScore || 0).toFixed(2)}/1.0
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  riskLevel === 'high' ? 'bg-red-500' :
                                  riskLevel === 'medium' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(post.fakeNewsScore || 0) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm text-yellow-800 dark:text-yellow-400">Categorías detectadas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.fakeNewsCategories?.map((category, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm text-yellow-800 dark:text-yellow-400">Elementos sospechosos:</span>
                            <ul className="mt-1 space-y-1 text-xs text-yellow-800 dark:text-yellow-400">
                              {post.fakeNewsElements?.map((element, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-yellow-500">•</span>
                                  <span>{element}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-medium text-blue-900 dark:text-blue-300">
                            Verificación de Hechos
                          </h4>
                        </div>
                        
                        <div className="space-y-3">
                          {post.factChecking?.map((fact, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-start space-x-2 mb-1">
                                <span className="font-medium text-blue-800 dark:text-blue-400">Afirmación:</span>
                                <span className="text-gray-800 dark:text-gray-200">{fact.claim}</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <span className="font-medium text-blue-800 dark:text-blue-400">Verificación:</span>
                                <span className="text-gray-800 dark:text-gray-200">{fact.verification}</span>
                              </div>
                              {fact.source && (
                                <div className="flex items-start space-x-2 mt-1">
                                  <span className="font-medium text-blue-800 dark:text-blue-400">Fuente:</span>
                                  <a 
                                    href="#" 
                                    className="text-blue-600 hover:underline"
                                  >
                                    {fact.source}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleVerify(post.id)}
                            variant={verifiedPosts.includes(post.id) ? 'primary' : 'outline'}
                            size="sm"
                            className={verifiedPosts.includes(post.id) ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Verificado
                          </Button>
                          
                          <Button
                            onClick={() => handleFlag(post.id)}
                            variant={flaggedPosts.includes(post.id) ? 'primary' : 'outline'}
                            size="sm"
                            className={flaggedPosts.includes(post.id) ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Falso
                          </Button>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver original
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Selecciona un contenido
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Haz clic en una publicación para verificar su contenido
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Fake News Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Estadísticas de Desinformación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Detectadas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {suspiciousPosts.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Riesgo Alto</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {suspiciousPosts.filter(p => p.fakeNewsScore && p.fakeNewsScore >= 0.7).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verificadas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {verifiedPosts.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {flaggedPosts.length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Categorías de Desinformación
              </h4>
              <div className="space-y-3">
                {[
                  { category: 'Información falsa', count: 28, percentage: 35 },
                  { category: 'Información engañosa', count: 22, percentage: 27.5 },
                  { category: 'Información manipulada', count: 15, percentage: 18.75 },
                  { category: 'Información fabricada', count: 10, percentage: 12.5 },
                  { category: 'Sátira/Parodia', count: 5, percentage: 6.25 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-900 dark:text-white w-40">
                      {item.category}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Fuentes de Desinformación
              </h4>
              <div className="space-y-3">
                {[
                  { source: 'Cuentas anónimas', count: 32, percentage: 40 },
                  { source: 'Cuentas verificadas', count: 18, percentage: 22.5 },
                  { source: 'Medios alternativos', count: 15, percentage: 18.75 },
                  { source: 'Bots', count: 10, percentage: 12.5 },
                  { source: 'Otros', count: 5, percentage: 6.25 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-900 dark:text-white w-40">
                      {item.source}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Recomendaciones para Combatir Desinformación
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Implementar campaña educativa sobre verificación de fuentes y detección de noticias falsas dirigida a seguidores.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Establecer protocolo de respuesta rápida para desmentir información falsa sobre propuestas políticas, especialmente en temas económicos.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Crear sección de "Verificación de Hechos" en sitio web oficial y compartir regularmente en redes sociales.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Monitorear activamente cuentas identificadas como fuentes recurrentes de desinformación para respuesta proactiva.</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};