import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Download,
  Check,
  X,
  Clock,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
  Image,
  Video,
  FileText,
  Link
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ContentEvent, SocialFilters } from '../../types/social';

interface ContentCalendarProps {
  calendar: ContentEvent[];
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

const contentTypeIcons = {
  image: Image,
  video: Video,
  text: FileText,
  link: Link,
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  calendar,
  isLoading,
  filters,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ContentEvent | null>(null);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getEventsForDate = (date: Date) => {
    return calendar.filter(event => {
      const eventDate = new Date(event.scheduledDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1 border border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      days.push(
        <div 
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-24 p-1 border border-gray-200/30 dark:border-gray-700/30 overflow-hidden transition-colors ${
            isToday 
              ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' 
              : isSelected
                ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50'
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
          } cursor-pointer`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {events.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                {events.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {events.slice(0, 2).map((event, idx) => {
              const PlatformIcon = platformIcons[event.platform as keyof typeof platformIcons] || MessageSquare;
              
              return (
                <div 
                  key={idx}
                  className="text-xs p-1 rounded truncate flex items-center space-x-1"
                  style={{ 
                    backgroundColor: `${platformColors[event.platform as keyof typeof platformColors]}20`,
                    color: platformColors[event.platform as keyof typeof platformColors]
                  }}
                >
                  <PlatformIcon className="h-2 w-2 flex-shrink-0" />
                  <span className="truncate">{event.title}</span>
                </div>
              );
            })}
            {events.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                +{events.length - 2} más
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-px">
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const date = selectedDate || new Date();
    const events = getEventsForDate(date);
    
    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {date.getDate()} de {months[date.getMonth()]} de {date.getFullYear()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {weekdays[date.getDay()]}
          </p>
        </div>
        
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => {
              const PlatformIcon = platformIcons[event.platform as keyof typeof platformIcons] || MessageSquare;
              const ContentTypeIcon = contentTypeIcons[event.contentType as keyof typeof contentTypeIcons] || FileText;
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: `${platformColors[event.platform as keyof typeof platformColors]}20`,
                        }}
                      >
                        <PlatformIcon 
                          className="h-5 w-5" 
                          style={{ color: platformColors[event.platform as keyof typeof platformColors] }}
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(event.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded ${statusColors[event.status]}`}>
                            {event.status === 'draft' ? 'Borrador' :
                             event.status === 'scheduled' ? 'Programado' :
                             event.status === 'published' ? 'Publicado' :
                             event.status === 'pending_approval' ? 'Pendiente' : 'Rechazado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <ContentTypeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {event.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {event.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay contenido programado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay publicaciones programadas para esta fecha
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowNewEventModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Programar Contenido
            </Button>
          </div>
        )}
      </div>
    );
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
      {/* Calendar Header */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Calendario Editorial
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {calendar.length} publicaciones programadas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Controls */}
            <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  view === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  view === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  view === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Día
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <Button
              onClick={() => setShowNewEventModal(true)}
              variant="primary"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Contenido
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      <Card glass className="p-6">
        {view === 'month' && renderMonthView()}
        {view === 'day' && renderDayView()}
        {view === 'week' && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Vista Semanal
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Próximamente
            </p>
          </div>
        )}
      </Card>

      {/* Content Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Estadísticas de Contenido
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Publicaciones</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calendar.length}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Programadas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calendar.filter(e => e.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Publicadas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calendar.filter(e => e.status === 'published').length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calendar.filter(e => e.status === 'pending_approval').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Distribución por Plataforma
              </h4>
              <div className="space-y-3">
                {Object.entries(platformIcons).map(([platform, Icon], index) => {
                  const count = calendar.filter(e => e.platform === platform).length;
                  const percentage = calendar.length > 0 ? (count / calendar.length) * 100 : 0;
                  
                  return (
                    <div key={platform} className="flex items-center space-x-3">
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: platformColors[platform as keyof typeof platformColors] || '#6B7280' }}
                      />
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: platformColors[platform as keyof typeof platformColors] || '#6B7280'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Distribución por Tipo de Contenido
              </h4>
              <div className="space-y-3">
                {Object.entries(contentTypeIcons).map(([type, Icon], index) => {
                  const count = calendar.filter(e => e.contentType === type).length;
                  const percentage = calendar.length > 0 ? (count / calendar.length) * 100 : 0;
                  
                  return (
                    <div key={type} className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Programar Nuevo Contenido
                </h3>
                <button
                  onClick={() => setShowNewEventModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Título del contenido"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plataforma
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Contenido
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="text">Texto</option>
                      <option value="image">Imagen</option>
                      <option value="video">Video</option>
                      <option value="link">Enlace</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contenido
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Escribe el contenido aquí..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      defaultValue={selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="reforma, educación, propuestas"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowNewEventModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Programar Contenido
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles del Contenido
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const PlatformIcon = platformIcons[selectedEvent.platform as keyof typeof platformIcons] || MessageSquare;
                    return (
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: `${platformColors[selectedEvent.platform as keyof typeof platformColors]}20`,
                        }}
                      >
                        <PlatformIcon 
                          className="h-5 w-5" 
                          style={{ color: platformColors[selectedEvent.platform as keyof typeof platformColors] }}
                        />
                      </div>
                    );
                  })()}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedEvent.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(selectedEvent.scheduledDate).toLocaleString([], { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </span>
                      </div>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded ${statusColors[selectedEvent.status]}`}>
                        {selectedEvent.status === 'draft' ? 'Borrador' :
                         selectedEvent.status === 'scheduled' ? 'Programado' :
                         selectedEvent.status === 'published' ? 'Publicado' :
                         selectedEvent.status === 'pending_approval' ? 'Pendiente' : 'Rechazado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {selectedEvent.content}
                  </p>
                </div>
                
                {selectedEvent.media && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={selectedEvent.media} 
                      alt="Content media" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Creado por:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEvent.createdBy}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Creado el:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedEvent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {selectedEvent.approvedBy && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Aprobado por:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedEvent.approvedBy}
                      </p>
                    </div>
                  )}
                  
                  {selectedEvent.publishedAt && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Publicado el:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedEvent.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                >
                  Cerrar
                </Button>
                <Button
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {selectedEvent.status === 'draft' && (
                  <Button
                    variant="primary"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};