export default function CellSelect({options}) {
  return (
    <td
      className="py-2 whitespace-nowrap"
    >
      <select
        className="outline-none text-center"
      >
        {options.map(item =>
          <option
            key={item.value}
            value={item.value}
          >
            {item.name}
          </option>
        )}
      </select>
    </td>
    
  );
}