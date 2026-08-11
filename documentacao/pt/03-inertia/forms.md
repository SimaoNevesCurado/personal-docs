# Forms Inertia

## Padrão Base

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
})

const submit = () => {
  form.post('/users')
}
</script>
```

## Notas

- Validação fica no Laravel.
- Erros regressam automaticamente ao form.
- Usar `processing` para bloquear double submit.
