import "./othersAccount-nav.css";
import { Link, useLocation, useParams } from "react-router-dom";

function OthersAccountNav() {
  const location = useLocation();
  const { profileName } = useParams();

  const isActivePage = (path) => {
    if (path === `/users/${encodeURIComponent(profileName)}`) {
      return location.pathname === `/users/${encodeURIComponent(profileName)}`;
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="wrapper__profile-nav">
      <Link
        to={`/users/${encodeURIComponent(profileName)}`}
        className={
          isActivePage(`/users/${encodeURIComponent(profileName)}`)
            ? "active"
            : ""
        }
      >
        Profile
      </Link>
      <Link
        to={`/users/${encodeURIComponent(profileName)}/posts`}
        className={
          isActivePage(`/users/${encodeURIComponent(profileName)}/posts`)
            ? "active"
            : ""
        }
      >
        Posts
      </Link>
      <Link
        to={`/users/${encodeURIComponent(profileName)}/badges`}
        className={
          isActivePage(`/users/${encodeURIComponent(profileName)}/badges`)
            ? "active"
            : ""
        }
      >
        Badges
      </Link>
    </div>
  );
}

export default OthersAccountNav;
