export default function ResultsDisplay() {

  const results = {
    capacity: {
      value: 7.9,
      unit: "plf",
    },
    failureMode: "Distortional buckling",
    limitStates: [
      "Local buckling (LB)",
      "Distortional buckling (DB)",
      "Lateral-torsional buckling (LTB)",
      "Web crippling (WC)"
    ]
  }

  return (
    <div className="w-1/2 mt-6">
      <ReportCard title="Predicted load capacity">
        {`${results.capacity.value} ${results.capacity.unit}`}
      </ReportCard>
      <ReportCard title="Predidcted failure mode">
        {`${results.failureMode}`}
      </ReportCard>
      <ReportCard title="Deflected shapes and failure locations">
        Loading...
      </ReportCard>
      <ReportCard title="Strength limit states checked">
        <ul>
          {results.limitStates.map(item => (<li key={item}>{item}</li>))}
        </ul>
      </ReportCard>
    </div>
  );
}

function ReportCard({title, children}: React.ComponentProps<"div">) {
  return (
    <div className="collapse collapse-arrow bg-base-100 border borer-base-300">
        <input type="checkbox" /> 
        <div className="collapse-title text-lg font-medium">
          {title}
        </div>
        <div className="collapse-content">
          <p>
            {children}
          </p>
        </div>
      </div>
  );
}

