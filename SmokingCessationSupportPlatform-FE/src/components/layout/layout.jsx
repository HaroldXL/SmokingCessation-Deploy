import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";

//Dùng để scroll lại đầu trang khi chuyển trang
function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />; //component đặc biệt của react-router-dom, cho phép render các component con (child routes) theo đường dẫn
}

export default Layout;
