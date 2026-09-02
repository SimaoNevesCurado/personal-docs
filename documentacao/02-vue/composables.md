# Composables Vue

Composables are functions that reuse stateful logic between Vue components.

They usually start with `use`, live outside the component, and can use Vue features like `ref`, `computed`, `watch` and lifecycle hooks.

The goal is not to move markup out of the component. The goal is to move reusable behavior out of the component.

For example, if multiple components need the same toggle logic, loading state, modal state, filters or local storage behavior, that logic can become a composable.

## When to Create One

- When the same logic appears in multiple components.
- When a component becomes hard to read.
- When local state has its own behavior.

## Basic Shape

A composable is just a function that creates and returns reactive state or functions.

::: code-group

```ts [useToggle.ts]
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const value = ref(initialValue)

  const toggle = () => {
    value.value = !value.value
  }

  return { value, toggle }
}
```

```vue [Component.vue]
<script setup lang="ts">
import { useToggle } from '@/composables/useToggle'

const { value: isOpen, toggle } = useToggle()
</script>

<template>
  <button type="button" @click="toggle">
    Toggle
  </button>

  <div v-if="isOpen">
    Content is visible
  </div>
</template>
```

:::

The component does not need to know how the toggle state works. It only uses the state and the function returned by the composable.

## Naming

Composables should normally start with `use`:

- `useToggle`
- `useModal`
- `useFilters`
- `useLocalStorage`
- `useCurrentUser`

This makes it clear that the function follows Vue composable conventions and may use reactive state internally.

## Modal Composable

A common composable I use is `useModal`. It keeps the modal state and actions outside the component.

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
import LoginModal from './LoginModal.vue'
import { useModal } from '@/composables/useModal'

const {
  isOpen: isLoginModalOpen,
  openModal: openLoginModal,
  closeModal: closeLoginModal,
} = useModal()
</script>

<template>
  <button type="button" @click="openLoginModal">
    Open login
  </button>

  <LoginModal
    :open="isLoginModalOpen"
    @close="closeLoginModal"
  />
</template>
```

```vue [LoginModal.vue]
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
    <section class="modal-panel" role="dialog" aria-modal="true">
      <h2>Login</h2>

      <button type="button" @click="emit('close')">
        Close
      </button>
    </section>
  </div>
</template>
```

:::

The parent owns the state. The modal only receives `open` and emits `close`.

## `data.ts` Files

I use `data.ts` files to remove static constants from the component.

This is different from a composable. A composable is for reusable stateful logic. A `data.ts` file is for static data, options, labels, links or configuration that does not need Vue reactivity.

::: code-group

```ts [data.ts]
export const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Posts',
    href: '/posts',
  },
  {
    label: 'Settings',
    href: '/settings',
  },
]
```

```vue [Navigation.vue]
<script setup lang="ts">
import { navigationItems } from './data'
</script>

<template>
  <nav>
    <a
      v-for="item in navigationItems"
      :key="item.href"
      :href="item.href"
    >
      {{ item.label }}
    </a>
  </nav>
</template>
```

:::

This keeps the component focused on rendering and interaction instead of filling the script block with constants.

Use `data.ts` for things like menu items, tabs, select options, table columns, static cards or repeated labels.

If the file starts using `ref`, `computed`, `watch` or lifecycle hooks, it is probably a composable and should be named like `useSomething.ts` instead.

## Notes

Do not create a composable for every small variable. If the logic is only used once and the component is still easy to read, keep it in the component.

Create a composable when the behavior has a clear name and makes the component simpler.
