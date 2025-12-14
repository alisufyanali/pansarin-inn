import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

type User = { id: number; name: string; email: string };

export type CustomerFormData = {
  user_id: string | number;
  address: string;
  city: string;
  country: string;
};

interface CustomerFormProps {
  customer?: CustomerFormData & { id?: number };
  users?: User[];
  isEdit?: boolean;
}

export default function CustomerForm({ customer, users = [], isEdit = false }: CustomerFormProps) {
  const { data, setData, errors, post, put, processing } = useForm<CustomerFormData>({
    user_id: customer?.user_id || '',
    address: customer?.address || '',
    city: customer?.city || '',
    country: customer?.country || '',
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (isEdit && customer?.id) {
      put(`/admin/customers/${customer.id}`);
    } else {
      post('/admin/customers');
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
          title="Back"
        >
          <ArrowLeft />
        </Link>
      </div>

      <div className="py-6">
        <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {isEdit ? 'Edit Customer' : 'Create New Customer'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            {isEdit ? 'Update the customer details below.' : 'Fill the form below to add a new customer.'}
          </p>

          <form onSubmit={submit} className="space-y-4 font-sans text-sm">
            {/* User Selection (Only for create) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select User *
                </label>
                <select
                  value={data.user_id}
                  onChange={(e) => setData('user_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.user_id && <div className="text-red-500 text-sm mt-1">{errors.user_id}</div>}
                {users.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    No users available. All existing users already have customer profiles.
                  </p>
                )}
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <textarea
                placeholder="Enter full address"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                value={data.address}
                onChange={e => setData('address', e.target.value)}
              />
              {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.city}
                onChange={e => setData('city', e.target.value)}
              />
              {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <input
                type="text"
                placeholder="Enter country"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.country}
                onChange={e => setData('country', e.target.value)}
              />
              {errors.country && <div className="text-red-500 text-sm mt-1">{errors.country}</div>}
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-2 pt-4">
              <Link
                href="/admin/customers"
                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                title="Cancel"
              >
                <ArrowLeft />
              </Link>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white w-10 h-10 shadow"
                title={isEdit ? 'Update' : 'Create'}
              >
                <Check />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}