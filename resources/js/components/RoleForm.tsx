import React, { useState, useEffect, FormEvent } from 'react';

type Permission = {
  id: number;
  name: string;
};

type RoleFormProps = {
  initialRoleName?: string;
  initialPermissions?: string[];
  permissionsList: Permission[];
  onSubmit: (data: { name: string; permissions: string[] }) => Promise<void>;
};

const RoleForm = ({
  initialRoleName = '',
  initialPermissions = [],
  permissionsList,
  onSubmit,
}: RoleFormProps) => {
  const [name, setName] = useState(initialRoleName);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(initialRoleName);
  }, [initialRoleName]);

  useEffect(() => {
    setSelectedPermissions(initialPermissions);
  }, [initialPermissions]);

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Role name is required';
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), permissions: selectedPermissions });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: Record<string, string> = {};
        for (const key in apiErrors) {
          if (Array.isArray(apiErrors[key])) {
            newErrors[key] = apiErrors[key][0];
          }
        }
        setErrors(newErrors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.general && (
        <div style={{ marginBottom: 10, color: 'red' }}>{errors.general}</div>
      )}
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold' }}>
          Role Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          disabled={submitting}
        />
        {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
      </div>
      <fieldset style={{ marginBottom: 20, border: 'none' }}>
        <legend style={{ fontWeight: 'bold' }}>Permissions</legend>
        {permissionsList.length === 0 && <p>No permissions available.</p>}
        {permissionsList.map(({ id, name: permissionName }) => (
          <label key={id} style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permissionName)}
              onChange={() => togglePermission(permissionName)}
              disabled={submitting}
            />{' '}
            {permissionName}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={submitting} style={{ padding: '8px 16px' }}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default RoleForm;
