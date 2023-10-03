export default function InputBox({fieldName, labelName}) {
  return (
    <div className="flex items-center my-2">
      <label
        htmlFor={fieldName}
        className="px-2 w-48 px-2 text-gray-800 text-lg font-medium"
      >
        {labelName}
      </label>
      <InputField
        fieldName={fieldName}
      />
    </div>
  );
}

export function InputField({fieldName}) {
  return (
    <input
        name={fieldName}
        placeholder="24"
        className="flex-1 outline-none border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 py-1 px-3 text-gray-800"
    />
  );
}