// src/componets/Autocomplete - components are usually in Title Case
import { Label, TextInput, HelperText } from "flowbite-react";

export default function Autocomplete({
  id,
  label,
  displayField,
  placeholder,
  onSelect,
  onQueryChange,
  options,
  error,
  query,
  isPending
}) {
  const listId = `${id}-suggestions`;

  const helperMessage = error
    ? error.message
    : query.trim() && !isPending && options.length === 0
      ? `${label.toLowerCase()} not found.`
      : "";

  return (
    <div className="form-field">
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        type="search"
        addon="🔍"
        id={id}
        list={listId}
        onChange={(event) => {
          const value = event.target.value;
          onQueryChange(value);
          const match = options.find(
            (option) =>
              String(option[displayField]).toLocaleLowerCase() ===
              value.trim().toLocaleLowerCase()
          );
          onSelect(match ?? null);
        }}
        placeholder={placeholder}
        value={query}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={option[displayField]} />
        ))}
      </datalist>
      {helperMessage && <HelperText color="failure">{helperMessage}</HelperText>}
    </div>
  );
}