import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLike,
  postComment,
} from "../../config/redux/action/postAction";
import {
  getAboutUser,
  getAllUsers,
  uploadProfilePicture,
  updateProfile,
} from "../../config/redux/action/authActiion";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { BASE_URL } from "../../config";
import {
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { resetPostId } from "../../config/redux/ruducer/postReducer";

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, dispatch]);

  // Populate edit form when profile loads
  useEffect(() => {
    if (authState?.user) {
      setEditBio(authState.user.bio || "");
      setEditCurrentPost(authState.user.currentPost || "");
      setEditWorkHistory(
        authState.user.postWork && authState.user.postWork.length > 0
          ? authState.user.postWork
          : [{ company: "", position: "", years: "" }]
      );
      setEditEducation(
        authState.user.eduction && authState.user.eduction.length > 0
          ? authState.user.eduction
          : [{ school: "", degree: "", fieldOfStudy: "" }]
      );
    }
  }, [authState?.user]);

  const [postContext, setPostContext] = useState("");
  const [fileContext, setFileContext] = useState();
  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editCurrentPost, setEditCurrentPost] = useState("");
  const [editWorkHistory, setEditWorkHistory] = useState([{ company: "", position: "", years: "" }]);
  const [editEducation, setEditEducation] = useState([{ school: "", degree: "", fieldOfStudy: "" }]);

  const emojis = ["😀", "😂", "😍", "😎", "😢", "🔥", "👍", "🙏", "❤️", "🎉"];

  const handleUpload = async () => {
    const resultAction = await dispatch(
      createPost({ file: fileContext, body: postContext })
    );

    if (!resultAction.error) {
      await dispatch(getAllPosts());
      setPostContext("");
      setFileContext(null);
    }
  };

  const handleEmojiClick = (emoji) => {
    setCommentText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handleProfilePictureUpload = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert("Invalid file type. Please upload an image file.");
      return;
    }

    const resultAction = await dispatch(uploadProfilePicture({ file }));
    if (resultAction.error) {
      alert(
        resultAction.payload?.message || "Failed to upload profile picture"
      );
    } else {
      await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        bio: editBio,
        currentPost: editCurrentPost,
        postWork: editWorkHistory.filter(
          (work) => work.company || work.position || work.years
        ),
        eduction: editEducation.filter(
          (edu) => edu.school || edu.degree || edu.fieldOfStudy
        ),
      };

      const result = await dispatch(
        updateProfile({
          token: localStorage.getItem("token"),
          profileData,
        })
      );

      if (result.error) {
        alert(result.payload?.message || "Failed to update profile");
      } else {
        alert("Profile updated successfully!");
        setShowEditProfile(false);
        await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      }
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const addWorkHistory = () => {
    setEditWorkHistory([...editWorkHistory, { company: "", position: "", years: "" }]);
  };

  const removeWorkHistory = (index) => {
    setEditWorkHistory(editWorkHistory.filter((_, i) => i !== index));
  };

  const updateWorkHistory = (index, field, value) => {
    const updated = [...editWorkHistory];
    updated[index][field] = value;
    setEditWorkHistory(updated);
  };

  const addEducation = () => {
    setEditEducation([...editEducation, { school: "", degree: "", fieldOfStudy: "" }]);
  };

  const removeEducation = (index) => {
    setEditEducation(editEducation.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...editEducation];
    updated[index][field] = value;
    setEditEducation(updated);
  };

  const profile = authState?.user;
  const userInfo = profile?.userId || {};
  const profilePicture = userInfo.profilePicture;
  const fallbackAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const profileImageSrc = profilePicture
    ? `${BASE_URL}/${profilePicture}`
    : fallbackAvatar;

  const isLoading = authState.isLoading && !authState.profileFetched;

  const postsArray = Array.isArray(postState.posts?.posts)
    ? postState.posts.posts
    : Array.isArray(postState.posts)
    ? postState.posts
    : [];

  return (
    <UserLayout>
      <DashboardLayout>
        {isLoading || !authState.user ? (
          <div className="flex items-center justify-center h-40">
            <h2 className="text-gray-700 text-xl font-medium animate-pulse">
              Loading dashboard...
            </h2>
          </div>
        ) : (
          <div className="space-y-6 px-4 md:px-6 lg:px-8">
            {/* Profile summary card */}
            <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300">
              {/* Profile Image */}
              <div className="relative">
                <label
                  htmlFor="profilePictureUpload"
                  className="cursor-pointer"
                >
                  <img
                    src={profileImageSrc}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:opacity-90 transition"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackAvatar;
                    }}
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 border-2 border-white hover:bg-blue-700 transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                      />
                    </svg>
                  </div>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleProfilePictureUpload(e.target.files[0])
                  }
                  hidden
                  id="profilePictureUpload"
                />
              </div>

              {/* Name + username + Post Box */}
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                  <p className="text-gray-900 font-semibold text-lg">
                    {userInfo.name}
                  </p>
                  <p className="text-gray-500 text-sm">@{userInfo.username}</p>
                  </div>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                </div>
                <textarea
                  onChange={(e) => setPostContext(e.target.value)}
                  value={postContext}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer text-gray-500 hover:text-blue-500 transition"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </label>
                  {postContext.length > 0 && (
                    <button
                      onClick={handleUpload}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Post
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => setFileContext(e.target.files[0])}
                  hidden
                  id="fileUpload"
                />
              </div>
            </div>

            {/* Posts list */}
            <div className="space-y-4">
              {postsArray.map((post) => {
                const postUser = post.userId || {};
                const postProfileImageSrc = postUser.profilePicture
                  ? `${BASE_URL}/${postUser.profilePicture}`
                  : fallbackAvatar;

                return (
                  <div
                    key={post._id}
                    className="relative group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden p-4"
                  >
                    {/* Delete icon on hover */}
                    <div
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-500 hover:text-red-600 transition"
                      onClick={async (e) => {
                        e.preventDefault(); // 🚨 Prevent page reload
                        const res = await dispatch(
                          deletePost({ post_id: post._id })
                        );
                        if (!res.error) {
                          console.log("Post deleted:", post._id);
                        } else {
                          alert(
                            res.payload?.message || "Failed to delete post"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </div>

                    {/* Post header */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={postProfileImageSrc}
                        alt={postUser.name || "User"}
                        className="w-11 h-11 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackAvatar;
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {postUser.name || "Unknown User"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          @{postUser.username}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Post body */}
                    <p className="text-gray-700 text-sm mb-3">{post.body}</p>

                    {/* Post media */}
                    {post.media && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-black flex justify-center">
                        {post.fileType === "image" && (
                          <img
                            src={`${BASE_URL}/${post.media}`}
                            alt="Post media"
                            loading="lazy"
                            className="w-full max-h-[520px] object-contain"
                          />
                        )}
                        {post.fileType === "video" && (
                          <video
                            controls
                            className="w-full max-h-[520px] bg-black"
                          >
                            <source
                              src={`${BASE_URL}/${post.media}`}
                              type="video/mp4"
                            />
                          </video>
                        )}
                      </div>
                    )}

                    {/* Like & Comment */}
                    {/* Like / Comment / Share */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 text-gray-600 text-sm">
                      <button
                        className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 hover:text-blue-600 transition"
                        onClick={async () => {
                          await dispatch(
                            incrementPostLike({ post_id: post._id })
                          );
                          dispatch(getAllPosts());
                        }}
                      >
                        <HandThumbUpIcon className="w-5 h-5" />
                        <span className="font-medium">Like</span>
                        <p>{post.likes}</p>
                      </button>

                      <button
                        className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 hover:text-blue-600 transition"
                        onClick={() => {
                          dispatch(getAllComments({ post_id: post._id }));
                        }}
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span className="font-medium">Comment</span>
                      </button>

                      <button
                        className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 hover:text-blue-600 transition"
                        onClick={() => {
                          const text = encodeURIComponent(post.body); // ✅ Correct function
                          const url = encodeURIComponent("apnacollege.in");
                          const twitterUrl = `https://www.twitter.com/intent/tweet?text=${text}&url=${url}`;
                          window.open(twitterUrl, "_blank");
                        }}
                      >
                        <ShareIcon className="w-5 h-5" />
                        <span className="font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {postsArray.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  No posts yet. Be the first to post!
                </p>
              )}
            </div>
          </div>
        )}

        {postState.postId !== "" && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            {/* Modal */}
            <div className="w-[50%] h-[85%] bg-white rounded-2xl shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Comments
                </h2>
                <button
                  onClick={() => dispatch(resetPostId())}
                  className="text-gray-700 hover:text-red-500 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {postState.comments.length === 0 && (
                  <p className="text-center text-gray-500">No comments yet</p>
                )}

                {postState.comments.map(
                  (postComment) => (
                    <div
                      key={postComment._id}
                      className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                    >
                      {/* User Avatar */}
                      <img
                        src={
                          postComment.userId?.profilePicture
                            ? `${BASE_URL}/${postComment.userId.profilePicture}`
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="user"
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      {/* Comment Bubble */}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-800">
                              {postComment.userId?.name || "User"}
                            </p>
                            <span className="text-xs text-gray-500">
                              @{postComment.userId?.username}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 mt-1 break-words">
                            {postComment.body}
                          </p>
                        </div>

                        {/* Time */}
                        <p className="text-xs text-gray-400 mt-1 ml-2">
                          {postComment.createdAt
                            ? new Date(
                                postComment.createdAt
                              ).toLocaleTimeString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  )
                  
                  // <div key={comment._id} className="flex gap-3">
                  //   <img
                  //     src={
                  //       comment.userId?.profilePicture
                  //         ? `${BASE_URL}/${comment.userId.profilePicture}`
                  //         : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  //     }
                  //     className="w-10 h-10 rounded-full object-cover"
                  //   />

                  //   <div className="bg-gray-100 rounded-xl px-4 py-2 w-full">
                  //     <p className="font-semibold text-sm text-gray-800">
                  //       {comment.userId?.name || "User"}
                  //       <span className="text-gray-500 ml-2 text-xs">
                  //         @{comment.userId?.username}
                  //       </span>
                  //     </p>

                  //     <p className="text-sm text-gray-700">
                  //       {comment.comment_text}
                  //     </p>
                  //   </div>
                  // </div>
                )}
              </div>

              <div className="border-t px-6 py-4 flex items-center gap-3 relative">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="text-2xl"
                  type="button"
                >
                  😊
                </button>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div className="absolute bottom-16 left-6 bg-white border rounded-xl shadow-lg p-3 flex gap-2 flex-wrap w-60 z-50">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="border-t px-6 py-4 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={!commentText.trim()}
                  onClick={async () => {
                    await dispatch(
                      postComment({
                        post_id: postState.postId,
                        body: commentText,
                      })
                    );
                    setCommentText("");
                    await dispatch(
                      getAllComments({ post_id: postState.postId })
                    );
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={4}
                  />
                </div>

                {/* Current Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Position
                  </label>
                  <input
                    type="text"
                    value={editCurrentPost}
                    onChange={(e) => setEditCurrentPost(e.target.value)}
                    placeholder="e.g., Software Engineer at Company"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Work History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Work History
                    </label>
                    <button
                      onClick={addWorkHistory}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      + Add Work
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editWorkHistory.map((work, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Work #{index + 1}</span>
                          {editWorkHistory.length > 1 && (
                            <button
                              onClick={() => removeWorkHistory(index)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={work.position}
                          onChange={(e) => updateWorkHistory(index, "position", e.target.value)}
                          placeholder="Position"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={work.company}
                          onChange={(e) => updateWorkHistory(index, "company", e.target.value)}
                          placeholder="Company"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={work.years}
                          onChange={(e) => updateWorkHistory(index, "years", e.target.value)}
                          placeholder="Years (e.g., 2020-2023)"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <button
                      onClick={addEducation}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      + Add Education
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editEducation.map((edu, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Education #{index + 1}</span>
                          {editEducation.length > 1 && (
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          placeholder="Degree"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                          placeholder="Field of Study"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                          placeholder="School/University"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
};

export default Dashboard;
