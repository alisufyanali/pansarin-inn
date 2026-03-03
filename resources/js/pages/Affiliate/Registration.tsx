import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Hash, Info, UserPlus } from 'lucide-react';
import toast from "react-hot-toast";

interface Props {
    affiliate_code?: string;
}

export default function Registration({ affiliate_code = '' }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        password_confirmation: '',
        affiliate_code: affiliate_code, // URL se auto-fill hoga, lekin editable rahega
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/affiliate/register-customer', {
            onError: (err) => {
                if (err.affiliate_code) toast.error("The provided referral code is invalid.");
            },
            onSuccess: () => toast.success('Account created successfully!')
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4">
            <Head title="Create Your Account" />
            
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
                    <p className="mt-2 text-sm text-gray-500">Fill in the details to create your account</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={submit}>
                    {/* Name & Email */}
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="Full Name *" required className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type="email" placeholder="Email Address *" required className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={data.email} onChange={e => setData('email', e.target.value)} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Phone & Username (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Phone (Opt)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                            value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        <input type="text" placeholder="Username (Opt)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                            value={data.username} onChange={e => setData('username', e.target.value)} />
                    </div>

                    {/* Password Fields with Toggle */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type={showPassword ? "text" : "password"} placeholder="Password *" required className="w-full pl-10 pr-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.password} onChange={e => setData('password', e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type={showPassword ? "text" : "password"} placeholder="Confirm Password *" required className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Referral Code (Editable for Direct Users) */}
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
                        <div className="flex items-center gap-2 mb-2 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            <Hash size={12} />
                            <span>Affiliate / Referral Code (Optional)</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter code"
                            className="w-full p-2.5 bg-white border border-blue-100 rounded-lg font-mono font-bold text-blue-600 focus:border-blue-500 outline-none uppercase placeholder:font-sans placeholder:font-normal placeholder:text-gray-400 text-center"
                            value={data.affiliate_code}
                            onChange={e => setData('affiliate_code', e.target.value.toUpperCase())}
                        />
                        <p className="mt-2 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                            <Info size={10} /> If you don't have a code, just leave it blank.
                        </p>
                    </div>

                    <button disabled={processing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50">
                        {processing ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>
            </div>
        </div>
    );
}