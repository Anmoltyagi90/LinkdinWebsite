import React, { useEffect } from "react";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../../config";
import { useRouter } from "next/router";
import {
  AcceptConnection,
  getMyConncetionRequset,
  getConnectionsRequest,
} from "../../config/redux/action/authActiion";

const MyConnectionsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const { connectionRequest = [], connections = [] } = authState;
  
  // Debug: Log full auth state
  useEffect(() => {
    console.log("[MyConnections] Full auth state:", authState);
    console.log("[MyConnections] connectionRequest from selector:", connectionRequest);
  }, [authState, connectionRequest]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[MyConnections] useEffect triggered, token exists:", !!token);
    if (token) {
        console.log("[MyConnections] Dispatching getMyConncetionRequset & getConnectionsRequest");
        // Incoming pending requests (others → me)
      dispatch(getMyConncetionRequset({ token }))
        .then((result) => {
            console.log("[MyConnections] getMyConncetionRequset result:", result);
          })
          .catch((error) => {
            console.error("[MyConnections] getMyConncetionRequset error:", error);
          });

        // All connections where I am the sender (me → others), used for My Network
        dispatch(getConnectionsRequest({ token }))
          .then((result) => {
            console.log("[MyConnections] getConnectionsRequest result:", result);
        })
        .catch((error) => {
            console.error("[MyConnections] getConnectionsRequest error:", error);
        });
    } else {
      console.warn("[MyConnections] No token found in localStorage");
    }
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log("[MyConnections] connectionRequest from Redux:", connectionRequest);
    console.log("[MyConnections] connectionRequest length:", connectionRequest?.length);
    console.log("[MyConnections] connectionRequest type:", typeof connectionRequest);
    if (connectionRequest && connectionRequest.length > 0) {
      console.log("[MyConnections] First connection:", connectionRequest[0]);
      console.log("[MyConnections] First connection userId:", connectionRequest[0]?.userId);
    }
  }, [connectionRequest]);

  // Backend already returns only pending requests, but filter as safety check
  const pendingRequests = Array.isArray(connectionRequest) 
    ? connectionRequest.filter(
        (connection) => connection && connection.status_accepted === false && connection.userId
      )
    : [];

  // My Network: accepted connections that I have with others
  const acceptedConnections = Array.isArray(connections)
    ? connections.filter(
        (connection) =>
          connection &&
          connection.status_accepted === true &&
          connection.connectionId // populated other user
      )
    : [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto p-6 space-y-10">
          {/* Pending requests (others → me) */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
            My Connections
          </h1>

          {pendingRequests.length > 0 ? (
            pendingRequests.map((connection) => {
              // Ensure userId is an object (populated user data)
              const connectedUser = connection?.userId || {};
              
              // Skip if userId is missing or invalid
              if (!connection.userId || !connectedUser._id) {
                console.warn("[MyConnections] Skipping connection with invalid userId:", connection);
                return null;
              }

              const fallbackAvatar =
                "https://cdn-icons-png.flaticon.com/512/149/149071.png";

              const profileImageSrc = connectedUser.profilePicture
                ? `${BASE_URL}/${connectedUser.profilePicture}`
                : fallbackAvatar;

              return (
                <div
                  key={connection._id || Math.random()}
                  className="flex items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={profileImageSrc}
                    alt={connectedUser.name || "profile"}
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackAvatar;
                    }}
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {connectedUser.name || "Unknown User"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      @{connectedUser.username || "username"}
                    </p>
                    {connectedUser.email && (
                      <p className="text-gray-400 text-xs mt-1">
                        {connectedUser.email}
                      </p>
                    )}
                  </div>

                  {/* ✅ ACCEPT BUTTON */}
                  <button
                    onClick={() => {
                      dispatch(
                        AcceptConnection({
                          connectionId: connection._id, // ✅ FIXED
                          token: localStorage.getItem("token"),
                          action: "accept",
                        })
                      ).then(() => {
                        dispatch(
                          getMyConncetionRequset({
                            token: localStorage.getItem("token"),
                          })
                        );
                      });
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
                  >
                    Accept
                  </button>

                  {/* VIEW PROFILE */}
                  <button
                    onClick={() =>
                      router.push(
                        `/view_profile/${connectedUser.username}`
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                </div>
              );
            }).filter(Boolean) // Remove any null entries
          ) : (
            <div className="bg-white p-12 rounded-2xl border text-center text-gray-400">
              <p className="text-lg mb-2">
                No pending connection requests 🤝
              </p>
            </div>
          )}
          </div>

          {/* My Network (accepted connections I have with others) */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              My Network
            </h2>

            {acceptedConnections.length > 0 ? (
              acceptedConnections.map((connection) => {
                const connectedUser = connection?.connectionId || {};

                if (!connectedUser._id) {
                  console.warn("[MyNetwork] Skipping connection with invalid connectionId:", connection);
                  return null;
                }

                const fallbackAvatar =
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

                const profileImageSrc = connectedUser.profilePicture
                  ? `${BASE_URL}/${connectedUser.profilePicture}`
                  : fallbackAvatar;

                return (
                  <div
                    key={connection._id || Math.random()}
                    className="flex items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={profileImageSrc}
                      alt={connectedUser.name || "profile"}
                      className="w-16 h-16 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAvatar;
                      }}
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {connectedUser.name || "Unknown User"}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        @{connectedUser.username || "username"}
                      </p>
                      {connectedUser.email && (
                        <p className="text-gray-400 text-xs mt-1">
                          {connectedUser.email}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/view_profile/${connectedUser.username}`)
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                    >
                      View Profile
                    </button>
                  </div>
                );
              }).filter(Boolean)
            ) : (
              <div className="bg-white p-12 rounded-2xl border text-center text-gray-400">
                <p className="text-lg mb-2">
                  No network connections yet 🌱
                </p>
                <p className="text-sm">
                  Accept or send connection requests to grow your network.
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default MyConnectionsPage;
