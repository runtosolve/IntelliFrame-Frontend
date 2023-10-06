import { useState } from "react";
import React from "react";

export default function LabelledInputField({ label, name, ...props }: LabelledInputFieldProps) {

  return (
    <div>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <InputField
        name={name}
        {...props}
        />
    </div>
  );
}

export function InputField({ name, defaultValue, minValue = 0, setField, ...props }: InputFieldProps) {
  
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isValid, setIsValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
    const v = parseFloat(e.currentTarget.value)

    const { valid, msg } = checkValidity(v, minValue)
    setIsValid(valid);
    setErrorMsg(msg);

    if (valid) {
      setField(v);
    }
  }

  return (
    <div {...props}>
      <input
        className="block w-full no-spinner outline-none border-0 rounded ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 px-2 py-1.5"
        name={name}
        value={inputValue}
        type="number"
        onChange={handleOnChange}
      />
      {!isValid &&
        <div className="text-sm text-red-500">
          {errorMsg}
        </div>
      }
    </div>
  );
}

interface InputFieldProps extends React.ComponentProps<"div"> {
  name: string,
  defaultValue: string,
  minValue?: number,
  setField: (v: number) => void  
}


interface LabelledInputFieldProps extends InputFieldProps {
  label: string,
}

function checkValidity(v: number, minValue: number) {
  if (isNaN(v)) {
    return { valid: false, msg: "Input must be a number" }
  }

  // Check negative
  if (v < minValue) {
    return { valid: false, msg: `Input must not be smaller than ${minValue}`};
  }

  return { valid: true, msg: "" };
}