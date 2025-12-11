import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Search, 
  Filter, 
  Image, 
  Video, 
  FileText, 
  Music,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Campaign } from '../../types/campaigns';

interface AssetLibraryProps {
  onBack: () => void;
  campaigns: Campaign[];
}

const assetTypes = [
  { id: 'all', label: 'Todos', icon: FileText },
  { id: 'image', label: 'Imágenes', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'document', label: 'Documentos', icon: FileText },
];

const mockAssets = [
  {
    id: '1',
    name: 'Banner Principal Lima Norte',
    type: 'image',
    url: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?w=400&h=300&fit=crop',
    size: 2.4,
    uploadedAt: new Date('2024-12-01'),
    uploadedBy: 'María González',
    tags: ['banner', 'lima', 'digital'],
    approvalStatus: 'approved',
    campaigns: ['Campaña Digital Lima Norte'],
  },
  {
    id: '2',
    name: 'Video Testimonial Arequipa',
    type: 'video',
    url: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=400&h=300&fit=crop',
    size: 45.2,
    uploadedAt: new Date('2024-11-28'),
    uploadedBy: 'Carlos Mendoza',
    tags: ['testimonial', 'arequipa', 'video'],
    approvalStatus: 'pending',
    campaigns: ['Fortalecimiento Regional Cusco'],
  },
  {
    id: '3',
    name: 'Spot Radio Nacional',
    type: 'audio',
    url: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?w=400&h=300&fit=crop',
    size: 8.7,
    uploadedAt: new Date('2024-11-25'),
    uploadedBy: 'Ana Rodríguez',
    tags: ['radio', 'spot', 'nacional'],
    approvalStatus: 'approved',
    campaigns: ['Movilización Juvenil Nacional'],
  },
  {
    id: '4',
    name: 'Infografía Propuestas',
    type: 'image',
    url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=400&h=300&fit=crop',
    size: 1.8,
    uploadedAt: new Date('2024-11-22'),
    uploadedBy: 'Luis Torres',
    tags: ['infografía', 'propuestas', 'educativo'],
    approvalStatus: 'approved',
    campaigns: ['Awareness Programa Social'],
  },
  {
    id: '5',
    name: 'Presentación Ejecutiva',
    type: 'document',
    url: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?w=400&h=300&fit=crop',
    size: 12.3,
    uploadedAt: new Date('2024-11-20'),
    uploadedBy: 'Patricia Silva',
    tags: ['presentación', 'ejecutiva', 'estrategia'],
    approvalStatus: 'approved',
    campaigns: ['Campaña Territorial Arequipa'],
  },
  {
    id: '6',
    name: 'Video Evento Plaza Mayor',
    type: 'video',
    url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=400&h=300&fit=crop',
    size: 78.5,
    uploadedAt: new Date('2024-11-18'),
    uploadedBy: 'Roberto Díaz',
    tags: ['evento', 'plaza', 'transmisión'],
    approvalStatus: 'approved',
    campaigns: ['Evento Masivo Plaza Mayor'],
  },
];

const approvalStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const approvalStatusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onBack,
  campaigns,
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredAssets = mockAssets.filter(asset => {
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSelectAsset = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) 
        ? prev.filter(assetId => assetId !== id)
        : [...prev, id]
    );
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Biblioteca de Assets
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona creatividades, videos, audios y documentos de campaña
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowUploadModal(true)}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Asset
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              {assetTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAssets.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAssets.length} seleccionados
              </span>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset, index) => {
          const Icon = getAssetIcon(asset.type);
          const isSelected = selectedAssets.includes(asset.id);
          
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass className={`p-4 hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
                {/* Asset Preview */}
                <div className="relative mb-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {asset.type === 'image' || asset.type === 'video' ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectAsset(asset.id)}
                    className="absolute top-2 left-2 h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />

                  {/* Asset Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {asset.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Approval Status */}
                  <div className="absolute bottom-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${approvalStatusColors[asset.approvalStatus as keyof typeof approvalStatusColors]}`}>
                      {approvalStatusLabels[asset.approvalStatus as keyof typeof approvalStatusLabels]}
                    </span>
                  </div>
                </div>

                {/* Asset Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                      {asset.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(asset.size)} • {formatDate(asset.uploadedAt)}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        +{asset.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Campaigns */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Usado en:
                    </p>
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      {asset.campaigns.slice(0, 2).join(', ')}
                      {asset.campaigns.length > 2 && ` +${asset.campaigns.length - 2} más`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      por {asset.uploadedBy}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subir Nuevo Asset
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Arrastra archivos aquí o haz click para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Máximo 100MB • JPG, PNG, MP4, MP3, PDF
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del asset
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Nombre descriptivo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separados por comas)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="banner, digital, lima"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaña asociada
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="">Seleccionar campaña</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Asset
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron assets
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sube tu primer asset para comenzar'}
          </p>
          <Button
            onClick={() => setShowUploadModal(true)}
            variant="primary"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Subir Asset
          </Button>
        </div>
      )}
    </motion.div>
  );
};