import { Button } from "antd";
import "./poster.css";
import { useNavigate } from "react-router-dom";

function Poster() {
  const navigate = useNavigate();
  return (
    <>
      <div className="poster">
        <div className="poster__content">
          <h1 className="poster__content-title">
            Your Journey to Quit Smoking
          </h1>
          <h1 className="poster__content-title">Starts Here!</h1>
          <p className="poster__content-description">
            Track your progress, create personalized plans, and connect with a
            supportive community to achieve your smoke-free goals.
          </p>
          <Button
            onClick={() => navigate("/make-plan")}
            type="primary"
            className="poster__content-button"
          >
            <p>Start your quit plan now</p>
          </Button>
        </div>
        <div className="poster__image">
          <img
            className="poster__image-asset"
            src="/images/poster-asset.png"
            alt="poster"
          />
        </div>
      </div>
    </>
  );
}

export default Poster;
