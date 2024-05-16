import {Link} from "react-router-dom";
import "../../styles/Header.css";
const Header = () => {
    return(
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <Link to="/" className="logo">
                        Academic Article Suggestion System</Link>
                    <ul className="nav-menu">
                        <li><Link to="/">HOME</Link></li>
                        <li><Link to="/user">USER</Link></li>
                        <li><Link to="/login">LOGIN</Link></li>
                        <li><Link to="/register">REGISTER</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}
export default Header;