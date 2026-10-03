import { Select } from "antd";

export default function LabelledSelectField({ label, name, options, value, defaultValue, onChange }: LabelledSelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <Select
        className="w-full"
        id={name}
        aria-label={label}
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        showSearch
        optionFilterProp="label"
      />
    </div>
  )
}

interface LabelledSelectFieldProps {
  label: string,
  name: string,
  options: Array<{ label: string, value: string }>,
  value?: string,
  defaultValue?: string,
  onChange: (value: string) => void,
}
