# Modais

Modais são úteis quando o utilizador precisa de confirmar uma ação, editar algo rapidamente ou focar-se num pequeno fluxo sem sair da página.

Eu prefiro que os modais sejam controlados pelo componente pai. O pai é dono do estado `open`, e o modal recebe esse estado através de props.

## Fluxo Base

O fluxo normal de um modal é:

- O pai guarda se o modal está aberto.
- O pai passa `open` para o modal.
- O modal renderiza quando `open` é true.
- O modal emite `close` quando o utilizador clica em cancelar, backdrop, escape ou no botão de fechar.
- O pai decide o que acontece a seguir.

## Modal Base

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
    <section class="modal-panel" role="dialog" aria-modal="true">
      <h2>Delete post?</h2>
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

O modal não é dono do estado aberto/fechado. Ele recebe `open` e pede ao pai para fechar ao emitir `close`.

## Dentro Do Modal

O botão de fechar normalmente vive dentro do modal porque faz parte da UI do modal, mas o estado continua a pertencer ao pai.

```vue [LoginModal.vue]
<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  status?: string
  canResetPassword: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <section class="modal-panel" role="dialog" aria-modal="true">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2>Login</h2>
          <p v-if="status">{{ status }}</p>
        </div>

        <button
          type="button"
          class="border border-black p-1 transition hover:bg-red-100"
          aria-label="Close login modal"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <form>
        <!-- login fields -->
      </form>

      <a v-if="canResetPassword" href="/forgot-password">
        Forgot password?
      </a>
    </section>
  </div>
</template>
```

O modal pode receber props extra como `status` e `canResetPassword`, mas deve continuar a fechar emitindo `close` em vez de alterar diretamente o estado do pai.

## Com Um Composable

Se o mesmo estado de modal aparece em vários sítios, move a lógica de abrir e fechar para um composable.

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

Isto mantém estado repetido de modais fora do componente.

## Confirmar Ações

Para ações destrutivas, o modal deve apenas confirmar a intenção. A lógica real de apagar normalmente pertence ao pai ou ao fluxo de form/action.

```vue
<DeletePostModal
  :open="isDeleteModalOpen"
  @close="closeDeleteModal"
  @confirm="deletePost"
/>
```

Isto mantém o modal reutilizável. Ele não precisa de saber como posts são apagados.

## Notas

- Mantém o modal controlado por props e emits.
- Usa `@click.self` se clicar no backdrop deve fechar o modal.
- Usa `role="dialog"` e `aria-modal="true"` para acessibilidade.
- Não metas fluxos grandes de negócio dentro do componente modal.
- Se um modal tem props ou ações a mais, talvez precise de ser dividido em componentes menores.
