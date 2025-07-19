import React from "react";
import "./authen-template.css";

function AuthenTemplate({ children }) {
  return (
    <>
      <div>
        <a href="/">
          <img
            className="quitlt_logo"
            src="/images/Quitlt-logo.png"
            alt="quitlt-logo"
          />
        </a>
      </div>
      <div className="authen-template">
        <div className="authen-template__form">{children}</div>
      </div>
    </>
  );
}

export default AuthenTemplate;
