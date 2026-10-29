import { useState } from "react";
import React from "react";
import { InputNumber } from "antd";

export default function LabelledInputField({ label, unit, name, ...props }: LabelledInputFieldProps) {

  return (
    <div>
      <label htmlFor={name} className="field-label">
        <span>{label}</span>
      </label>
      <InputField
        name={name}
        unit={unit}
        {...props}
        />
    </div>
  );
}

export function InputField({ name, defaultValue, minValue = 0, setField, unit, className, ...props }: InputFieldProps) {

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
    <div className={["field-input-wrap", className].filter(Boolean).join(" ")} {...props}>
      <InputNumber
        style={{ width: "100%" }}
        id={name}
        name={name}
        defaultValue={parseFloat(defaultValue)}
        status={isValid ? "" : "error"}
        controls={false}
        suffix={unit ? <span className="field-inline-unit">{unit}</span> : undefined}
        aria-describedby={!isValid ? `${name}-error` : undefined}
        onChange={handleOnChange}
      />
      {!isValid &&
        <div id={`${name}-error`} role="alert" className="field-error">
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
  setField: (v: number) => void,
  unit?: string,
}


interface LabelledInputFieldProps extends InputFieldProps {
  label: string,
  unit?: string,
}

function checkValidity(v: number, minValue: number) {
  if (isNaN(v)) {
    return { valid: false, msg: "Input must be a number" }
  }

  if (v < minValue) {
    return { valid: false, msg: `Input must not be smaller than ${minValue}`};
  }

  return { valid: true, msg: "" };
}
