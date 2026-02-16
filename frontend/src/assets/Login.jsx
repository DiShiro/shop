import {useState} from "react";
import './App.css'
import{login} from "./api/auth";
import {useNavigate} from "react-router";

function Login() {
    const [userLogin, setLogin] = useState("");
    const [ password, setPassword] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try{
            const user = await login(userLogin, password);
            localStorage.setItem("curUser", JSON.stringify(user));
            navigate("/");
        } catch (e){
            alert (e);
        }
    };
    return (
        <>
        <form onSubmit={submit}>
            <input type="text" onChange={(e) => setUserLogin(e.target.value)} />
            <input type="password" onChange={(e) => setPassword(e.target.value)} />
            <input type ="submit" value="login" />
        </form>
        </>
    )

}
export default Login;