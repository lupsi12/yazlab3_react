import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import {Divider, Card, IconButton} from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import "../styles/User.css";




const User = () => {
    const [userData, setUserData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelData, setModelData] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetailData, setCardDetailData] = useState(null); // Kart detayı verileri
    const [liked, setLiked] = useState({});

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if (userId) {
            fetch(`/user/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(response => response.json())
                .then(data => {
                    setUserData(data);
                })
                .catch(error => console.error("Error fetching user data:", error));
        }
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if (selectedModel === "fasttext") {
            fetch(`/calc?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(response => response.json())
                .then(data => {
                    // FastText verisini cosine_similarity_fasttext özelliğine göre sırala ve setModelData'ya ata
                    const sortedData = data.sort((a, b) => b.cosine_similarity_fasttext - a.cosine_similarity_fasttext);
                    // İlk beş veriyi al
                    const topFiveData = sortedData.slice(0, 5);
                    setModelData(topFiveData);
                })
                .catch(error => console.error("Error fetching FastText data:", error));
        } else if (selectedModel === "scibert") {
            fetch(`/calc?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(response => response.json())
                .then(data => {
                    // Scibert verisini cosine_similarity_scibert özelliğine göre sırala ve setModelData'ya ata
                    const sortedData = data.sort((a, b) => b.cosine_similarity_scibert - a.cosine_similarity_scibert);
                    // İlk beş veriyi al
                    const topFiveData = sortedData.slice(0, 5);
                    setModelData(topFiveData);
                })
                .catch(error => console.error("Error fetching SciBERT data:", error));
        }
        // liked state'i henüz oluşturulmadıysa ve modelData dizisi doluysa
        if (Object.keys(liked).length === 0 && modelData.length > 0) {
            // modelData'nın uzunluğu kadar bir liked state'i oluştur
            const initialLiked = {};
            for (let i = 0; i < modelData.length; i++) {
                initialLiked[i] = 0;
            }
            setLiked(initialLiked);
        }
    }, [selectedModel]);

    const toggleView = () => {
        setShowDetail(prevState => !prevState);
    };

    const handleModelSelection = (model) => {
        setSelectedModel(model);
    };

    const handleCardClick = (index) => {
        const selectedData = modelData[index];
        setSelectedCard(index);
        fetch(`/data/${selectedData.data_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(response => response.json())
            .then(data => {
                setCardDetailData(data);
            })
            .catch(error => console.error("Error fetching data:", error));


    };
    const handleLike = (index) => {


        // Beğenme durumunu güncelle
        setLiked(prevLiked => ({
            ...prevLiked,
            [index]: !prevLiked[index]
        }));
        console.log(liked)
    };

    const handleLikePatch = () => {
        const userId = localStorage.getItem("userId");
        const path = "secim_"+selectedModel;


        const requests = Object.keys(liked).map(index => {
            const item = modelData[index];
            const data = {
                "like": liked[index] // true or false
            };

            return fetch(`/calc/${item.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
        });

        Promise.all(requests)
            .then(responses => {
                if (responses.every(response => response.ok)) {
                    console.log(" Like patch işlemi başarıyla gerçekleştirildi.");
                } else {
                    console.error("Like patch işlemi sırasında bir hata oluştu.");
                }
            })
            .catch(error => console.error("Like patch işlemi sırasında bir hata oluştu:", error));



        const requests2 = Object.keys(liked).map(index => {
            if (liked[index]) {



                fetch(`/user/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        setUserData(data);
                        const interstUser = data.interests;
                    })
                    .catch(error => console.error("Error fetching user data:", error));



                const item = modelData[index];
                return fetch(`/data/${item.data_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Ağ yanıtı başarılı değil");
                        }
                        return response.json();
                    })
                    .then(data => {
                        const keywords = data.keywords;
                        const firstKeyword = keywords.split(';')[0];
                        console.log(keywords);
                        console.log(firstKeyword);
                        return firstKeyword;
                    })
                    .catch(error => {
                        console.error("Kullanıcı verilerini alırken hata oluştu:", error);
                        return null;
                    });
            }
            return Promise.resolve(null); // Beğenilmeyen öğeler için bile bir promise döndürmek için
        });
        Promise.all(requests2)
            .then(results => {
                const validResults = results.filter(result => result !== null);
                if (validResults.length > 0) {
                    const combinedFirstKeywords = validResults.join(" ");  // Combine first keywords into a single string
                    console.log("Combined First Keywords: ", combinedFirstKeywords);


                    const dataI = {
                        "interests":  userData.interests + " " + combinedFirstKeywords
                    };

                    return fetch('/user/' + userId, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(dataI),
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log("Interest patch işlemi başarıyla gerçekleştirildi.");
                            } else {
                                console.error("Interest patch işlemi sırasında bir hata oluştu.");
                            }
                        })
                        .catch(error => console.error("Interest patch işlemi sırasında bir hata oluştu:", error));



                } else {
                    console.log("No valid first keywords found.");
                }
            })
            .catch(error => console.error("Error during first keyword processing:", error));







// liked nesnesindeki id'leri al
        const likedIds = Object.keys(liked);

        console.log("likedIds:", likedIds); // likedIds: ['0', '1', '2']

// Tüm id'leri al
        const allIds = Array.from({ length: modelData.length }, (_, index) => index.toString());

        console.log("allIds:", allIds); // allIds: ['0', '1', '2']

// Tüm id'ler için liked değerlerini oluştur
        const likedValues = allIds.map(id => liked[id] ? '1' : '0');

        console.log("likedValues:", likedValues); // likedValues: ['1', '0', '1']

// liked state'ini 0 ve 1'lere dönüştür
        const likedString = likedValues.join('');

        console.log("likedString:", likedString); // likedString: '101'
        // JavaScript nesnesi oluşturma
        const data = {
            [path]: userData[path]+likedString
        };
        // Patch işlemi yap
        fetch('/user/'+userId, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (response.ok) {
                    console.log("Like işlemi başarıyla gerçekleştirildi.");
                } else {
                    console.error("Like işlemi sırasında bir hata oluştu.");
                }

                window.location.reload();

            })
            .catch(error => console.error("Like işlemi sırasında bir hata oluştu:", error));




    };

    return (
        <Layout>
            <div className="userContainer">
                {userData ? (
                    <>
                        <h1>User Information</h1>
                        <p>ID: {userData.id}</p>
                        <p>USERNAME: {userData.username}</p>
                        {showDetail ? (
                            <>
                                <p>EMAİL: {userData.email}</p>
                                <p>PASSWORD: {userData.password}</p>
                                <p>INTERESTS: {userData.interests}</p>
                                <p>RECALL fasttext: {userData.recall_fasttext}</p>
                                <p>PRECİSİON fasttext: {userData.precision_fasttext}</p>
                                <p>RECALL scibert: {userData.recall_scibert}</p>
                                <p>PRECİSİON scibert: {userData.precision_scibert}</p>
                            </>
                        ) : null}
                        <button onClick={toggleView}>
                            {showDetail ? "Özet Görünümü Göster" : "Detaylı Görünümü Göster"}
                        </button>
                    </>
                ) : (
                    <div>Loading...</div>
                )}
                <div>
                    <Divider/>
                    <button onClick={() => handleModelSelection("fasttext")}>FastText</button>
                    <Divider/>
                    <button onClick={() => handleModelSelection("scibert")}>SciBERT</button>
                </div>
                {selectedModel && (
                    <div>
                        <h2>{selectedModel === "fasttext" ? "FastText" : "SciBERT"} Verileri</h2>
                        {modelData.length > 0 ? (
                            <div className="card">
                                {modelData.map((item, index) => (
                                    <div key={index} className="cardContainerItem">
                                        <Card onClick={() => handleCardClick(index)} className="cardItem">
                                            <div className="cardItemDesign">
                                                <div>
                                                    <p>{selectedModel === "fasttext" ? `ID: ${item.id} COSINE_SIMILARITY_FASTTEXT: ${item.cosine_similarity_fasttext}  ` : `ID: ${item.id} COSINE_SIMILARITY_SCIBERT: ${item.cosine_similarity_scibert} `}</p>
                                                </div>
                                                <div>
                                                    <IconButton onClick={() => handleLike(index)}>
                                                        <FavoriteIcon color={liked[index] ? "error" : "inherit"}/>
                                                    </IconButton>
                                                </div>
                                            </div>
                                            <Divider/>
                                        </Card>

                                        {selectedCard === index && (
                                            <div className="cardDetail">
                                                <p> Seçilen kartın detayları</p>
                                                {cardDetailData ? ( // cardDetailData null değilse
                                                    <div>
                                                        <p> ID: {cardDetailData.name} </p>
                                                        <p> TITLE: {cardDetailData.title}</p>
                                                        <p> ABSTRACT: {cardDetailData.abstract_} </p>
                                                        <p> KEYWORD: {cardDetailData.keywords}</p>
                                                    </div>
                                                ) : (
                                                    <p>Detay verileri yükleniyor...</p>
                                                )}
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Veri bulunamadı.</p>
                        )}
                    </div>
                )}
                <button onClick={() => handleLikePatch()}>SEND IT</button>
            </div>
        </Layout>
    );
}

export default User;
