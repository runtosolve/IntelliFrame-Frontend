import { useContext } from "react";
import AuthContext from "./auth-context";

export default function AccountButton() {

  const authContextValue = useContext(AuthContext);

  // const handleTestRun = async () => {
  //   const response = await fetch("http://localhost:8000/api/purlinline/submit_job/", {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + String(authContextValue.accessToken),
  //     }
  //   });

  //   let data = await response.json();

  //   console.log(data);

  // }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-neutral btn-sm">Account</div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <div>Signed in as {authContextValue.username}</div>
        </li>
        {/* <li>
          <div onClick={handleTestRun}>Test purlinline run</div>
        </li> */}
        <li>
          <div onClick={() => authContextValue.logOutUser()}>Sign out</div>
        </li>
      </ul>
    </div>
  );
}

