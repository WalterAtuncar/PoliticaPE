import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { User, Role } from '../../../types/settings';

interface UsersManagementProps {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  onCreateUser: (userData: Partial<User>) => Promise<User>;
  onUpdateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  roles,
  isLoading,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'viewer',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  const statusConfig = {
    active: {
      label: 'Activo',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    inactive: {
      label: 'Inactivo',
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    suspended: {
      label: 'Suspendido',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const handleCreateUser = async () => {
    try {
      await onCreateUser(formData);
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'viewer',
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      await onUpdateUser(selectedUser.id, formData);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await onDeleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspendidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Con 2FA</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.twoFactorEnabled).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card glass className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Seguridad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => {
                const StatusIcon = statusConfig[user.status].icon;
                
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[user.status].bgColor} ${statusConfig[user.status].color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[user.status].label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastLogin)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div title="2FA Habilitado">
                          {user.twoFactorEnabled ? (
                            <Shield className="h-4 w-4 text-green-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {user.loginAttempts > 0 && (
                          <div title={`${user.loginAttempts} intentos fallidos`}>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                        
                        {user.role !== 'super_admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Usuario"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@politicape.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              disabled={!formData.firstName || !formData.lastName || !formData.email}
            >
              Crear Usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuario"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@politicape.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleEditUser}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Usuario"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar eliminación
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Estás seguro de que deseas eliminar a{' '}
                <span className="font-medium">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar Usuario
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 