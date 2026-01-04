'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Employee, Location } from '@/lib/types';

interface EmployeeEditFormProps {
  employee: Employee;
  locations: Location[];
  initialLocationIds: string[];
}

export default function EmployeeEditForm({
  employee,
  locations,
  initialLocationIds,
}: EmployeeEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee.photo_url);

  const [formData, setFormData] = useState({
    name: employee.name,
    bio: employee.bio || '',
    venmo: employee.venmo || '',
    cashapp: employee.cashapp || '',
    zelle: employee.zelle || '',
    status: employee.status,
    locationIds: initialLocationIds,
  });

  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData((prev) => ({
      ...prev,
      locationIds: prev.locationIds.includes(locationId)
        ? prev.locationIds.filter((id) => id !== locationId)
        : [...prev.locationIds, locationId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('bio', formData.bio);
      submitData.append('venmo', formData.venmo);
      submitData.append('cashapp', formData.cashapp);
      submitData.append('zelle', formData.zelle);
      submitData.append('status', formData.status);
      submitData.append('locationIds', JSON.stringify(formData.locationIds));
      if (photo) {
        submitData.append('photo', photo);
      }

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      router.push('/dashboard/employees');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.push('/dashboard/employees');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-[var(--stone-700)] mb-2">Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--stone-100)] overflow-hidden flex-shrink-0">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt={formData.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--stone-400)]">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-[var(--stone-500)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[var(--sage-100)] file:text-[var(--sage-700)] hover:file:bg-[var(--sage-200)]"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--stone-700)] mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-[var(--stone-700)] mb-1">
            What drives me
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
            rows={2}
            maxLength={150}
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[var(--stone-700)] mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'approved' })}
            className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--stone-700)]">Payment Methods</label>

          <div>
            <label htmlFor="venmo" className="block text-xs text-[var(--stone-500)] mb-1">
              Venmo Username
            </label>
            <input
              type="text"
              id="venmo"
              value={formData.venmo}
              onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
              placeholder="@username"
            />
          </div>

          <div>
            <label htmlFor="cashapp" className="block text-xs text-[var(--stone-500)] mb-1">
              Cash App
            </label>
            <input
              type="text"
              id="cashapp"
              value={formData.cashapp}
              onChange={(e) => setFormData({ ...formData, cashapp: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
              placeholder="$cashtag"
            />
          </div>

          <div>
            <label htmlFor="zelle" className="block text-xs text-[var(--stone-500)] mb-1">
              Zelle
            </label>
            <input
              type="text"
              id="zelle"
              value={formData.zelle}
              onChange={(e) => setFormData({ ...formData, zelle: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--stone-300)] rounded-lg focus:ring-2 focus:ring-[var(--sage-300)] focus:border-transparent"
              placeholder="email@example.com or phone"
            />
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-[var(--stone-700)] mb-2">Locations</label>
          <div className="space-y-2">
            {locations.map((location) => (
              <label
                key={location.id}
                className="flex items-center gap-3 p-3 bg-[var(--stone-50)] rounded-lg cursor-pointer hover:bg-[var(--stone-100)]"
              >
                <input
                  type="checkbox"
                  checked={formData.locationIds.includes(location.id)}
                  onChange={() => handleLocationToggle(location.id)}
                  className="w-5 h-5 text-[var(--sage-600)] border-[var(--stone-300)] rounded focus:ring-[var(--sage-300)]"
                />
                <span className="text-[var(--stone-800)]">{location.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          {isDeleting ? 'Deleting...' : 'Delete Employee'}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-[var(--stone-600)] hover:text-[var(--stone-800)] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] disabled:bg-[var(--sage-300)] text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
