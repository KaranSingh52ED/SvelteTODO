<script context="module">
	export const authModelKey = { name: 'authModel' };
</script>

<script lang="ts">
	import Profile from './Profile.svelte';
	import Security from './Security.svelte';
	import { setContext } from 'svelte';
	import AccountSettings from './AccountSettings.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	setContext(authModelKey, data.authModel);
</script>

<svelte:head>
	<title>Settings - CS</title>
</svelte:head>

<article>
	<div class="left">
		<Profile />

		<Security />
	</div>
	<AccountSettings />
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 700px) {
		article {
			flex-direction: row;
		}

		.left {
			min-width: 20rem;
		}
	}
</style>
