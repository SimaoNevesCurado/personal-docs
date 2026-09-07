# Modals

Modals are useful when the user needs to confirm an action, edit something quickly, or focus on a small flow without leaving the page.

I prefer making modals controlled by the parent component. The parent owns the `open` state, and the modal receives that state through props.

## Basic Flow

The usual modal flow is:

- Parent stores whether the modal is open.
- Parent passes `open` to the modal.
- Modal renders when `open` is true.
- Modal emits `close` when the user clicks cancel, the backdrop, the close button, or presses Escape when the modal primitive supports it.
- Parent decides what happens next.

## Basic Modal

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import { ref } from 'vue'
import DeletePostModal from './DeletePostModal.vue'

const isDeleteModalOpen = ref(false)

function openDeleteModal() {
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}
</script>

<template>
  <button type="button" @click="openDeleteModal">
    Delete post
  </button>

  <DeletePostModal
    :open="isDeleteModalOpen"
    @close="closeDeleteModal"
  />
</template>
```

```vue [DeletePostModal.vue]
<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <section
      class="modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-post-title"
    >
      <h2 id="delete-post-title">Delete post?</h2>
      <p>This action cannot be undone.</p>

      <div class="modal-actions">
        <button type="button" @click="emit('close')">
          Cancel
        </button>

        <button type="button">
          Delete
        </button>
      </div>
    </section>
  </div>
</template>
```

:::

The modal does not own the open state. It receives `open` and asks the parent to close by emitting `close`.

## With A Composable

If the same modal state appears in several places, move the open and close logic to a composable.

::: code-group

```ts [useModal.ts]
import { ref } from 'vue'

export function useModal(initialValue = false) {
  const isOpen = ref(initialValue)

  const openModal = () => {
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
  }

  return { isOpen, openModal, closeModal }
}
```

```vue [Parent.vue]
<script setup lang="ts">
import DeletePostModal from './DeletePostModal.vue'
import { useModal } from '@/composables/useModal'

const {
  isOpen: isDeleteModalOpen,
  openModal: openDeleteModal,
  closeModal: closeDeleteModal,
} = useModal()
</script>

<template>
  <button type="button" @click="openDeleteModal">
    Delete post
  </button>

  <DeletePostModal
    :open="isDeleteModalOpen"
    @close="closeDeleteModal"
  />
</template>
```
:::

This keeps repeated modal state out of the component.

## Confirm Actions

For destructive actions, the modal should only confirm the intent. The actual delete logic usually belongs in the parent or in a form/action flow.

```vue
<DeletePostModal
  :open="isDeleteModalOpen"
  @close="closeDeleteModal"
  @confirm="deletePost"
/>
```


This keeps the modal reusable. It does not need to know how posts are deleted.

## Notes

- Keep the modal controlled by props and emits.
- Use `@click.self` if clicking the backdrop should close the modal.
- Use a tested base dialog that manages focus, Escape, an accessible name, scroll locking, and focus restoration. ARIA attributes alone are not enough.
- Do not put large business flows inside the modal component.
- If a modal has too many props or actions, it may need to be split into smaller components.
- To reuse one form modal for both operations, see [Create And Update With One Modal](/03-inertia/form-modals).
