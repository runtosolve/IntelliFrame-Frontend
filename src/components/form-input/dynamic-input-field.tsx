import React, { useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { InputField } from "./input-field";

export default function DynamicInputFiled({ label, name, value, setField }: DynamicInputFiledProps) {

  return (
    <div>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <div>
          <div className="space-y-3">
            {value.map((span, spanIndex) => (
              <div
                className="flex items-center"
                key={span.id}
                >
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
                <button className="ml-4 h-6 w-6 rounded-full border border-gray-300 hover:bg-gray-200 text-sm font-semibold text-gray-900 text-center align-middle"
                  onClick={(e) => {
                    e.preventDefault();
                    setField(value.filter((_, index) => (index != spanIndex)))
                  }}
                >
                  -
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-2 w-full bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm font-semibold text-gray-900 align-middle"
            onClick={e => {
              e.preventDefault();
              setField([...value, {id: uuidv4(), value: 12}]);
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

type DynamicInputFiledProps = {
  label: string,
  name: string,
  value: Array<{id: string, value: number}>
  setField: (v: Array<{id: string, value: number}>) => void
}

type DynamicFieldValue = {
  id: string,
  value: number
}