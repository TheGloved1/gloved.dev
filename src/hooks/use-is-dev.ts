import { checkDevMode } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

export default function useIsDev() {
  const isDev = useQuery({ queryKey: ['devMode'], queryFn: checkDevMode, initialData: false });
  return isDev.data ?? false;
}
