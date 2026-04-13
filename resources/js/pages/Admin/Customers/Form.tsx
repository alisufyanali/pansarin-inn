import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import CityDropdown, { type CityOption } from '@/components/CityDropdown';

type City = CityOption;

export type CustomerFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  address2: string;
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
    address2: customer?.address2 || '',
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
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Customer' : 'New Customer'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="John"
                value={data.first_name}
                onChange={e => setData('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              {errors.first_name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={data.last_name}
                onChange={e => setData('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {errors.last_name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.last_name}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              {errors.phone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Address Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address 1</label>
              <textarea
                placeholder="Street address, apartment, suite, etc."
                value={data.address}
                onChange={e => setData('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              {errors.address && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address 2 <span className="text-gray-400 text-xs">(optional)</span></label>
              <textarea
                placeholder="Landmark, area, additional info..."
                value={data.address2}
                onChange={e => setData('address2', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              {errors.address2 && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address2}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CityDropdown
                  cities={cities}
                  value={data.city_id}
                  onChange={val => setData('city_id', val)}
                  error={errors.city_id}
                  label="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Country</label>
                <input
                  type="text"
                  placeholder="Pakistan"
                  value={data.country}
                  onChange={e => setData('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/admin/customers"
            className="flex-1 text-center border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {processing ? 'Saving...' : (isEdit ? 'Update Customer' : 'Create Customer')}
          </button>
        </div>
      </form>

      <br /> <br />
      <br /> <br />
     
    </div>
  );
}