'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Location } from '@/lib/types';

interface SignupFormProps {
  locations: Location[];
}

export default function SignupForm({ locations }: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    venmo: '',
    cashapp: '',
    zelle: '',
    locationIds: [] as string[],
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

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.venmo && !formData.cashapp && !formData.zelle) {
      setError('Please provide at least one payment method');
      return;
    }

    if (formData.locationIds.length === 0) {
      setError('Please select at least one location');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('bio', formData.bio);
      submitData.append('venmo', formData.venmo);
      submitData.append('cashapp', formData.cashapp);
      submitData.append('zelle', formData.zelle);
      submitData.append('locationIds', JSON.stringify(formData.locationIds));
      if (photo) {
        submitData.append('photo', photo);
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[var(--sage-100)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--sage-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-medium text-[var(--stone-800)] mb-2">
          Thank you!
        </h2>
        <p className="text-[var(--stone-500)] font-light">
          Your profile has been submitted and is pending approval.
          You&apos;ll appear on the customer page once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-[var(--stone-700)] mb-2">
          Your Photo
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--sage-100)] to-[var(--sage-200)] overflow-hidden flex-shrink-0 ring-2 ring-[var(--sage-200)]">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--sage-400)]">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="text-sm text-[var(--stone-500)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[var(--sage-100)] file:text-[var(--sage-600)] hover:file:bg-[var(--sage-200)] file:cursor-pointer file:transition-colors"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--stone-700)] mb-1">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
          placeholder="Enter your name"
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
          className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors resize-none"
          placeholder="e.g., My family, Saving for nursing school..."
          rows={2}
          maxLength={150}
        />
        <p className="text-xs text-[var(--stone-400)] mt-1">
          {formData.bio.length}/150 characters
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--stone-700)]">
          Payment Methods * <span className="font-normal text-[var(--stone-400)]">(at least one required)</span>
        </label>

        <div>
          <label htmlFor="venmo" className="block text-xs text-[var(--stone-500)] mb-1">
            Venmo Username
          </label>
          <input
            type="text"
            id="venmo"
            value={formData.venmo}
            onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
            className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
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
            className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
            placeholder="$cashtag"
          />
        </div>

        <div>
          <label htmlFor="zelle" className="block text-xs text-[var(--stone-500)] mb-1">
            Zelle (phone or email)
          </label>
          <input
            type="text"
            id="zelle"
            value={formData.zelle}
            onChange={(e) => setFormData({ ...formData, zelle: e.target.value })}
            className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
            placeholder="email@example.com or (555) 123-4567"
          />
        </div>
      </div>

      {/* Locations */}
      <div>
        <label className="block text-sm font-medium text-[var(--stone-700)] mb-2">
          Locations I work at *
        </label>
        <div className="space-y-2">
          {locations.map((location) => (
            <label
              key={location.id}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                formData.locationIds.includes(location.id)
                  ? 'bg-[var(--sage-100)] border-2 border-[var(--sage-400)]'
                  : 'bg-[var(--stone-50)] border-2 border-transparent hover:bg-[var(--stone-100)]'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.locationIds.includes(location.id)}
                onChange={() => handleLocationToggle(location.id)}
                className="w-5 h-5 text-[var(--sage-500)] border-[var(--stone-300)] rounded focus:ring-[var(--sage-400)] accent-[var(--sage-500)]"
              />
              <span className="text-[var(--stone-800)] font-medium">{location.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] disabled:bg-[var(--stone-300)] text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Profile'}
      </button>
    </form>
  );
}
