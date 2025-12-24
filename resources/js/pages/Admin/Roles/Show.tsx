import React from 'react';
import { ArrowLeft, Edit2, Trash2, Shield, CheckCircle2 } from 'lucide-react';

type Permission = { id: number; name: string };
interface Props {
  role: { id: number; name: string; permissions?: Permission[] };
  permissions?: string[];
}

// Mock data for demo
const mockRole = {
  id: 1,
  name: 'Administrator',
  permissions: [
    { id: 1, name: 'users.view' },
    { id: 2, name: 'users.create' },
    { id: 3, name: 'users.edit' },
    { id: 4, name: 'users.delete' },
    { id: 5, name: 'roles.view' },
    { id: 6, name: 'roles.create' },
    { id: 7, name: 'roles.edit' },
    { id: 8, name: 'roles.delete' },
    { id: 9, name: 'settings.manage' },
  ]
};

export default function RoleShow({ role = mockRole, permissions }: Props) {
  const permNames = permissions ?? role.permissions?.map((p) => p.name) ?? [];
  
  // Group permissions by category for better organization
  const groupedPermissions = permNames.reduce((acc, perm) => {
    const [category] = perm.split('.');
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, string[]>);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this role?')) {
      console.log('Delete role:', role.id);
    }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <a
            href="/roles"
            className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Roles</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href={`/roles/${role.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Edit2 className="w-4 h-4" />
              <span className="font-medium">Edit Role</span>
            </a>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            
            <div className="relative flex items-start gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{role.name}</h1>
                <p className="text-blue-100">
                  Role with {permNames.length} permission{permNames.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Assigned Permissions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This role has access to the following permissions across the system
              </p>
            </div>

            {/* Permissions Grid */}
            {Object.keys(groupedPermissions).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div
                    key={category}
                    className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <div
                          key={perm}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="font-mono">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No permissions assigned to this role</p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-8 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Role ID: <span className="font-mono font-semibold text-gray-900 dark:text-white">{role.id}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Total Permissions: <span className="font-semibold text-gray-900 dark:text-white">{permNames.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}