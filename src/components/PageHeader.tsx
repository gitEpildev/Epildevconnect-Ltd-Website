import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  icon: any;
  kicker: string;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}

/**
 * Shared page header: kicker line with icon chip and rule, a two-tone
 * display headline (last part in the animated gradient), and a short
 * description. Keeps every page opening consistent and intentional.
 */
export default function PageHeader({ icon: Icon, kicker, title, accent, description, children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12"
    >
      {/* Kicker row */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-9 h-9 rounded-xl bg-quantum-glow/10 border border-quantum-glow/25 flex items-center justify-center flex-shrink-0">
          <Icon className="w-[18px] h-[18px] text-quantum-glow" />
        </span>
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-quantum-glow/80">{kicker}</span>
        <span className="h-px flex-1 max-w-[160px] bg-gradient-to-r from-quantum-glow/40 to-transparent" />
      </div>

      {/* Headline */}
      <h1 className="heading-display text-5xl lg:text-7xl leading-[1.05] tracking-tight">
        <span className="text-white">{title} </span>
        <span className="heading-gradient">{accent}</span>
      </h1>

      {/* Description */}
      <p className="mt-4 text-base lg:text-lg text-gray-400 leading-relaxed max-w-2xl">
        {description}
      </p>

      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  );
}
