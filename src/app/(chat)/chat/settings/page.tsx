'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePreviousLocal } from '@/hooks/use-previous-local';
import { deleteAllLocalData } from '@/lib/chat-store';
import { ChevronLeft, Download, Trash, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const [previousSystemPrompt, setPreviousSystemPrompt] = usePreviousLocal<string | undefined>(
    'previousSystemPrompt',
    systemPrompt,
  );
  const router = useRouter();

  const handleDelete = async () => {
    deleteAllLocalData();
    setDeleteDialogOpen(false);
    router.push('/chat');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener(
      'change',
      async (e) => {
        input.remove();
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (data.threads) {
            localStorage.setItem(
              'gloved_chat_threads',
              JSON.stringify(Object.fromEntries((data.threads as Array<{ id: string }>).map((t) => [t.id, t]))),
            );
          }
          if (data.messages) {
            const byThread: Record<string, any[]> = {};
            for (const msg of data.messages) {
              if (!byThread[msg.threadId]) byThread[msg.threadId] = [];
              byThread[msg.threadId].push(msg);
            }
            for (const [tid, msgs] of Object.entries(byThread)) {
              localStorage.setItem('gloved_chat_msgs_' + tid, JSON.stringify(msgs));
            }
          }
          toast.success('Data imported');
        } catch {
          toast.error('[IMPORT] Invalid JSON');
        }
      },
      { once: true },
    );
    input.click();
  };

  const handleExport = async () => {
    try {
      const threadsMap = JSON.parse(localStorage.getItem('gloved_chat_threads') || '{}');
      const threads = Object.values(threadsMap) as Array<{ id: string }>;
      const messages: any[] = [];
      for (const t of threads) {
        const msgs = JSON.parse(localStorage.getItem('gloved_chat_msgs_' + t.id) || '[]');
        messages.push(...msgs);
      }
      const jsonString = JSON.stringify({ threads, messages }, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatdb-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className='h-screen w-full overflow-y-auto'>
      <div className='mx-auto flex w-full flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8'>
        <header className='flex items-center justify-between pb-8 pt-12 md:pt-0'>
          <Link
            href={'/chat'}
            onClick={(e) => {
              e.preventDefault();
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/chat');
              }
            }}
            className='mb-4 flex items-center gap-2'
          >
            <ChevronLeft className='h-5 w-5' />
            <span className='text-sm font-medium'>Back to chat</span>
          </Link>
        </header>
        <div className='flex w-full max-w-[800px] flex-col gap-8'>
          <section>
            <h2 className='text-2xl font-bold'>AI Personality</h2>
            <p className='mt-1 text-muted-foreground/80'>
              How would you like the AI to respond? (Leave blank to use default)
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => {
                  setSystemPrompt('');
                  setPreviousSystemPrompt('');
                }}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  !systemPrompt ?
                    'border-primary bg-primary text-primary-foreground opacity-50'
                  : 'border-muted-foreground/20 bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Default
              </button>
              {[
                { label: 'Concise', prompt: 'Be concise and direct. Avoid unnecessary explanations.' },
                { label: 'Creative', prompt: 'Be imaginative, expressive, and enthusiastic in your responses.' },
                {
                  label: 'Technical',
                  prompt: 'Be thorough and precise. Prefer technical detail and include relevant context.',
                },
                { label: 'Socratic', prompt: 'Guide the user to answers by asking thoughtful, clarifying questions.' },
                { label: 'Friendly', prompt: 'Be warm, conversational, and supportive.' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type='button'
                  onClick={() => {
                    setSystemPrompt(preset.prompt);
                    setPreviousSystemPrompt(preset.prompt);
                  }}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    systemPrompt === preset.prompt ?
                      'border-primary bg-primary text-primary-foreground opacity-50'
                    : 'border-muted-foreground/20 bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea
              value={systemPrompt ?? undefined}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                setPreviousSystemPrompt(e.target.value);
              }}
              placeholder={`For example: "Your name is John, and you work at McDonald's. You are a deeply disturbed person who has a strong desire to tell people that you know how doors work."`}
              className='mt-4 flex max-h-[400px] min-h-[175px] w-full max-w-[600px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[150px] md:min-h-[100px] md:text-sm'
            />
            <Button className='mt-4' onClick={() => setSystemPrompt('')}>
              Clear
            </Button>
          </section>
          <section>
            <h2 className='text-2xl font-bold'>Message History</h2>
            <p className='mt-1 text-muted-foreground/80'>{"Save your history as JSON, or import someone else's."}</p>
            <div className='mt-4 flex flex-row gap-2'>
              <Button variant='secondary' onClick={() => handleImport()}>
                <Download className='mr-2 h-5 w-5' />
                Import
              </Button>
              <Button variant='secondary' onClick={handleExport}>
                <Upload className='mr-2 h-5 w-5' />
                Export
              </Button>
            </div>
          </section>
          <section className='w-fit space-y-2 rounded-lg border border-muted-foreground/10 p-4 hover:bg-red-800/20'>
            <h2 className='text-2xl font-bold'>Danger Zone</h2>
            <p className='text-sm text-muted-foreground/80'>
              Permanently delete your history from both your local device and the database.
            </p>
            <div className='mt-4 flex flex-row gap-2'>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant='destructive'>
                    <Trash className='mr-2 h-5 w-5' />
                    Delete Chat History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Delete Chat History</DialogTitle>
                  <p className='text-sm text-muted-foreground/80'>
                    Are you sure you want to delete your chat history? This action cannot be undone.
                  </p>
                  <div className='mt-4 flex flex-row gap-2'>
                    <Button variant='destructive' onClick={handleDelete}>
                      Delete
                    </Button>
                    <Button variant='secondary' onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
