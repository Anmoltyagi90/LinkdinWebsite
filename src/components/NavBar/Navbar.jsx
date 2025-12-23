import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "../../config/redux/ruducer/authReducer";

const NavBarComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profileFetched, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch(reset());
    router.push("/login");
  };

  return (
    <div className="p-2 shadow bg-white">
      <nav className="flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Pro Connect
        </h1>

        {/* 👇 IF USER LOGGED IN */}
        {profileFetched ? (
          <div className="flex gap-5 items-center">
            <p>
              Heyy. {user?.name || user?.userId?.name}
            </p>

            <p
              className="font-bold cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              Profile
            </p>

            {/* ✅ Logout ONLY when logged in */}
            <button
              onClick={handleLogout}
              className="bg-pink-600 hover:bg-pink-900 py-1 px-3 text-white rounded-xl"
            >
              Logout
            </button>
          </div>
        ) : (
          /* 👇 IF USER NOT LOGGED IN */
          <div
            onClick={() => router.push("/login")}
            className="bg-pink-600 rounded-xl py-1 px-3 text-white hover:bg-pink-800 cursor-pointer"
          >
            Be a part
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBarComponent;
