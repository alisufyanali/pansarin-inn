import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck, Share2, Save, Globe, Landmark } from 'lucide-react';
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
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Link href="/admin/customers" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Update Profile' : 'New Customer'}
                    </h1>
                </div>
                <button onClick={submit} disabled={processing} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    <Save className="w-5 h-5" /> {processing ? 'Saving...' : 'Save Customer'}
                </button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <User className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">Personal Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">First Name *</label>
                                <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700" required />
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Last Name</label>
                                <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700" />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> Phone *</label>
                                <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700" required />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">Address & Location</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block flex items-center gap-1"><Globe className="w-3 h-3"/> Country</label>
                                <select value={data.country_id} onChange={e => handleCountryChange(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700">
                                    <option value="">Select Country</option>
                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block flex items-center gap-1"><Landmark className="w-3 h-3"/> Province/State</label>
                                <select 
                                    value={data.state_id} 
                                    onChange={e => handleStateChange(e.target.value)} 
                                    disabled={!data.country_id}
                                    className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                >
                                    <option value="">Select State</option>
                                    {filteredStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block font-bold text-blue-600">City & Shipping</label>
                                <select 
                                    value={data.city_id} 
                                    onChange={e => setData('city_id', e.target.value)} 
                                    disabled={!data.state_id}
                                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg dark:bg-gray-700 disabled:bg-gray-50"
                                >
                                    <option value="">Select City</option>
                                    {filteredCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.city_id && <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-1.5 block">Street Address</label>
                            <textarea value={data.address} onChange={e => setData('address', e.target.value)} rows={2} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700" placeholder="House #, Street..." />
                        </div>
                    </div>
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