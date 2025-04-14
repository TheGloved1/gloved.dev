'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ==============================
// Tooltip Provider
// ==============================

export interface TooltipProviderProps {
  /**
   * The children components that will have access to the tooltip context
   */
  children: React.ReactNode;
  /**
   * The duration from when the mouse enters a tooltip trigger until the tooltip opens
   * @default 700
   */
  delayDuration?: number;
  /**
   * Whether to disable the hover interactions when content is open
   * @default false
   */
  disableHoverableContent?: boolean;
  /**
   * The duration from when the mouse leaves a tooltip trigger until the tooltip closes
   * @default 300
   */
  skipDelayDuration?: number;
}

/**
 * Provider component for tooltips. Wrap your application or section with this to provide
 * consistent tooltip behavior across components.
 */
export function TooltipProvider({
  children,
  delayDuration,
  disableHoverableContent = false,
  skipDelayDuration,
}: TooltipProviderProps) {
  return (
    <ShadcnTooltipProvider
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </ShadcnTooltipProvider>
  );
}

// ==============================
// Tooltip Component
// ==============================

// Define variants for the tooltip
const tooltipVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground',
      muted: 'bg-muted text-muted-foreground',
      info: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
    },
    size: {
      default: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    },
    radius: {
      default: 'rounded-md',
      none: 'rounded-none',
      sm: 'rounded-sm',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    shadow: {
      none: '',
      sm: 'shadow-sm',
      default: 'shadow',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    radius: 'default',
    shadow: 'default',
  },
});

// Animation variants
const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
};

export interface TooltipProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ShadcnTooltipContent>, 'content'>,
    VariantProps<typeof tooltipVariants> {
  /**
   * The content to display inside the tooltip
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip
   */
  children: React.ReactNode;
  /**
   * The animation type for the tooltip
   * @default "fade"
   */
  animation?: keyof typeof animationVariants | 'none';
  /**
   * The duration of the animation in milliseconds
   * @default 200
   */
  animationDuration?: number;
  /**
   * Whether to show an arrow pointing to the trigger
   * @default false
   */
  showArrow?: boolean;
  /**
   * The maximum width of the tooltip
   */
  maxWidth?: string | number;
  /**
   * Whether the tooltip should be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Custom class name for the tooltip content
   */
  contentClassName?: string;
  /**
   * ARIA label for the tooltip
   */
  ariaLabel?: string;
  /**
   * The duration from when the mouse enters a tooltip trigger until the tooltip opens
   * @default 700
   */
  delayDuration?: number;
}

/**
 * A customizable tooltip component that displays information when users hover over, focus on, or tap an element.
 * This component wraps the Shadcn UI tooltip implementation, inheriting its styling and behavior.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      className,
      content,
      children,
      variant,
      size,
      radius,
      shadow,
      side = 'top',
      align = 'center',
      animation = 'fade',
      animationDuration = 200,
      showArrow = false,
      maxWidth,
      disabled = false,
      contentClassName,
      ariaLabel,
      delayDuration = 700,
      ...props
    },
    ref,
  ) => {
    // Don't render the tooltip if it's disabled
    if (disabled) {
      return <>{children}</>;
    }

    return (
      <ShadcnTooltip delayDuration={delayDuration}>
        <ShadcnTooltipTrigger asChild>{children}</ShadcnTooltipTrigger>
        <AnimatePresence>
          <ShadcnTooltipContent
            ref={ref}
            side={side}
            align={align}
            className={cn(
              tooltipVariants({ variant, size, radius, shadow }),
              'z-50 overflow-hidden',
              'origin-[var(--radix-tooltip-content-transform-origin)]',
              contentClassName,
              className,
            )}
            style={{
              maxWidth: maxWidth,
              ...(showArrow && {
                '--arrow-size': '8px',
                '--arrow-gap': '0px',
              }),
            }}
            sideOffset={8}
            aria-label={ariaLabel}
            {...props}
          >
            {animation !== 'none' ?
              <motion.div
                initial={animationVariants[animation].initial}
                animate={animationVariants[animation].animate}
                exit={animationVariants[animation].exit}
                transition={{ duration: animationDuration / 1000 }}
              >
                {content}
              </motion.div>
            : content}
          </ShadcnTooltipContent>
        </AnimatePresence>
      </ShadcnTooltip>
    );
  },
);
Tooltip.displayName = 'Tooltip';
