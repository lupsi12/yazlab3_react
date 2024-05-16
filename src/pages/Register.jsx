import Layout from "../components/Layout/Layout";
import "../styles/Register.css";
import {useState} from "react";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        password: ""
    });
// İlgi alanları listesi ve seçilen ilgi alanları state'i
    const [interests, setInterests] = useState([
        { id: 1, name: 'customer relationship management', selected: false },
        { id: 2, name: 'temporal logic', selected: false },
        { id: 3, name: 'simplex method', selected: false },
        { id: 4, name: 'discrete location theory', selected: false },
        { id: 5, name: 'specification', selected: false },
        { id: 6, name: 'online scheduling', selected: false},
        { id: 7, name: 'hardness of approximation', selected: false},
        { id: 8, name: 'topology', selected: false},
        { id: 9, name: 'blockchain', selected: false},
        { id: 10, name: 'smart contracts', selected: false},
        { id: 11, name: 'decentralized exchange', selected: false}

    ]);

    // Bir ilgi alanını seçme işlevi
    const selectInterest = (id) => {
        setInterests(
            interests.map((interest) =>
                interest.id === id ? { ...interest, selected: !interest.selected } : interest
            )
        );
    };

    const selectedInterests = interests.filter((interest) => interest.selected).map((interest) => interest.name.toLowerCase());

    const selectedInterestsString = selectedInterests.join(' ');

    // Form girdilerinin değişimini takip eden fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    // Form submit işlemi
    const handleSubmit = async (e) => {
        e.preventDefault(); // Formun varsayılan davranışını engelle

        // Kullanıcı bilgilerinin dolu olup olmadığını kontrol et
        if (userData.username !== "" && userData.email !== "" && userData.password !== "") {
            try {
                const response = await fetch("/user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: userData.username,
                        email: userData.email,
                        password: userData.password,
                        interests: selectedInterestsString,
                        fasttext: "",
                        scibert: "",
                        recall_fasttext: "",
                        precision_fasttext: "",
                        secim_fasttext: "",
                        recall_scibert: "",
                        precision_scibert: "",
                        secim_scibert: ""
                    }),
                });
                if (response.ok) {
                    console.log("User created.");
                    navigate('/login');
                    // Kullanıcı başarıyla oluşturulduktan sonra, istediğiniz sayfaya yönlendirebilirsiniz
                    // navigate('/success');
                } else {
                    // Sunucudan gelen hata mesajını al ve console.log ile göster
                    const errorMessage = await response.text();
                    console.error("An error occurred:", errorMessage);
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        } else {
            console.log("Please fill in all fields.");
        }
    };

    return(
        <Layout>
            <div className="registerContainer">
                <h2>REGISTER</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" value={userData.username}
                           onChange={handleInputChange}/>
                    <input type="email" name="email" placeholder="E-mail" value={userData.email}
                           onChange={handleInputChange}/>
                    <input type="password" name="password" placeholder="Password" value={userData.password}
                           onChange={handleInputChange}/>
                    <input type="submit" value="Register"/>
                </form>
                <div>
                    <h2>İlgi Alanlarınızı Seçin</h2>
                    <ul className="interests-list">
                        {interests.map((interest) => (
                            <li key={interest.id} onClick={() => selectInterest(interest.id)}
                                style={{cursor: 'pointer', textDecoration: interest.selected ? 'underline' : 'none'}}>
                                {interest.name}
                            </li>
                        ))}
                    </ul>
                    <h3>Seçilen İlgi Alanları:</h3>
                    <ul>
                        {interests.filter((interest) => interest.selected).map((interest) => (
                            <li key={interest.id}>{interest.name}</li>
                        ))}
                    </ul>
                    <p>Seçilen İlgi Alanları: {selectedInterestsString}</p>

                </div>
            </div>
        </Layout>
    )
}
export default Register;