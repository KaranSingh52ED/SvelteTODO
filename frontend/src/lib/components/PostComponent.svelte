<script lang="ts">
	import type { Post, User } from '$lib/types';
	import type { RecordModel } from 'pocketbase';
	import Button from './Button.svelte';
	import { pb } from '$lib/pocketbase';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import Highlight from 'highlight.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let post: Post & RecordModel;
	export let authModel: User | undefined;

	let contentRef: HTMLElement | undefined;
	let titleRef: HTMLElement | undefined;
	let categoryRef: HTMLElement | undefined;
	let tagsRef: HTMLElement | undefined;

	let draggedItem: string | undefined;
	let draggedOverItem: string | undefined;

	onMount(() => {
		if (contentRef) {
			Highlight.highlightElement(contentRef);
		}
	});

	function handleDragStart(event: DragEvent, item: string) {
		draggedItem = item;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	async function handleDrop(event: DragEvent, item: string) {
		event.preventDefault();
		draggedOverItem = item;

		if (draggedItem && draggedOverItem) {
			// Interchange the content based on drag and drop
			if (draggedItem === 'title' && draggedOverItem === 'content') {
				[post.title, post.content] = [post.content, post.title];
			} else if (draggedItem === 'content' && draggedOverItem === 'title') {
				[post.content, post.title] = [post.title, post.content];
			} else if (draggedItem === 'category' && draggedOverItem === 'tags') {
				[post.category, post.tags[0]] = [post.tags[0], post.category];
			} else if (draggedItem === 'tags' && draggedOverItem === 'category') {
				[post.tags[0], post.category] = [post.category, post.tags[0]];
			}

			// Reset the dragged item references
			draggedItem = undefined;
			draggedOverItem = undefined;

			// Update the post in the PocketBase backend
			await updatePostInPocketBase();
		}
	}

	async function updatePostInPocketBase() {
		try {
			await pb.collection('posts').update(post.id, post);
			console.log('Post updated successfully');
		} catch (error) {
			console.error('Error updating post:', error);
		}
	}
</script>

<header>
	<h1
		bind:this={titleRef}
		draggable="true"
		on:dragstart={(event) => handleDragStart(event, 'title')}
		on:drop={(event) => handleDrop(event, 'title')}
		on:dragover={handleDragOver}
	>
		{post.title}
	</h1>

	{#if authModel && post.user.id === authModel.id}
		<form action="/posts/{post.id}?/deletePost" method="post">
			<Button size="icon" variant="destructive">
				<iconify-icon icon="ph:trash"></iconify-icon>
			</Button>
		</form>
	{/if}
</header>

<pre>
	<div
		class="category"
		bind:this={categoryRef}
		draggable="true"
		on:dragstart={(event) => handleDragStart(event, 'category')}
		on:drop={(event) => handleDrop(event, 'category')}
		on:dragover={handleDragOver}>
		{post.category}
	</div>
	<code
		bind:this={contentRef}
		draggable="true"
		on:dragstart={(event) => handleDragStart(event, 'content')}
		on:drop={(event) => handleDrop(event, 'content')}
		on:dragover={handleDragOver}>
		{post.content}
	</code>
</pre>

<section
	class="tags"
	bind:this={tagsRef}
	draggable="true"
	on:dragstart={(event) => handleDragStart(event, 'tags')}
	on:drop={(event) => handleDrop(event, 'tags')}
	on:dragover={handleDragOver}
>
	{#each post.tags as tag}
		<div class="tag">
			<span>{tag}</span>
		</div>
	{/each}
</section>

<section class="actions">
	<a href="/profiles/{post.user.id}" class="account">
		{#if $pb && post.user.photo}
			<img src={$pb.getFileUrl(post.user, post.user.photo)} alt={post.user.name} />
		{:else}
			<iconify-icon icon="ic:round-account-circle"></iconify-icon>
		{/if}

		<p>{post.user.name}</p>
	</a>

	<div class="interactions">
		{#if authModel}
			<form
				action="/posts/{post.id}?/toggleLiked&redirect={$page.url.pathname}"
				method="post"
				use:enhance={() => {
					if (post && authModel) {
						if (post.likes.includes(authModel.id)) {
							let { id } = authModel;
							post.likes = post.likes.filter((user) => user !== id);
						} else {
							post.likes = [...post.likes, authModel.id];
						}
					}

					return async ({ update }) => {
						await update({ invalidateAll: true, reset: true });
					};
				}}
			>
				<Button size="icon" variant="ghost">
					{#key post.likes}
						<iconify-icon
							in:fade={{ duration: 200 }}
							icon="mdi:heart{post.likes.includes(authModel.id) ? '' : '-outline'}"
							class:liked={post.likes.includes(authModel.id)}
						></iconify-icon>
					{/key}
				</Button>
			</form>
		{/if}
	</div>
</section>

<style>
	pre {
		tab-size: 4;
		display: flex;
		flex-direction: column;
		position: relative;
		max-height: 60vh;
	}
	[draggable='true'] {
		cursor: move;
	}

	[draggable='true']:active {
		opacity: 0.5;
	}

	code {
		border-radius: 8px;
		padding: 1rem;
		overflow-x: scroll;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h1 {
		font-size: 24px;
	}

	iconify-icon {
		font-size: 20px;
	}

	.category {
		position: absolute;
		background-color: var(--secondary-color);
		padding: 2px 1rem;
		border-radius: 8px;
		top: 1rem;
		align-items: center;
		text-align: center;
		right: 1rem;
		color: var(--accent-color);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		overflow: scroll;
		padding: 4px;
	}

	.account {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		text-decoration: none;
	}

	.interactions {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.interactions iconify-icon {
		font-size: 24px;
	}

	.liked {
		color: var(--accent-color);
	}

	img {
		width: 32px;
		height: 32px;
		border-radius: 100px;
		object-fit: cover;
	}

	.account iconify-icon {
		font-size: 32px;
	}

	.tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tag {
		padding: 5px 10px;
		background-color: var(--secondary-color);
		font-size: 14px;
		border-radius: 8px;
	}

	.tag::before {
		content: '#';
		color: var(--accent-color);
	}
</style>
