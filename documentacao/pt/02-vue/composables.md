# Composables Vue

## Quando Criar

- Quando a mesma lógica aparece em vários componentes.
- Quando um componente fica difícil de ler.
- Quando existe estado local com comportamento próprio.

## Exemplo

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
