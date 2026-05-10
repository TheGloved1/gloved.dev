/**
 * Clears the input for a specific thread or all threads
 * @param threadId The thread ID to clear the input for, or 'all' to clear all inputs
 */
export default function clearInput(threadId: string) {
  if (threadId === 'all') {
    localStorage.removeItem('input');
    return;
  }
  const inputState = localStorage.getItem('input');
  if (!inputState) return;
  const parsed = JSON.parse(inputState) as Record<string, string>;
  const next = { ...parsed };
  delete next[threadId];
  localStorage.setItem('input', JSON.stringify(next));
}
