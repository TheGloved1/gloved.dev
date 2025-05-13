import { useCallback, useEffect, useRef } from 'react';

/**
 * Auto-resizes a textarea based on its content.
 *
 * @param {{ minHeight: number; maxHeight?: number }} input - The input options for the auto-resizing textarea.
 * @param {number} input.minHeight The minimum height of the textarea.
 * @param {number | undefined} input.maxHeight The maximum height of the textarea. Optional.
 *
 * @returns An object with the following properties:
 *   - textareaRef: A ref to the textarea element.
 *   - adjustHeight: A function to adjust the height of the textarea.
 *
 * @example
 * ```tsx
 * const [input, setInput] = useState('');
 * const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
 * <textarea ref={textareaRef} onChange={(e) => { setInput(e.target.value); adjustHeight(); }} value={input} />
 * ```
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
