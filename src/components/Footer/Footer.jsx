import { FaFacebookF, FaInstagram } from "react-icons/fa";
import './Footer.css';

function Footer() {
    return (
        <footer>
            <div className="footer-container">
                <div className="footer-section">
                    <h2>About us</h2>
                    <p>GradeUpNow offers everything a B.Tech student needs— coding tutorials, cs subjects, tech skills like LinkedIn and GitHub.</p>
                </div>
                <div className="footer-section quick-links">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><a href="">Home</a></li>
                        <li><a href="">Services</a></li>
                        <li><a href="">Contact us</a></li>
                        <li><a href="">About</a></li>
                    </ul>
                </div>
                <div className="footer-section social-links">
                    <h2>Follow us</h2>
                    <ul>
                        <li>       
                            <FaFacebookF />
                            <a href="">Facebook</a>
                        </li>
                        <br />
                        <li> 
                            <FaInstagram />
                            <a href="">Instagram</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; GradeUpNow</p>
            </div>
        </footer>
    );
}

export default Footer;
