import { MediaQuery } from 'svelte/reactivity';

const DEFAULT_MOBILE_BREAKPOINT = 768;

/**
 * A reactive class that extends MediaQuery to check if the viewport width is below a specified breakpoint.
 * Defaults to 768px.
 *
 * ```svelte
 * <script>
 * 	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
 *
 * 	const isMobile = new IsMobile();
 * </script>
 *
 * {#if isMobile}
 * 	<!-- Mobile-specific content -->
 * {:else}
 * 	<!-- Desktop-specific content -->
 * {/if}
 * ```
 */
export class IsMobile extends MediaQuery {
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		super(`max-width: ${breakpoint - 1}px`);
	}
}
