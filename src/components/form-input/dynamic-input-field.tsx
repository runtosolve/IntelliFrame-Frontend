import React, { useState } from "react"
import { v4 as uuidv4 } from 'uuid';

export default function DynamicInputFiled({ label, name }: DynamicInputFiledProps) {
  
  const [spans, setSpans] = useState([
    {id: uuidv4(), value: 16},
    {id: uuidv4(), value: 12},
  ])
  
  return (
    <div>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <div>
          <div className="space-y-3">
            {spans.map((span, spanIndex) => (
              <div
                className="flex items-center"
                key={span.id}
                >
                <input
                  className="flex-1 block w-full no-spinner outline-none border-0 rounded ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 px-2 py-1.5"
                  value={span.value}
                  onChange={(e) => {
                    const newSpans = [...spans];
                    newSpans[spanIndex].value = parseFloat(e.currentTarget.value)
                    setSpans(newSpans);
                  }}
                />
                <button className="ml-4 h-6 w-6 rounded-full border border-gray-300 hover:bg-gray-200 text-sm font-semibold text-gray-900 text-center align-middle"
                  onClick={(e) => {
                    e.preventDefault();
                    setSpans(spans.filter((_, index) => (index != spanIndex)))
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
              setSpans([...spans, {id: uuidv4(), value: 12}]);
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
}

type Span = {
  id: string,
  value: number,
}