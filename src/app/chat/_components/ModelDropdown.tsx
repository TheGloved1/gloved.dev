'use client';
import { Tooltip } from '@/components/TooltipSystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { checkIsAdminAction } from '@/lib/actions';
import { defaultModel, ModelID, Models } from '@/lib/ai';
import { tryCatch } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ModelDropdown() {
  const { user, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [model, setModel] = useLocalStorage<ModelID>('model', defaultModel);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const checkAdmin = async () => {
      const isAdminAction = await tryCatch(checkIsAdminAction(email));
      if (isAdminAction.error) {
        return;
      }
      setIsAdmin(isAdminAction.data);
    };
    checkAdmin();
  }, [user]);

  return (
    <Select value={model} onValueChange={setModel as (value: string) => void}>
      <SelectTrigger className='max-w-[60vw]' defaultValue={model}>
        <SelectValue placeholder={'Select a model'} />
      </SelectTrigger>
      <SelectContent className='max-w-[60vw] bg-background/90'>
        {Models.map(({ label, value, enabled, description, requirements }) => {
          if (!enabled) return null;
          if (requirements.loggedin && !isSignedIn) return null;
          if (requirements.admin && !isAdmin) return null;

          return (
            <SelectItem key={value} value={value} disabled={!enabled} className='group/select' textValue={label}>
              <span className='flex items-center gap-2'>
                {label}
                <Tooltip content={description} size='sm' unselectable='on' radius={'lg'} maxWidth={'30rem'} asChild>
                  <Info className='size-5 rounded-full opacity-0 hover:bg-gray-500/50 group-hover/select:!opacity-100' />
                </Tooltip>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
