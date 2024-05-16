import Layout from "../components/Layout/Layout";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import "../styles/Login.css";
const Login = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        email: "",
        password: ""
    });


    // Form girdilerinin değişimini takip eden fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Formun varsayılan davranışını engelle
        const sendRequest = async () => {
            try {
                const response = await fetch("/user?email="+userData.email+"&password="+userData.password, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    console.log(userData.email+" "+userData.password)
                    const userList = await response.json(); // Parse the response body as JSON
                    console.log(userList); // Logging the response JSON data
                    console.log(userList.length);
                    if (userList.length!=0){
                        const userId = userList[0].id;
                        localStorage.setItem("userId", userId);
                        navigate("/user");
                    }
                    return true; // İstek başarılı oldu
                } else {
                    // Sunucudan gelen hata mesajını al ve throw ile fırlat
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
                }
            }
            catch (err) {
                console.log(err)
            }
        }

        try {
            await sendRequest()
            console.log(" user login. ")
        } catch (error) {
            console.error("An error occurred:", error)
        }
    };
    return(
        <Layout>
            <div className="loginContainer">
                <h2>LOGIN</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="E-mail" value={userData.email}
                           onChange={handleInputChange}/>
                    <input type="password" name="password" placeholder="Password" value={userData.password}
                           onChange={handleInputChange}/>
                    <input type="submit" value="Login"/>
                </form>
            </div>
        </Layout>
    )
}
export default Login;