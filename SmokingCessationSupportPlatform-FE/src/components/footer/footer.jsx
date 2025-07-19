import { Divider } from "antd";
import "./footer.css";

function Footer() {
  return (
    <>
      <div>
        <footer className="footer">
          <div className="footer__container">
            <div className="footer__logo">
              <img
                className="footer__logo-image"
                src="/images/Quitlt-logo.png"
                alt="Quitlt Logo"
              />
              <div>
                <p className="footer__logo-des">
                  Quit provides progressive, and affordable healthcare,
                  accessible on desktop and online for everyone
                </p>
              </div>
            </div>
            <div className="footer__links">
              <div className="footer__links-container">
                <p className="footer__links-title">Resources</p>
                <ul className="footer__links-list">
                  <li>
                    <a href="/#">Blog</a>
                  </li>
                  <li>
                    <a href="/#">Stories</a>
                  </li>
                  <li>
                    <a href="/#">Quit Guides</a>
                  </li>
                  <li>
                    <a href="/#">Research</a>
                  </li>
                </ul>
              </div>
              <div className="footer__links-container">
                <p className="footer__links-title">Support</p>
                <ul className="footer__links-list">
                  <li>
                    <a href="/#">FAQ</a>
                  </li>
                  <li>
                    <a href="/#">Contact Us</a>
                  </li>
                  <li>
                    <a href="/#">Community</a>
                  </li>
                  <li>
                    <a href="/#">Coach</a>
                  </li>
                </ul>
              </div>
              <div className="footer__links-container">
                <p className="footer__links-title">Legal</p>
                <ul className="footer__links-list">
                  <li>
                    <a href="/#">Privacy</a>
                  </li>
                  <li>
                    <a href="/#">Term</a>
                  </li>
                  <li>
                    <a href="/#">Policy</a>
                  </li>
                </ul>
              </div>
              <div className="footer__links-container">
                <p className="footer__links-title">Contact Us</p>
                <ul className="footer__links-list">
                  <li>contact@gmail.com</li>
                  <li>(414) 687-5892</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <p className="footer__bottom-text">Copyright © 2025</p>
            <div className="footer__bottom-text">
              <p>All Rights Reserved</p>
              <Divider
                className="footer__bottom-text-divider"
                type="vertical"
              />
              <a href="/#">Terms and Conditions</a>
              <Divider
                className="footer__bottom-text-divider"
                type="vertical"
              />
              <a href="/#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Footer;
