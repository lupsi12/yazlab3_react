import Layout from "../components/Layout/Layout";
import "../styles/Home.css";
import React, { useState } from "react";
import {Card, Divider, IconButton} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [liked, setLiked] = useState({});

    const handleSearch = async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
        try {
            const response = await fetch(`/data/match?keyword=${searchQuery}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCardClick = (index) => {
        setSelectedCard(index);
    };

    const handleLike = (index) => {

        // Beğenme durumunu güncelle
        setLiked(prevLiked => ({
            ...prevLiked,
            [index]: !prevLiked[index]
        }));
        console.log(liked)
    };

    return (
        <Layout>
            <div className="homeContainer">
                <h1>WELCOME!</h1>
                <div className="input-container">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            name="search"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="SEARCH..."
                        />
                        <input type="submit" value="SEARCH" />
                    </form>
                </div>
                <div className="search-results">
                    <h2>Search Results:</h2>
                    <ul>
                        {searchResults.length > 0 ? (
                            <div className="card">
                                {searchResults.map((item, index) => (
                                    <div key={index} className="cardContainerItem">
                                        <Card onClick={() => handleCardClick(index)} className="cardItem">
                                            <div className="cardItemDesign">
                                                <div>
                                                    <p>{item.id} {item.title}</p>
                                                </div>
                                                <div>
                                                    <IconButton onClick={() => handleLike(index)}>
                                                        <FavoriteIcon color={liked[index] ? "error" : "inherit"} />
                                                    </IconButton>
                                                </div>
                                            </div>
                                            <Divider />
                                        </Card>

                                        {selectedCard === index && (
                                            <div className="cardDetail">
                                                <p> Seçilen kartın detayları</p>
                                                <p> User: {item.name} Abstract: {item.abstract_}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Veri bulunamadı.</p>
                        )}
                    </ul>
                </div>
            </div>
        </Layout>
    )
}

export default Home;
