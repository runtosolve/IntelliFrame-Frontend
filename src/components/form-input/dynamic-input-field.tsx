import React from "react"
import { v4 as uuidv4 } from 'uuid';
import { Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { InputField } from "./input-field";

export default function DynamicInputFiled({ label, unit, name, value, setField }: DynamicInputFiledProps) {

  return (
    <div>
      <div className="field-label">
        <span>{label}</span>
        {unit && <span className="field-unit">{unit}</span>}
      </div>
      <div className="space-y-2.5">
        {value.map((span, spanIndex) => (
          <div
            className="flex items-center gap-2"
            key={span.id}
            >
            <span className="span-index" aria-hidden>{spanIndex + 1}</span>
            <InputField
              className="flex-1"
              name={`span-${spanIndex}`}
              defaultValue={span.value.toString()}
              minValue={1}
              setField={(v) => {
                const newSpans = [...value];
                newSpans[spanIndex].value = v;
                setField(newSpans);
              }}
            />
            <Button
              type="text"
              shape="circle"
              danger
              aria-label={`remove span ${spanIndex + 1}`}
              icon={<MinusCircleOutlined />}
              disabled={value.length <= 1}
              onClick={() => setField(value.filter((_, index) => (index != spanIndex)))}
            />
          </div>
        ))}
        <Button
          className="w-full"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setField([...value, {id: uuidv4(), value: 12}])}
        >
          Add span
        </Button>
      </div>
    </div>
  )
}

type DynamicInputFiledProps = {
  label: string,
  unit?: string,
  name: string,
  value: Array<{id: string, value: number}>
  setField: (v: Array<{id: string, value: number}>) => void
}
