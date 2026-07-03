import { useState } from "react";
import React from "react";
import { InputNumber } from "antd";

export default function LabelledInputField({ label, name, ...props }: LabelledInputFieldProps) {

  return (
    <div>
      <label htmlFor={name} className="block text-[13px] font-medium text-[#555] mb-1">
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

  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOnChange = (value: number | null) => {
    const v = value === null ? NaN : value;

    const { valid, msg } = checkValidity(v, minValue)
    setIsValid(valid);
    setErrorMsg(msg);

    if (valid) {
      setField(v);
    }
  }

  return (
    <div {...props}>
      <InputNumber
        style={{ width: "100%" }}
        id={name}
        name={name}
        defaultValue={parseFloat(defaultValue)}
        status={isValid ? "" : "error"}
        controls={false}
        onChange={handleOnChange}
      />
      {!isValid &&
        <div className="text-sm text-red-500 mt-1">
          {errorMsg}
        </div>
      }
    </div>
  );
}

interface InputFieldProps extends Omit<React.ComponentProps<"div">, "onChange"> {
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
