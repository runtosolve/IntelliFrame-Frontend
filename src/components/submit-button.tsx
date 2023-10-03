import {useState} from "react";

export default function SubmitButton() {

  const data = {"loading_direction":"gravity","design_code":"AISI S100-16 ASD","segments":[[300.0,25.0,1,1]],"spacing":60.0,"roof_slope":0.0,"cross_section_dimensions":[["Z",0.059,0.91,2.5,8.0,2.5,0.91,-55.0,0.0,90.0,0.0,-55.0,0.177,0.177,0.177,0.177]],"material_properties":[[29500.0,0.3,55.0,70.0]],"deck_details":["vertical leg standing seam",18.0],"deck_material_properties":[29500.0,0.3,55.0,70.0],"frame_flange_width":10.0,"support_locations":[0.0,300.0],"purlin_frame_connections":"bottom flange connection","bridging_locations":[]}

  const [result, setResult] = useState({})

  const handleClick = () => {
    fetch("http://localhost:8080/api/purlinline", {
      method: "POST",
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setResult(data)
      })
      .catch(err => console.log(err))
  }

  return (
    <>
      <div>
        <button
          className="bg-gray-800 hover:bg-gray-600 text-gray-100 rounded px-4 py-1"
          onClick={handleClick}>
          Run analysis
        </button>
        <div>
          {result.failure_location ?? ""}
        </div>
      </div>
    </>
  );
}