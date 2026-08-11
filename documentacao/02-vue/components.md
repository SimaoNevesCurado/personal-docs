# Vue Components

## Recommended Structure

```vue
<script setup>
defineProps({
  title: String,
})
</script>

<template>
  <section>
    <h2>{{ title }}</h2>
  </section>
</template>
```

## Notes

- Props for received data.
- Emits to communicate upwards.
- Slots when content needs to stay flexible.
