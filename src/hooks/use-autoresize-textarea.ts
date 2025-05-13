import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a ref and a function to adjust the height of a textarea
 * to fit its content.
 *
 * @param {object} options
 * @param {number} options.minHeight The minimum height of the textarea
 * @param {number} [options.maxHeight] The maximum height of the textarea
 *
 * @returns {object}
 * @returns {React.MutableRefObject<HTMLTextAreaElement | null>} textareaRef
 * @returns {(reset?: boolean) => void} adjustHeight
 *   When called without arguments, it will adjust the height of the textarea
 *   to fit its content. When called with `true`, it will reset the height
 *   of the textarea to `options.minHeight`.
 */
export function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}
