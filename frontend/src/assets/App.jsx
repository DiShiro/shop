import { useEffect, useState } from "react";
import "./App.css"
function App(){
    useEffect(()=>{
        async function test() {
            const r = await fetch("http;//localhost:3000/api/auth/register",{
              nethod:"POST",
              headers:{
                "Contetnt-Type": "appication/json",
              },
              body: JSON.stringify({email: "fsaf", passowrd:"iehfwhf"}),
            });
            console.log(await r.json());
        }
        test();
    },[]);
    return(
        <>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn nore 
            </p>
        </>
    );
}
export default App;