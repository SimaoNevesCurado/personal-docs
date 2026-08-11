# Forms Inertia

## Base Pattern

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


## Notes

- Validation stays in Laravel.
- Errors automatically return to the form.
- Use `processing` to block double submits.
