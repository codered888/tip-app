'use client';

import { useState } from 'react';

export default function SignupLinkDisplay() {
  const [copied, setCopied] = useState(false);

  const signupUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup`
    : '/signup';

  const copyLink = async () => {
    await navigator.clipboard.writeText(signupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={signupUrl}
        readOnly
        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
      />
      <button
        onClick={copyLink}
        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
