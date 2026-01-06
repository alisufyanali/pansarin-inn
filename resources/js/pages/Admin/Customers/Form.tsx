import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

type City = { id: number; name: string };

export type CustomerFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city_id: string | number;
  country: string;
};

interface CustomerFormProps {
  customer?: CustomerFormData & { id?: number };
  cities?: City[];
  isEdit?: boolean;
}

export default function CustomerForm({ customer, cities = [], isEdit = false }: CustomerFormProps) {
  const { data, setData, errors, post, put, processing } = useForm<CustomerFormData>({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    city_id: customer?.city_id || '',
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
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.first_name}
                onChange={e => setData('first_name', e.target.value)}
                required
              />
              {errors.first_name && <div className="text-red-500 text-sm mt-1">{errors.first_name}</div>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.last_name}
                onChange={e => setData('last_name', e.target.value)}
              />
              {errors.last_name && <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
                required
              />
              {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
              />
              {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
            </div>

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
              <select
                value={data.city_id}
                onChange={(e) => setData('city_id', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city_id && <div className="text-red-500 text-sm mt-1">{errors.city_id}</div>}
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