import { ComponentProps } from "react";

export default function SelectField({label, name, children, ...props}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <select
          className="block w-full outline-none border-0 rounded ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 px-2 py-1.5"
          id={name}
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  )
}

interface SelectFieldProps extends ComponentProps<"select"> {
  label: string,
}