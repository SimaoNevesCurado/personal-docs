# Composables Vue

Composables são funções que reutilizam lógica com estado entre componentes Vue.

Normalmente começam com `use`, vivem fora do componente e podem usar funcionalidades do Vue como `ref`, `computed`, `watch` e lifecycle hooks.

O objetivo não é tirar markup do componente. O objetivo é tirar comportamento reutilizável do componente.

Por exemplo, se vários componentes precisam da mesma lógica de toggle, loading, modal, filtros ou local storage, essa lógica pode virar um composable.

## Quando Criar

- Quando a mesma lógica aparece em vários componentes.
- Quando um componente fica difícil de ler.
- Quando existe estado local com comportamento próprio.

## Estrutura Base

Um composable é só uma função que cria e devolve estado reativo ou funções.

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

O componente não precisa de saber como o estado do toggle funciona. Ele só usa o estado e a função devolvidos pelo composable.

## Naming

Composables normalmente devem começar com `use`:

- `useToggle`
- `useModal`
- `useFilters`
- `useLocalStorage`
- `useCurrentUser`

Isto deixa claro que a função segue a convenção de composables do Vue e pode usar estado reativo internamente.

## Composable De Modal

Um composable comum que uso é `useModal`. Ele mantém o estado e as ações do modal fora do componente.

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

O pai é dono do estado. O modal só recebe `open` e emite `close`.

## Ficheiros `data.ts`

Eu uso ficheiros `data.ts` para remover constantes estáticas do componente.

Isto é diferente de um composable. Um composable serve para lógica reutilizável com estado. Um ficheiro `data.ts` serve para dados estáticos, opções, labels, links ou configuração que não precisa de reatividade do Vue.

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

Isto mantém o componente focado em renderização e interação, em vez de encher o script block com constantes.

Usa `data.ts` para coisas como menu items, tabs, opções de selects, colunas de tabelas, cards estáticos ou labels repetidas.

Se o ficheiro começa a usar `ref`, `computed`, `watch` ou lifecycle hooks, provavelmente já é um composable e deve chamar-se algo como `useSomething.ts`.

## Notas

Não cries um composable para cada pequena variável. Se a lógica é usada uma vez e o componente continua fácil de ler, mantém dentro do componente.

Cria um composable quando o comportamento tem um nome claro e deixa o componente mais simples.
