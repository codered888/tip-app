/**
 * BackgroundShapes - Organic floating shapes for spa aesthetic
 *
 * Design System Component: Used across customer-facing pages
 * to create a calming, organic visual environment.
 *
 * Variants:
 * - default: Full floating shapes (location pages, homepage)
 * - minimal: Subtle accent shapes (signup, forms)
 */

interface BackgroundShapesProps {
  variant?: 'default' | 'minimal';
}

export default function BackgroundShapes({ variant = 'default' }: BackgroundShapesProps) {
  if (variant === 'minimal') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Soft sage glow - top */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, var(--sage-100), transparent 70%)',
          }}
        />

        {/* Subtle corner accent */}
        <div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-30 animate-shape-float"
          style={{
            background: 'radial-gradient(circle at 100% 100%, var(--sage-200), transparent 70%)',
            animationDelay: '3s',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Large sage blob - top right */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-60 animate-shape-float"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, var(--sage-200), var(--sage-100))',
          animationDelay: '0s',
        }}
      />

      {/* Medium stone shape - left side */}
      <div
        className="absolute top-1/3 -left-16 w-48 h-64 rounded-full opacity-40 animate-shape-float"
        style={{
          background: 'linear-gradient(135deg, var(--stone-200), var(--stone-100))',
          borderRadius: '60% 40% 50% 50%',
          animationDelay: '2s',
        }}
      />

      {/* Small accent - bottom right */}
      <div
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full opacity-50 animate-shape-float"
        style={{
          background: 'radial-gradient(circle, var(--sage-300), var(--sage-200))',
          animationDelay: '4s',
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 0%, var(--sage-100), transparent 70%)',
        }}
      />
    </div>
  );
}
