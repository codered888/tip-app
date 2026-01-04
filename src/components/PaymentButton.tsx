'use client';

interface PaymentButtonProps {
  type: 'venmo' | 'cashapp' | 'zelle';
  value: string;
}

const paymentConfig = {
  venmo: {
    label: 'Venmo',
    color: 'bg-[#008CFF] hover:bg-[#0074D4]',
    getUrl: (username: string) => `https://venmo.com/${username.replace('@', '')}`,
  },
  cashapp: {
    label: 'Cash App',
    color: 'bg-[#00D632] hover:bg-[#00B82B]',
    getUrl: (cashtag: string) => `https://cash.app/${cashtag.startsWith('$') ? cashtag : '$' + cashtag}`,
  },
  zelle: {
    label: 'Zelle',
    color: 'bg-[#6D1ED4] hover:bg-[#5A19B0]',
    getUrl: () => '',
  },
};

export default function PaymentButton({ type, value }: PaymentButtonProps) {
  const config = paymentConfig[type];
  const url = config.getUrl(value);

  if (type === 'zelle') {
    return (
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          alert(`Copied Zelle info: ${value}`);
        }}
        className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${config.color}`}
      >
        {config.label}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${config.color}`}
    >
      {config.label}
    </a>
  );
}
