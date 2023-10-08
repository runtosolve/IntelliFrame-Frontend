import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";

export default function SubmitButton({ inputState }: SubmitButtonProps) {

  const handleClick = () => {
    fetch("http://localhost:8080/api/purlinline", {
      method: "POST",
      body: mapStateToJSON(inputState)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
      })
      .catch(err => console.log(err))
  }

  return (
    <button
      className="bg-gray-800 hover:bg-gray-600 text-gray-100 rounded px-6 py-2"
      onClick={handleClick}>
      Run analysis
    </button>
  );
}

type SubmitButtonProps = {
  inputState: PurLinLineState
}