import { Select } from "antd";

export default function LabelledSelectField({ label, name, options, value, defaultValue, onChange }: LabelledSelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-[13px] font-medium text-[#555] mb-1">
        {label}
      </label>
      <Select
        className="w-full"
        id={name}
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
