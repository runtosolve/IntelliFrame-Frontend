import CellInput from "./cell-input";
import CellSelect from "./cell-select";

export default function InputTable() {

  const OPTIONS = ["Number", "Cross-section", "Left lap", "Span", "Right lap"]

  const SECTION_OPTIONS = [
    {value: "Z8x2.5 060", name: "Z8x2.5 060"},
    {value: "Z10x3.0 080", name: "Z10x3.0 0680"}
  ]

  const data = [
    { number: 1, crossSection: "Z8x2.5 060", leftGap: 0, span: 240, rightGap: 8 },
    { number: 2, crossSection: "Z8x2.5 060", leftGap: 8, span: 120, rightGap: 0 }
  ];

  return (
    <div className="w-full overflow-x-auto mb-4">
      <table className="w-full whitespace-nowrap divide-y divide-gray-300 my-4 text-center table-auto">
        <thead>
          <tr>
            {OPTIONS.map(item => 
              <th
                key={item}
                className="font-medium"
              >
                {item}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(row => 
            <tr 
              key={row.number}
            >
              <td>
                {row.number}
              </td>
              <CellSelect options={SECTION_OPTIONS}/>
              <CellInput/>
              <CellInput/>
              <CellInput/>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

