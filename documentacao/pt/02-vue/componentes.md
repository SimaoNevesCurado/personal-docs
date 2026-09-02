# Componentes Vue

Componentes dividem a interface em partes mais pequenas e reutilizáveis.

Um componente pode receber dados do componente pai, renderizar esses dados e comunicar de volta através de eventos. Em Vue, as ferramentas principais para isso são props, emits e slots.

## Estrutura Recomendada

Eu prefiro usar `<script setup>` com TypeScript quando possível.

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

## Receber Dados Com Props

Props são a forma de um componente pai passar dados para um componente filho.

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

O pai é dono dos dados. O filho recebe os dados através de props e usa-os no template.

## Múltiplas Props

Quando o componente precisa de mais do que um valor, define as props juntas.

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  isActive: boolean
}>()
</script>
```

O `?` significa que a prop é opcional.

## Valores Por Defeito

Usa `withDefaults()` quando props opcionais precisam de valores por defeito.

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

Agora `size` será `md` se o pai não passar esse valor.

## Enviar Eventos Para Cima

Props enviam dados para baixo. Emits enviam eventos para cima.

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

O filho não apaga o post diretamente. Ele só avisa o pai que a ação de apagar aconteceu.

## Slots

Slots são úteis quando o pai deve controlar parte do conteúdo do componente.

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

Usa props para dados. Usa slots para markup flexível.

## Direção Dos Dados

O fluxo normal dos dados é:

- O pai passa dados para baixo com props.
- O filho renderiza as props.
- O filho comunica ações para cima com emits.
- O pai decide o que deve acontecer a seguir.

Isto deixa os componentes mais fáceis de perceber.

## Notas

- Usa props para dados recebidos.
- Usa emits para comunicar para cima.
- Usa slots quando o conteúdo deve ficar flexível.
- Evita alterar props diretamente dentro do componente filho.
- Se o componente tem props a mais, talvez esteja a fazer demasiadas coisas.
