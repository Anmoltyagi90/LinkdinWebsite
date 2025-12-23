import { createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, clientServer } from "../../..";
import axios from "axios";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch posts"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async ({ file, body }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("body", body);
      // Backend expects token and field name "media"
      const token = localStorage.getItem("token");
      if (token) {
        formData.append("token", token);
      }
      if (file) {
        formData.append("media", file);
        console.log("File being uploaded:", {
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }

      // Don't set Content-Type header manually - let axios set it with boundary
      const response = await clientServer.post("/post", formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Post created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating post:",
        error.response?.data || error.message
      );
      return thunkAPI.rejectWithValue(
        error.response?.data || "Post not uploaded"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async ({ post_id }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/delete_post", {
        token,
        post_id,
      });

      // Return only post_id for reducer
      return { post_id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLike",
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.post("/increment_post_likes", {
        post_id: post.post_id,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: {
          post_id: postData.post_id,
        },
      });

      return thunkAPI.fulfillWithValue({
        comments: response.data.comments, 
        post_id: postData.post_id,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);


export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id: commentData.post_id,
        comment_text: commentData.body,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

