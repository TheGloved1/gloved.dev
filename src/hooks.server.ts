import { withClerkHandler } from 'svelte-clerk/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = withClerkHandler();
