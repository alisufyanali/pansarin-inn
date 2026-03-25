import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck, Share2, Save, Globe, Landmark } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Types
type LocationItem = { id: number; name: string; country_id?: number; state_id?: number };

export interface CustomerFormData {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    country_id: string | number;
    state_id: string | number;
    city_id: string | number;
    customer_group_id?: string | number;
    status: string;
    referred_by?: string | number;
}

export interface CustomerFormProps {
    customer?: any;
    countries: LocationItem[];
    states: LocationItem[];
    cities: LocationItem[];
    groups: { id: number; name: string }[];
    affiliates: { id: number; name: string }[];
    isEdit?: boolean;
}

export default function CustomerForm({ 
    customer, 
    countries = [], 
    states = [], 
    cities = [], 
    groups = [], 
    affiliates = [], 
    isEdit = false 
}: CustomerFormProps) {
  
    const { data, setData, errors, post, put, processing } = useForm({
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        password: '', 
        address: customer?.address || '',
        country_id: customer?.city?.state?.country_id || '', 
        state_id: customer?.city?.state_id || '',
        city_id: customer?.city_id || '',
        customer_group_id: customer?.customer_group_id || '',
        status: customer?.status || 'active',
        referred_by: (customer?.referred_by || customer?.user?.referred_by || '').toString(),
    });

    const [filteredStates, setFilteredStates] = useState<LocationItem[]>([]);
    const [filteredCities, setFilteredCities] = useState<LocationItem[]>([]);

    // Effect 1: Filter States
    useEffect(() => {
        if (data.country_id && states.length > 0) {
            const filtered = states.filter(s => {
                if (!s.country_id) return true; 
                return Number(s.country_id) === Number(data.country_id);
            });
            setFilteredStates(filtered);
        }
    }, [data.country_id, states]);

    // Effect 2: Filter Cities
    useEffect(() => {
        if (data.state_id && cities.length > 0) {
            const filtered = cities.filter(c => {
                if (!c.state_id) return true;
                return Number(c.state_id) === Number(data.state_id);
            });
            setFilteredCities(filtered);
        }
    }, [data.state_id, cities]);

    // Handlers for dynamic dropdowns to clear children
    const handleCountryChange = (id: string) => {
        setData(prev => ({ ...prev, country_id: id, state_id: '', city_id: '' }));
    };

    const handleStateChange = (id: string) => {
        setData(prev => ({ ...prev, state_id: id, city_id: '' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore (Kyunke route global ho sakta hai)
        isEdit ? put(`/admin/customers/${customer.id}`) : post('/admin/customers');
    };

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

                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <ShieldCheck className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">Account Settings</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Customer Group</label>
                                <select value={data.customer_group_id} onChange={e => setData('customer_group_id', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700">
                                    <option value="">General</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block text-blue-600 flex items-center gap-2"><Share2 className="w-4 h-4"/> Referred By</label>
                                <select value={data.referred_by} onChange={e => setData('referred_by', e.target.value)} 
                                    className="w-full px-4 py-2.5 border-blue-100 bg-blue-50/50 dark:bg-gray-900 rounded-lg" >
                                    <option value="">Direct / Organic</option>
                                    {affiliates.map(a => (
                                        <option key={a.id} value={a.id.toString()}> 
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Status</label>
                                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                    <button type="button" onClick={() => setData('status', 'active')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${data.status === 'active' ? 'bg-white dark:bg-gray-700 text-emerald-600' : 'text-gray-500'}`}>ACTIVE</button>
                                    <button type="button" onClick={() => setData('status', 'inactive')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${data.status === 'inactive' ? 'bg-white dark:bg-gray-700 text-red-600' : 'text-gray-500'}`}>INACTIVE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}