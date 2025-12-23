import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  deletePost,
  createPost,
  incrementPostLike,
  getAllComments,
} from "../../action/postAction";

const initialState = {
  posts: [],
  comments: [],
  postId: "",
  isError: false,
  postFetched: false,
  isLoading: false,
  message: "",
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL POSTS
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Fetching all posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload || [];
        state.message = "Posts fetched successfully";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.postFetched = false;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch posts";
      })

      // DELETE POST
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Deleting post...";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPostId = action.payload.post_id;
        if (Array.isArray(state.posts)) {
          state.posts = state.posts.filter(
            (post) => post._id !== deletedPostId
          );
        }
        state.message = "Post deleted successfully";
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete post";
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments; 
        console.log(state.comments)
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;
