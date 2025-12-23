import React, { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "../../config";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "../../config/redux/action/postAction";
import {
  getConnectionsRequest,
  sendConnectionRequest,
} from "../../config/redux/action/authActiion";

const ViewProfile = ({ userProfile }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const postState = useSelector((state) => state.posts || {});
  const authState = useSelector((state) => state.auth || {});

  const [userPost, setUserPost] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
  };

  // Initial data fetch - refresh when username changes
  useEffect(() => {
    getUserPost();
  }, [router.query.username]);

  // Refresh connections when page becomes visible (in case they were updated elsewhere)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem("token");
        if (token) {
          dispatch(getConnectionsRequest({ token }));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  // Filter user posts with safety check
  useEffect(() => {
    if (router.query.username) {
      const postsArray = Array.isArray(postState.posts?.posts)
        ? postState.posts.posts
        : Array.isArray(postState.posts)
        ? postState.posts
        : [];

      const filtered = postsArray.filter((post) => {
        return post?.userId?.username === router.query.username;
      });
      setUserPost(filtered);
    }
  }, [postState.posts, router.query.username]);

  // Connection check logic
  useEffect(() => {
    if (authState?.connections && userProfile?.userId?._id) {
      // Check if current user sent request to profile user (connectionId is profile user)
      const sentConnection = authState.connections.find(
        (conn) => conn?.connectionId?._id === userProfile?.userId?._id
      );
      
      // Check if current user received request from profile user (userId is profile user)
      const receivedConnection = authState.connections.find(
        (conn) => conn?.userId?._id === userProfile?.userId?._id
      );
      
      // Prioritize accepted connection if either exists
      const connection = 
        (sentConnection?.status_accepted === true ? sentConnection : null) ||
        (receivedConnection?.status_accepted === true ? receivedConnection : null) ||
        sentConnection ||
        receivedConnection;
      
      const isFound = !!connection;
      
      console.log("[ViewProfile] Connection status check:", {
        profileUserId: userProfile?.userId?._id,
        sentConnection: sentConnection ? { id: sentConnection._id, status: sentConnection.status_accepted } : null,
        receivedConnection: receivedConnection ? { id: receivedConnection._id, status: receivedConnection.status_accepted } : null,
        finalConnection: connection ? { id: connection._id, status: connection.status_accepted } : null,
      });
      
      setIsCurrentUserInConnection(isFound);

      if (connection?.status_accepted === true) {
        setIsConnectionNull(false); // Connected
      } else if (isFound) {
        setIsConnectionNull(true); // Pending
      }
    } else {
      setIsCurrentUserInConnection(false);
      setIsConnectionNull(true);
    }
  }, [authState?.connections, userProfile?.userId?._id]);


  if (!userProfile) return <div className="p-10 text-center">Loading...</div>;

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

              {/* Connection Button Logic */}
              <div className="mt-4 md:mt-0 flex flex-col gap-3">
                {isCurrentUserInConnection ? (
                  <button className="px-8 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-full border border-gray-200 cursor-default">
                    {isConnectionNull ? "Pending" : "Connected"}
                  </button>
                ) : (
                  <button
                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      const userId = userProfile?.userId?._id;
                      
                      const result = await dispatch(
                        sendConnectionRequest({
                          token: token,
                          userId: userId,
                        })
                      );
                      
                      // Update UI state immediately
                      if (!result.error) {
                        setIsCurrentUserInConnection(true);
                        setIsConnectionNull(true); // Set to pending initially
                        
                        // Refresh connections list to get updated status
                        await dispatch(
                          getConnectionsRequest({ token: token })
                        );
                      } else {
                        // If request already exists, still show as connected/pending
                        if (result.payload?.message?.includes("already sent") || 
                            result.payload?.alreadyExists) {
                          setIsCurrentUserInConnection(true);
                          setIsConnectionNull(true);
                          // Refresh connections to get the actual status
                          await dispatch(
                            getConnectionsRequest({ token: token })
                          );
                        }
                      }
                    }}
                  >
                    Connect
                  </button>
                )}
                
                {/* Download Resume Button */}
                <button
                  className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  onClick={async () => {
                    try {
                      const userId = userProfile?.userId?._id;
                      if (!userId) {
                        alert("User ID not found");
                        return;
                      }

                      const response = await clientServer.post(
                        "/user/download_resume",
                        { id: userId },
                        {
                          responseType: "blob",
                        }
                      );

                      // Create a blob from the response
                      const blob = new Blob([response.data], {
                        type: "application/pdf",
                      });

                      // Create a temporary URL and trigger download
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${userProfile?.userId?.username || "resume"}_${Date.now()}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download error:", error);
                      alert(
                        error.response?.data?.message ||
                          "Failed to download resume"
                      );
                    }
                  }}
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download Resume
                </button>
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
  );
};

export async function getServerSideProps(context) {
  const { username } = context.query;
  try {
    const request = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: { username },
      }
    );
    return { props: { userProfile: request.data.profile } };
  } catch (error) {
    console.error(error);
    return { props: { userProfile: null } };
  }
}

export default ViewProfile;
