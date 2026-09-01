import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <span className="footer__logo">AR</span>
          <div>
            <p className="footer__name">ARNetLab</p>
            <p className="footer__tagline">Build. Connect. Route. Visualize.</p>
          </div>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <div className="footer__col">
            <h4 className="footer__heading">Navigate</h4>
            <Link to="/" className="footer__link">Home</Link>
            <Link to="/ar-lab" className="footer__link">AR Lab</Link>
            <Link to="/how-it-works" className="footer__link">How It Works</Link>
            <Link to="/about" className="footer__link">About</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">Project</h4>
            <a
              href="https://github.com/Divyam16choubey/ARNetLab"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
          </div>
        </nav>

        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} ARNetLab. An educational project
            for network topology visualization.
          </p>
        </div>
      </div>
    </footer>
  );
}
