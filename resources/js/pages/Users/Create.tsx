import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Create User", href: "/admin/users/create" },
];

type FormShape = {
  roles: string[];
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};
type Role = { id: number; name: string };

export default function UserCreate({ roles }: { roles: Role[] }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, errors, post } = useForm<FormShape>({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    password_confirmation: "",
    roles: [],
  });

  const handleRoleChange = (roleName: string) => {
    const currentRoles = [...data.roles];
    const index = currentRoles.indexOf(roleName);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleName);
    }
    setData("roles", currentRoles);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route("admin.users.store"));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
            title="Back"
          >
            <ArrowLeft />
          </Link>
        </div>

        <div className="py-6">
          <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Create New User
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
              Fill the form below to add a new user to the system.
            </p>

            <form onSubmit={submit} className="space-y-4 font-sans text-sm">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.username}
                  onChange={(e) => setData("username", e.target.value)}
                />
                {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                />
                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  placeholder="0300-1234567"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                />
                {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    value={data.password_confirmation}
                    onChange={(e) => setData("password_confirmation", e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Roles</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={data.roles.includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{role.name}</span>
                    </label>
                  ))}
                </div>
                {errors.roles && <div className="text-red-500 text-sm mt-1 font-semibold">{errors.roles}</div>}
              </div>

              <div className="flex justify-end items-center gap-2">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                  title="Cancel"
                >
                  <ArrowLeft />
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 shadow"
                  title="Create"
                >
                  <Check />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
