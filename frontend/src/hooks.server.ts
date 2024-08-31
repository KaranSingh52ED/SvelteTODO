import { POCKETBASE_PRIVATE_EMAIL, POCKETBASE_PRIVATE_PASSWORD } from '$env/static/private';
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { backendUrl } from './../src/config';
export const handle = async ({ event, resolve }) => {
	event.locals.pocketBase = new PocketBase(`${backendUrl}`);

	try {
		event.locals.pocketBase.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

		await event.locals.pocketBase.collection('users').authRefresh();
	} catch (error) {
		event.locals.pocketBase.authStore.clear();
	}

	event.locals.pocketBaseAdmin = new PocketBase(`${backendUrl}`);

	try {
		await event.locals.pocketBaseAdmin.admins.authWithPassword(
			POCKETBASE_PRIVATE_EMAIL,
			POCKETBASE_PRIVATE_PASSWORD
		);
	} catch (error) {
		throw fail(500);
	}

	pb.set(event.locals.pocketBase);

	const response = await resolve(event);

	response.headers.set(
		'set-cookie',
		event.locals.pocketBase.authStore.exportToCookie({
			sameSite: true,
			secure: false,
			httpOnly: false
		})
	);

	return response;
};
