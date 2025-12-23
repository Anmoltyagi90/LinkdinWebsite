import React, { useEffect } from "react";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../config/redux/action/authActiion";
import { BASE_URL } from "../../config";
import { useRouter } from "next/router";

const DiscoverPage = () => {
  const authState = useSelector((state) => state.auth);

  // ✅ CORRECT users array
  const users = authState.all_users || [];

  const dispatch = useDispatch();
  const router=useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="px-4 md:px-6 lg:px-8">
          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Discover People
          </h1>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((item) => {
              const user = item.userId;  
              return (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div
                    className="flex flex-col items-center text-center cursor-pointer"
                    onClick={() => {
                      if (user?.username) {
                        router.push(`/view_profile/${user.username}`);
                      }
                    }}
                  >
                    <img
                      src={
                        user?.profilePicture
                          ? user.profilePicture.startsWith("http")
                            ? user.profilePicture
                            : `${BASE_URL}/${user.profilePicture}`
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="profile"
                      className="w-20 h-20 rounded-full object-cover border mb-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                      }}
                    />

                    {/* Name */}
                    <h2 className="text-lg font-semibold text-gray-800">
                      {user?.name || "Unknown"}
                    </h2>

                    {/* Username */}
                    <p className="text-sm text-gray-500 mb-4">
                      @{user?.username || "user"}
                    </p>

                    {/* Action Button */}
                    <button className="w-full bg-blue-600 text-white py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                      Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {authState.all_profiles_fetched && users.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No users found</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default DiscoverPage;
