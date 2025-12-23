import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { BASE_URL } from "../../config";
import { getAllPosts } from "../../config/redux/action/postAction";
import { getAboutUser } from "../../config/redux/action/authActiion";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth || {});
  const postState = useSelector((state) => state.posts || {});

  const [userPost, setUserPost] = useState([]);

  const userProfile = authState.user;

  // Fetch current user's profile and all posts
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    if (!authState.user) {
      dispatch(getAboutUser({ token }));
    }

    dispatch(getAllPosts());
  }, [dispatch]);

  // Filter posts for the current user's username
  useEffect(() => {
    const username = authState?.user?.userId?.username;
    if (!username) return;

    const postsArray = Array.isArray(postState.posts?.posts)
      ? postState.posts.posts
      : Array.isArray(postState.posts)
      ? postState.posts
      : [];

    const filtered = postsArray.filter(
      (post) => post?.userId?.username === username
    );
    setUserPost(filtered);
  }, [postState.posts, authState?.user?.userId?.username]);

  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="p-10 text-center text-gray-600">
            Loading profile...
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }
  return (
    <UserLayout>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner & Profile Image Section */}
          <div className="relative w-full mb-16">
        <div
          className="w-full h-48 md:h-64 bg-center bg-cover relative"
          style={{
            backgroundImage:
              'url("https://cdn.pixabay.com/photo/2019/09/28/15/51/cyber-4511126_1280.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-12 left-8 z-10">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                <img
                  src={
                    userProfile?.userId?.profilePicture
                      ? `${BASE_URL}/${userProfile.userId.profilePicture}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Details & Action Button */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {userProfile?.userId?.name || "User Name"}
                </h1>
                <p className="text-blue-600 font-medium text-lg">
                  @{userProfile?.userId?.username || "username"}
                </p>
                {userProfile?.userId?.email && (
                  <p className="text-gray-400 text-sm mt-1 flex items-center">
                    <span className="mr-2">📧</span>{" "}
                    {userProfile?.userId?.email}
                  </p>
                )}
                {userProfile?.currentPost && (
                  <p className="text-gray-500 text-sm mt-2">
                    {userProfile.currentPost}
                  </p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h3>
              {userProfile?.bio ? (
                <p className="text-gray-600 leading-relaxed">
                  {userProfile.bio}
                </p>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No bio available yet.
                </p>
              )}
            </div>

            {/* Work History Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Work History
              </h3>
              {userProfile?.postWork && Array.isArray(userProfile.postWork) && userProfile.postWork.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.postWork.map((work, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg"
                    >
                      <p className="font-semibold text-gray-800">
                        {work.position || "Position"}
                        {work.company && (
                          <span className="text-gray-600 font-normal">
                            {" "}at {work.company}
                          </span>
                        )}
                      </p>
                      {work.years && (
                        <p className="text-gray-500 text-sm mt-1">
                          {work.years}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No work history available yet.
                </p>
              )}
            </div>

            {/* Education Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Education
              </h3>
              {userProfile?.eduction && Array.isArray(userProfile.eduction) && userProfile.eduction.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.eduction.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r-lg"
                    >
                      <p className="font-semibold text-gray-800">
                        {edu.degree || "Degree"}
                        {edu.fieldOfStudy && (
                          <span className="text-gray-600 font-normal">
                            {" "}in {edu.fieldOfStudy}
                          </span>
                        )}
                      </p>
                      {edu.school && (
                        <p className="text-gray-500 text-sm mt-1">
                          {edu.school}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No education information available yet.
                </p>
              )}
            </div>

            {/* Posts/Activity Section */}
            <div className="mt-12 w-full max-w-4xl mx-auto px-4 md:px-0">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-8 flex items-center">
                <span className="bg-blue-600 w-2 h-8 rounded-full mr-4"></span>
                Recent Activity
              </h2>

              {userPost.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {userPost.map((post, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Post Header: User Info */}
                      <div className="flex items-center p-5">
                        <img
                          src={`${BASE_URL}/${userProfile?.userId?.profilePicture}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-50 shadow-sm"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                        <div className="ml-4">
                          <p className="text-lg font-bold text-gray-900 tracking-tight">
                            {userProfile?.userId?.name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="mr-1">🕒</span> Posted Recently
                          </p>
                        </div>
                      </div>

                      {/* Post Content: Text Area */}
                      <div className="px-5 pb-3">
                        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image: Big and Full Width */}
                      {post.media && (
                        <div className="w-full bg-gray-100 mt-2">
                          <img
                            src={`${BASE_URL}/${post.media}`}
                            className="w-full h-auto max-h-[600px] object-contain mx-auto block"
                            alt="post content"
                          />
                        </div>
                      )}

                      {/* Post Footer: Action Buttons */}
                      <div className="px-5 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center gap-8">
                        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group">
                          <div className="p-2 group-hover:bg-blue-50 rounded-full transition-colors">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </div>
                          <span className="font-semibold ml-1">Comment</span>
                        </button>

                        <button className="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200 group">
                          <div className="p-2 group-hover:bg-red-50 rounded-full transition-colors">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-semibold ml-1">Like</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State Section
                <div className="bg-white rounded-2xl p-20 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-xl font-medium">
                    No activity to show yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default ProfilePage
