export default function SelectBox({labelName, fieldName, options}) {
  return (
    <div className="flex items-center my-2">
      <label
        htmlFor={fieldName}
        className="px-2 w-48 text-gray-800 text-lg font-medium"
      >
        {labelName}
      </label>
      <SelectList
        fieldName={fieldName}
        options={options}
      />
    </div>
  );
}

export function SelectList({fieldName, options}) {
  return (
    <select
        name={fieldName}
        className="flex-1 outline-none border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 py-1 px-3 text-gray-800"
      >
        {options.map(item =>
          <option
            key={item.value}
            value={item.value}
          >
            {item.name}
          </option>
        )}
    </select>
  );
}