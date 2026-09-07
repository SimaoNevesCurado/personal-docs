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


## Check Boxes

The problem with HTML checkboxes is that when they are unchecked, the browser does not send the field at all.

A simple solution is to add a hidden input before the checkbox:

```vue

<input type="hidden" name="finished" value="0" />
<input name="finished" type="checkbox" value="1" />
```
This ensures that the server always receives a value for finished: 0 when unchecked and 1 when checked.

This avoids additional normalization and simplifies validation on the server.


## Notes

- Validation stays in Laravel.
- Errors automatically return to the form.
- Use `processing` to block double submits.
- For a complete example that shares one form between create and update, see [Create And Update With One Modal](/03-inertia/form-modals).
