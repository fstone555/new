import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = ({ setToken }) => {
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[270px] fixed h-screen bg-gray-800 text-white">
        <Navbar logout={logout} />
      </div>
      <div className="flex flex-col flex-grow ml-[270px]">
        <header className="bg-green-600 p-4 text-white">
          <Header />
        </header>
        <main className="flex-grow p-4 bg-gray-100">
          <Outlet />
        </main>
        <footer className="bg-orange-400 p-4 text-white">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;
