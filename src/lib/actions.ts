'use server';
import { env } from '@/env';
import { apiRoute, tryCatch } from '@/lib/utils';

export async function fetchSystemPrompt() {
  const { data, error } = await tryCatch(fetch(apiRoute('/system-prompt')));
  if (error) {
    return '';
  }
  return await data.text();
}

export async function checkDevMode(): Promise<boolean> {
  const environment = env.NODE_ENV;

  if (environment === 'development') {
    return true;
  }
  return false;
}
