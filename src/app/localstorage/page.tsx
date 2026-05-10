'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, Code2, Copy, FileJson, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { codeToHtml } from 'shiki';
import { toast } from 'sonner';

type StorageItem = { key: string; value: string };

function readStorage(): StorageItem[] {
  if (typeof window === 'undefined') return [];
  const result: StorageItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) result.push({ key, value: localStorage.getItem(key) ?? '' });
  }
  return result.sort((a, b) => a.key.localeCompare(b.key));
}

function isValidJson(str: string): boolean {
  if (!str.trim()) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

export default function LocalStoragePage() {
  const [items, setItems] = useState<StorageItem[]>(() => (typeof window !== 'undefined' ? readStorage() : []));
  const [search, setSearch] = useState('');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [jsonMode, setJsonMode] = useState(true);
  const [addKey, setAddKey] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [editHtml, setEditHtml] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!jsonMode) {
        setEditHtml(escapeHtml(editValue));
        return;
      }
      try {
        const result = await codeToHtml(editValue, { lang: 'json', theme: 'catppuccin-mocha' });
        setEditHtml(result);
      } catch {
        setEditHtml(`<pre>${escapeHtml(editValue)}</pre>`);
      }
    };
    run();
  }, [editValue, jsonMode]);

  const syncScroll = () => {
    if (editRef.current && highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-editRef.current.scrollLeft}px, ${-editRef.current.scrollTop}px)`;
    }
  };

  const refresh = useCallback(() => setItems(readStorage()), []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.key.toLowerCase().includes(q) || i.value.toLowerCase().includes(q));
  }, [items, search]);

  const openEdit = useCallback((item: StorageItem) => {
    setEditKey(item.key);
    setEditValue(isValidJson(item.value) ? formatJson(item.value) : item.value);
    setJsonMode(isValidJson(item.value));
  }, []);

  const saveEdit = useCallback(() => {
    if (!editKey) return;
    localStorage.setItem(editKey, editValue);
    toast.success('Saved', { description: editKey, duration: 1500 });
    refresh();
  }, [editKey, editValue, refresh]);

  const doDelete = useCallback(
    (key: string) => {
      localStorage.removeItem(key);
      if (editKey === key) {
        setEditKey(null);
        setEditValue('');
      }
      refresh();
    },
    [editKey, refresh],
  );

  const doClearAll = useCallback(() => {
    localStorage.clear();
    setShowClearAll(false);
    refresh();
  }, [refresh]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editKey) setEditKey(null);
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && editKey) {
        e.preventDefault();
        saveEdit();
        setEditKey(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editKey, saveEdit]);

  return (
    <div className='min-h-screen bg-[#1e1e2e] text-[#cdd6f4]'>
      {/* Header */}
      <div className='border-b border-[#313244] bg-[#181825] px-6 py-4'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-semibold text-[#cdd6f4]'>localStorage</h1>
              <p className='text-sm text-[#6c7086]'>{items.length} items stored</p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setAddKey('');
                  setAddValue('');
                }}
                className='border-[#313244] bg-transparent text-[#cdd6f4] hover:bg-[#313244]'
              >
                <Plus className='mr-1.5 h-4 w-4' /> Add
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowClearAll(true)}
                disabled={items.length === 0}
                className='border-[#313244] bg-transparent text-[#f38ba8] hover:bg-[#f38ba8]/10'
              >
                <Trash2 className='mr-1.5 h-4 w-4' /> Clear
              </Button>
            </div>
          </div>

          <div className='mt-4 flex gap-3'>
            <div className='relative max-w-md flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7086]' />
              <Input
                id='search'
                placeholder='Search keys or values...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='border-[#313244] bg-[#1e1e2e] pl-9 text-[#cdd6f4] placeholder:text-[#6c7086] focus:border-[#89b4fa] focus:ring-[#89b4fa]/20'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-6xl px-6 py-4'>
        {filtered.length === 0 ?
          <div className='flex flex-col items-center justify-center py-16 text-[#6c7086]'>
            <Code2 className='mb-3 h-10 w-10 opacity-50' />
            <p>{search ? 'No matching items' : 'No localStorage items'}</p>
            {!search && (
              <Button
                variant='outline'
                onClick={() => {
                  setAddKey('');
                  setAddValue('');
                }}
                className='mt-4 border-[#313244] text-[#cdd6f4]'
              >
                Add your first item
              </Button>
            )}
          </div>
        : <div className='rounded-lg border border-[#313244] bg-[#1e1e2e]'>
            {/* Table header */}
            <div className='grid grid-cols-[1fr_2fr_120px] border-b border-[#313244] bg-[#181825] px-4 py-2 text-xs font-medium uppercase text-[#6c7086]'>
              <span>Key</span>
              <span>Value</span>
              <span className='text-right'>Actions</span>
            </div>

            {/* Rows */}
            {filtered.map((item) => {
              const isJson = isValidJson(item.value);
              return (
                <div
                  key={item.key}
                  className='group grid grid-cols-[1fr_2fr_120px] items-center border-b border-[#313244] px-4 py-2.5 last:border-0 hover:bg-[#313244]/50'
                >
                  <div className='flex items-center gap-2 overflow-hidden'>
                    {isJson && <FileJson className='h-3.5 w-3.5 shrink-0 text-[#a6e3a1]' />}
                    <code className='truncate rounded bg-[#181825] px-2 py-0.5 font-mono text-sm text-[#89b4fa]'>
                      {item.key}
                    </code>
                  </div>
                  <div className='min-w-0 overflow-hidden'>
                    <pre className='truncate text-sm text-[#6c7086]'>{item.value}</pre>
                  </div>
                  <div className='flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-[#6c7086] hover:text-[#cdd6f4]'
                      onClick={() => copy(item.value, item.key)}
                    >
                      {copiedKey === item.key ?
                        <Check className='h-4 w-4 text-[#a6e3a1]' />
                      : <Copy className='h-4 w-4' />}
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-[#6c7086] hover:text-[#89b4fa]'
                      onClick={() => openEdit(item)}
                    >
                      <Code2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-[#6c7086] hover:text-[#f38ba8]'
                      onClick={() => setDeleteTarget(item.key)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editKey} onOpenChange={(open) => !open && setEditKey(null)}>
        <DialogContent className='max-w-3xl border-[#313244] bg-[#1e1e2e] text-[#cdd6f4]'>
          <DialogHeader className='flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <DialogTitle className='text-lg text-[#cdd6f4]'>Edit Value</DialogTitle>
              <code className='rounded bg-[#181825] px-2 py-0.5 font-mono text-sm text-[#89b4fa]'>{editKey}</code>
            </div>
            <span className='text-xs text-[#6c7086]'>
              <kbd className='rounded border border-[#313244] bg-[#11111b] px-1.5 py-0.5'>Esc</kbd> to close
            </span>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='flex gap-2'>
              <Button
                variant={jsonMode ? 'default' : 'outline'}
                size='sm'
                onClick={() => setJsonMode(!jsonMode)}
                className={
                  jsonMode ? 'bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80' : 'border-[#313244] text-[#cdd6f4]'
                }
              >
                <FileJson className='mr-1.5 h-3.5 w-3.5' /> {jsonMode ? 'JSON' : 'Text'}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editKey && copy(editValue, editKey)}
                className='text-[#cdd6f4] hover:bg-[#313244]'
              >
                {copiedKey === editKey ?
                  <Check className='mr-1.5 h-3.5 w-3.5 text-[#a6e3a1]' />
                : <Copy className='mr-1.5 h-3.5 w-3.5' />}
                {copiedKey === editKey ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div
              className={cn(
                'relative w-full overflow-hidden rounded-lg border',
                isValidJson(editValue) && jsonMode ? 'border-[#313244]'
                : !jsonMode ? 'border-[#313244]'
                : 'border-[#f38ba8]',
              )}
              style={{ height: '350px' }}
            >
              <div
                ref={highlightRef}
                className='pointer-events-none absolute inset-0 whitespace-pre p-3 font-mono text-sm leading-5'
                dangerouslySetInnerHTML={{ __html: editHtml || `<pre>${escapeHtml(editValue)}</pre>` }}
              />
              <textarea
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onScroll={syncScroll}
                spellCheck={false}
                autoCapitalize='off'
                autoComplete='off'
                autoCorrect='off'
                className='relative h-full w-full resize-none border-0 bg-transparent p-3 font-mono text-sm leading-5 text-transparent caret-[#89b4fa] outline-none'
                style={{ whiteSpace: 'pre', overflowWrap: 'normal' }}
              />
            </div>

            {jsonMode && !isValidJson(editValue) && <p className='text-xs text-[#f38ba8]'>Invalid JSON syntax</p>}
          </div>

          <DialogFooter className='flex-row justify-between'>
            <Button
              variant='ghost'
              className='text-[#f38ba8] hover:bg-[#f38ba8]/10'
              onClick={() => {
                if (editKey) {
                  setDeleteTarget(editKey);
                  setEditKey(null);
                }
              }}
            >
              <Trash2 className='mr-1.5 h-4 w-4' /> Delete
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => setEditKey(null)}
                className='border-[#313244] text-[#cdd6f4] hover:bg-[#313244]'
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                disabled={jsonMode && !isValidJson(editValue)}
                className='bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 disabled:opacity-50'
              >
                <Check className='mr-1.5 h-4 w-4' /> Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addKey !== null && !editKey} onOpenChange={(open) => !open && setAddKey(null)}>
        <DialogContent className='border-[#313244] bg-[#1e1e2e] text-[#cdd6f4]'>
          <DialogHeader>
            <DialogTitle className='text-[#cdd6f4]'>Add Item</DialogTitle>
            <DialogDescription className='text-[#6c7086]'>Create a new localStorage entry</DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-[#6c7086]'>Key</label>
              <Input
                value={addKey ?? ''}
                onChange={(e) => setAddKey(e.target.value || null)}
                placeholder='my-key'
                className='mt-1 border-[#313244] bg-[#11111b] text-[#cdd6f4]'
                autoFocus
              />
            </div>
            <div>
              <label className='text-xs text-[#6c7086]'>Value</label>
              <textarea
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                placeholder='{"hello": "world"}'
                className='mt-1 w-full rounded-lg border border-[#313244] bg-[#11111b] p-3 font-mono text-sm text-[#cdd6f4]'
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setAddKey(null)}
              className='border-[#313244] text-[#cdd6f4] hover:bg-[#313244]'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (addKey?.trim()) {
                  localStorage.setItem(addKey.trim(), addValue);
                  refresh();
                  setAddKey(null);
                  setAddValue('');
                }
              }}
              disabled={!addKey?.trim()}
              className='bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 disabled:opacity-50'
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='border-[#313244] bg-[#1e1e2e] text-[#cdd6f4]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-[#f38ba8]'>
              <AlertTriangle className='h-5 w-5' /> Delete
            </DialogTitle>
            <DialogDescription className='text-[#6c7086]'>
              Delete <code className='rounded bg-[#181825] px-1 text-[#cdd6f4]'>{deleteTarget}</code>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteTarget(null)}
              className='border-[#313244] text-[#cdd6f4] hover:bg-[#313244]'
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (deleteTarget) doDelete(deleteTarget);
                setDeleteTarget(null);
              }}
              className='bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80'
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All */}
      <Dialog open={showClearAll} onOpenChange={setShowClearAll}>
        <DialogContent className='border-[#313244] bg-[#1e1e2e] text-[#cdd6f4]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-[#f38ba8]'>
              <AlertTriangle className='h-5 w-5' /> Clear All
            </DialogTitle>
            <DialogDescription className='text-[#6c7086]'>
              Delete all {items.length} items? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowClearAll(false)}
              className='border-[#313244] text-[#cdd6f4] hover:bg-[#313244]'
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={doClearAll} className='bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80'>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
