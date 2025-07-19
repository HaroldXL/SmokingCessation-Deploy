import "./aboutUs.css";
import { Affix, Divider } from "antd";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

function AboutUs() {
  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>About QuitIt</p>
        </div>
        <Divider className="divider" />
        <div className="wrapper__inner">
          <div className="wrapper__inner-about">
            <div className="wrapper__inner-about-detail">
              <img
                src="/images/smoking-about.jpg"
                alt="Quit Smoking img"
                className="wrapper__inner-detail-img"
              />
              <h2 className="wrapper__inner-detail-title">Our Mission</h2>
              <p className="wrapper__inner-detail-des">
                Behind every promise of “I'll quit tomorrow” lies a quiet
                exhaustion that few truly understand. No one wants to be
                addicted. But sometimes, quitting is too hard to do alone. We
                understand that feeling — when one part of you wants to stop,
                but another part still holds on. We won't promise to do it for
                you. But we will walk with you — day by day, step by step. With
                a clear plan, with a real companion, and with understanding —
                never judgment.
              </p>
              <p className="wrapper__inner-detail-des">
                That's why we created QuitIt - So no one has to go through this
                alone again. Because we believe: you deserve a life that is
                healthier, freer, and lighter.
              </p>
            </div>
            <div className="wrapper__inner-about-detail2">
              <img
                src="/images/community-post-img-2.png"
                alt="Quit Smoking img"
                className="wrapper__inner-detail2-img"
              />
              <div>
                <h2 className="wrapper__inner-detail-title">How we do</h2>
                <ul className="wrapper__inner-detail-list">
                  <li>
                    Helping you overcome addiction — gently and sustainably
                  </li>
                  <li>A personalized quit plan tailored just for you</li>
                  <li>1-on-1 support from a dedicated mentor</li>
                  <li>
                    Daily check-ins and gentle reminders to keep you on track
                  </li>
                  <li>
                    A warm, supportive community where you're always heard and
                    understood
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutUs;
