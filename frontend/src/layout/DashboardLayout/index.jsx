import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTokenIsThere } from "../../config/redux/ruducer/authReducer";
import { BASE_URL } from "../../config";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(setTokenIsThere());
      }
    }
  }, [dispatch, router]);

  const profiles = Array.isArray(authState.all_users)
    ? authState.all_users
    : [];

  console.log("TOP PROFILES 👉", profiles);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r px-4 py-4 md:px-6 md:py-6">
          <div className="space-y-4 text-gray-700">

            {/* Scroll */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:text-black hover:scale-105 transition-transform duration-200"
              onClick={() => router.push("/dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span className="text-sm">Scroll</span>
            </div>

            {/* Discover */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:text-black hover:scale-105 transition-transform duration-200"
              onClick={() => router.push("/discover")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <span className="text-sm">Discover</span>
            </div>

            {/* My Connections */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:text-black hover:scale-105 transition-transform duration-200"
              onClick={() => router.push("/my_connections")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"
                />
              </svg>
              <span className="text-sm">My Connections</span>
            </div>

          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex-1 px-4 py-6 md:px-6 md:py-7">{children}</div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-72 px-4 py-6 md:px-6 md:py-6 border-t md:border-t-0 md:border-l">
          <h1 className="text-lg font-semibold mb-4">Top Profiles</h1>

          {profiles.length > 0 ? (
            profiles.map((profile, index) => {
              const user = profile?.userId || {};
              const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              const profileImageSrc = user?.profilePicture
                ? `${BASE_URL}/${user.profilePicture}`
                : fallbackAvatar;

              return (
                <div
                  key={profile?._id || index}
                  className="flex items-center justify-between mb-4 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImageSrc}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAvatar;
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {user?.name ||
                          profile?.name ||
                          user?.username ||
                          profile?.username ||
                          "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">Suggested for you</p>
                    </div>
                  </div>

                  <button className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition">
                    Connect
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No profiles found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
