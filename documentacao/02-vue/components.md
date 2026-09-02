# Vue Components

Components split the interface into smaller reusable pieces.

A component can receive data from its parent, render that data, and communicate back through events. In Vue, the main tools for this are props, emits and slots.

## Recommended Structure

I prefer using `<script setup>` with TypeScript when possible.

```vue [UserCard.vue]
<script setup lang="ts">
type User = {
  id: number
  name: string
  email: string
}

defineProps<{
  user: User
}>()
</script>

<template>
  <section class="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </section>
</template>
```

## Receiving Data With Props

Props are how a parent component passes data down to a child component.

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import UserCard from './UserCard.vue'

const user = {
  id: 1,
  name: 'Simao',
  email: 'simao@example.com',
}
</script>

<template>
  <UserCard :user="user" />
</template>
```

```vue [UserCard.vue]
<script setup lang="ts">
type User = {
  id: number
  name: string
  email: string
}

defineProps<{
  user: User
}>()
</script>

<template>
  <article>
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </article>
</template>
```

:::

The parent owns the data. The child receives it through props and uses it in the template.

## Multiple Props

When the component needs more than one value, define all props together.

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  isActive: boolean
}>()
</script>
```

The `?` means the prop is optional.

## Default Values

Use `withDefaults()` when optional props need default values.

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})
</script>
```

Now `size` will be `md` if the parent does not pass it.

## Sending Events Up

Props send data down. Emits send events up.

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import DeleteButton from './DeleteButton.vue'

function deletePost() {
  // delete the post
}
</script>

<template>
  <DeleteButton @delete="deletePost" />
</template>
```

```vue [DeleteButton.vue]
<script setup lang="ts">
const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <button type="button" @click="emit('delete')">
    Delete
  </button>
</template>
```

:::

The child does not delete the post itself. It only tells the parent that the delete action happened.

## Slots

Slots are useful when the parent should control part of the component content.

::: code-group

```vue [Card.vue]
<template>
  <section class="card">
    <slot />
  </section>
</template>
```

```vue [Parent.vue]
<template>
  <Card>
    <h2>Profile</h2>
    <p>This content comes from the parent.</p>
  </Card>
</template>
```

:::

Use props for data. Use slots for flexible markup.

## Data Direction

The normal data flow is:

- Parent passes data down with props.
- Child renders the props.
- Child communicates actions up with emits.
- Parent decides what should happen next.

This keeps components easier to reason about.

## Notes

- Use props for received data.
- Use emits to communicate upwards.
- Use slots when content needs to stay flexible.
- Avoid mutating props directly inside the child component.
- If the component has too many props, it may be doing too much.
