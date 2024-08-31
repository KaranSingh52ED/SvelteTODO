import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { backendUrl } from '../../src/config';
export const pb = writable<PocketBase | undefined>(undefined, (set) => {
	if (!browser) {
		return;
	}

	const pocketbaseInstance = new PocketBase(`${backendUrl}`);

	pocketbaseInstance.authStore.loadFromCookie(document.cookie);

	set(pocketbaseInstance);
});
