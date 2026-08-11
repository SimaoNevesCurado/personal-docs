# Componentes Vue

## Estrutura Recomendada

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

## Notas

- Props para dados recebidos.
- Emits para comunicar para cima.
- Slots quando o conteúdo deve ficar flexível.
