import { useState } from "react";
import React from "react";

export default function InputField({ label, name, defaultValue, setField}: InputFieldProps) {
  
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isValid, setIsValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
    const v = parseFloat(e.currentTarget.value)

    const {valid, msg} = checkValidity(v)
    setIsValid(valid);
    setErrorMsg(msg);

    if (valid) {
      setField(v);
    }
  }
  
  return (
    <div>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
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
    </div>
  );
}


type InputFieldProps = {
  label: string,
  name: string,
  defaultValue: string,
  setField: (v: number) => void
}

function checkValidity(v: number) {
  if (!v) {
    return {valid: false, msg: "Input must be a number"}
  }

  // Check negative
  if (v <= 0) {
    return {valid: false, msg: "Input must be greater than 0"};
  }

  return {valid: true, msg: ""};
}