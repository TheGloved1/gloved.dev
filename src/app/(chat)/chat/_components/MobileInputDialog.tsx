import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAutoResizeTextarea } from '@/hooks/use-autoresize-textarea';

export default function MobileInputDialog({
  input,
  setInput,
  isOpen,
  setIsOpen,
  onSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (value: string) => void;
}) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 50 });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpen(false);
    onSubmit(input);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='-translate-y-full sm:max-w-[425px] md:max-w-[650px]'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold'>Type your message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex flex-col'>
          <textarea
            className='w-full resize-none rounded-lg border border-border bg-transparent p-1 text-base leading-6 text-neutral-100 outline-none focus:outline-none disabled:opacity-0'
            value={input}
            placeholder={`Type message here...`}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            ref={textareaRef}
          />
          <span className='flex flex-row justify-between'>
            <Button
              type='button'
              variant='outline'
              className='mr-2 mt-2 w-full'
              onClick={() => {
                setInput('');
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant='default' type='submit' className='ml-2 mt-2 w-full'>
              Send
            </Button>
          </span>
        </form>
      </DialogContent>
    </Dialog>
  );
}
