# Create And Update With One Modal

A create form and an edit form often contain the same fields. Instead of maintaining two components, use one feature modal and let the selected record determine the mode:

- `user === null` means create.
- `user !== null` means update.
- The page owns the open state and selected user.
- The modal owns the editable form draft.

This example assumes the application already has an accessible `BaseModal` component. The base component is responsible for focus management, keyboard interaction, the backdrop, and rendering the dialog. The feature modal is responsible for the user form.

## Page State

Keep a single modal instance outside the list. Store the selected user separately from the open state.

```vue [Users/Index.vue]
<script setup lang="ts">
import { ref } from 'vue'
import UserFormModal from '@/components/users/UserFormModal.vue'

type User = {
  id: number
  name: string
  email: string
}

defineProps<{
  users: User[]
}>()

const isUserModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

function openCreateModal() {
  selectedUser.value = null
  isUserModalOpen.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  isUserModalOpen.value = true
}

function closeUserModal() {
  isUserModalOpen.value = false
  selectedUser.value = null
}
</script>

<template>
  <button type="button" @click="openCreateModal">
    Create user
  </button>

  <ul>
    <li v-for="user in users" :key="user.id">
      <span>{{ user.name }}</span>
      <button type="button" @click="openEditModal(user)">
        Edit
      </button>
    </li>
  </ul>

  <UserFormModal
    :open="isUserModalOpen"
    :user="selectedUser"
    @close="closeUserModal"
  />
</template>
```

Set `selectedUser` before opening the modal. This guarantees that the form receives the correct record when its opening watcher runs.

## Feature Modal

The modal derives its title, button label, and submission route from `user`. It copies editable values into `useForm` instead of binding inputs directly to the prop.

```vue [components/users/UserFormModal.vue]
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { store, update } from '@/routes/users'
import BaseModal from '@/components/BaseModal.vue'

type User = {
  id: number
  name: string
  email: string
}

const props = defineProps<{
  open: boolean
  user: User | null
}>()

const emit = defineEmits<{
  close: []
}>()

const form = useForm({
  name: '',
  email: '',
})

const isEditing = computed(() => props.user !== null)
const title = computed(() => isEditing.value ? 'Edit user' : 'Create user')
const submitLabel = computed(() => isEditing.value ? 'Update user' : 'Create user')

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return
    }

    form.defaults({
      name: props.user?.name ?? '',
      email: props.user?.email ?? '',
    })
    form.resetAndClearErrors()
  },
  { immediate: true },
)

function close() {
  if (form.processing) {
    return
  }

  emit('close')
}

function submit() {
  if (form.processing) {
    return
  }

  const action = props.user === null
    ? store()
    : update(props.user.id)

  form.submit(action, {
    preserveScroll: true,
    onSuccess: () => emit('close'),
  })
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    @close="close"
  >
    <form @submit.prevent="submit">
      <div>
        <label for="user-name">Name</label>
        <input
          id="user-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          :aria-invalid="Boolean(form.errors.name)"
          :aria-describedby="form.errors.name ? 'user-name-error' : undefined"
        >
        <p
          v-if="form.errors.name"
          id="user-name-error"
          role="alert"
        >
          {{ form.errors.name }}
        </p>
      </div>

      <div>
        <label for="user-email">Email</label>
        <input
          id="user-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(form.errors.email)"
          :aria-describedby="form.errors.email ? 'user-email-error' : undefined"
        >
        <p
          v-if="form.errors.email"
          id="user-email-error"
          role="alert"
        >
          {{ form.errors.email }}
        </p>
      </div>

      <div>
        <button
          type="button"
          :disabled="form.processing"
          @click="close"
        >
          Cancel
        </button>

        <button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Saving...' : submitLabel }}
        </button>
      </div>

      <p aria-live="polite">
        {{ form.processing ? 'Saving user' : '' }}
      </p>
    </form>
  </BaseModal>
</template>
```

Wayfinder provides the method and URL for `store()` and `update()`. Therefore, the same `form.submit()` call sends `POST` for create and `PUT` or `PATCH` for update, according to the Laravel route definition.

Without Wayfinder, use the explicit Inertia methods instead:

```ts
const options = {
  preserveScroll: true,
  onSuccess: () => emit('close'),
}

if (props.user === null) {
  form.post('/users', options)
} else {
  form.patch(`/users/${props.user.id}`, options)
}
```

## Reset On Every Open

The component usually remains mounted when the modal closes. Without an explicit reset, values and validation errors from one session can appear in the next one.

The opening watcher intentionally runs these operations in order:

1. `defaults()` stores the values for the current user, or empty values for create.
2. `resetAndClearErrors()` restores those defaults and removes errors from the previous session.

Do not continuously watch `props.user` and copy every change into the form. A partial reload could then overwrite fields while the user is typing. Hydrate the form when the modal opens instead.

## Submission Behaviour

- Disable both action buttons while `form.processing` is true.
- Keep the guard inside `submit()` because a form can also be submitted with Enter.
- Close only in `onSuccess`; `onFinish` also runs after validation errors.
- Keep the modal open on validation errors so the user can correct the fields.
- Do not clear errors in `onError`.
- Prevent closing while processing, or explicitly call `form.cancel()` before closing.

The example prevents closing while processing. This avoids an old request completing after another user has already been opened in the same modal.

## Base Modal Contract

`BaseModal` should provide the dialog behaviour shared by every feature modal:

- Render outside clipping containers, usually with `Teleport`.
- Give the dialog an accessible name, such as with `aria-labelledby`.
- Move focus inside when it opens and trap focus while open.
- Close on Escape and backdrop interaction when closing is allowed.
- Restore focus to the trigger when it closes.
- Make the background inert and lock page scrolling.
- Expose a visible close or cancel action.

Adding only `role="dialog"` and `aria-modal="true"` does not implement these behaviours. Prefer a tested dialog primitive inside `BaseModal` instead of recreating focus management in every feature modal.

## Common Mistakes

### Mutating The Prop

Do not use `v-model="user.name"`. Objects are passed by reference, so typing in the form can change the page before the request succeeds. Keep a local `useForm` draft.

### Rendering One Modal Per Row

Do not place `UserFormModal` inside `v-for`. Keep one modal on the page and pass the selected record to it.

### Reusing Old Defaults

Calling only `reset()` can restore values from the first record opened. Update the defaults before resetting.

### Closing Too Early

Do not emit `close` immediately after calling `submit()`. Wait for `onSuccess`, otherwise validation errors arrive in a hidden modal.

## Related

- [Inertia Forms](/development/03-inertia/forms)
- [Vue Modals](/development/02-vue/modals)
- [Vue Components](/development/02-vue/components)
- [Laravel Form Requests](/development/01-laravel/form-requests)
