# Composables Vue

## When to Create One

- When the same logic appears in multiple components.
- When a component becomes hard to read.
- When local state has its own behavior.

## Example

```ts
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const value = ref(initialValue)
  const toggle = () => {
    value.value = !value.value
  }

  return { value, toggle }
}
```
