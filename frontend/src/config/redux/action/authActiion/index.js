import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../index";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: userData.email,
        password: userData.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        return thunkAPI.fulfillWithValue({
          token: response.data.token,
          email: userData.email,
        });
      } else {
        return thunkAPI.rejectWithValue({ message: "Token not provided" });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Login failed" }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      if (response.data.message) {
        return thunkAPI.fulfillWithValue({ message: response.data.message });
      } else {
        return thunkAPI.rejectWithValue({ message: "Registration failed" });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async ({ file }, thunkAPI) => {
    try {
      console.log("Uploading profile picture:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      });

      // Check file size before upload (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return thunkAPI.rejectWithValue({
          message: "File too large. Maximum size is 10MB",
        });
      }

      // Check file type
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
        return thunkAPI.rejectWithValue({
          message: "Invalid file type. Please upload an image file.",
        });
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", token);

      // Don't set Content-Type header manually - let axios set it with boundary
      const response = await clientServer.post(
        "/update_profile_picture",
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      console.log("Profile picture uploaded successfully:", response.data);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        error.response?.data || error.message
      );
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to upload profile picture" }
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (data, thunkAPI) => {
    try {
      const token = data.token || localStorage.getItem("token");
      const connectionId = data.userId || data.connectionId || data.user_id;

      if (!token) {
        return thunkAPI.rejectWithValue({ message: "Token is required" });
      }

      if (!connectionId) {
        return thunkAPI.rejectWithValue({ message: "User ID is required" });
      }

      const requestBody = {
        token: token,
        connectionId: connectionId,
      };

      const response = await clientServer.post(
        "/user/send_connection_request",
        requestBody
      );
      thunkAPI.dispatch.getConnectionsRequest({ token: user.token });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error(
        "sendConnectionRequest - Error:",
        error.response?.data || error.message
      );
      return thunkAPI.rejectWithValue(
        error?.response?.data || {
          message: "Failed to send connection request",
        }
      );
    }
  }
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequests", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getMyConncetionRequset = createAsyncThunk(
  "user/getMyConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: { token: user.token },
      });

      // Backend currently returns a raw array, not wrapped in { connections }
      const data = response.data;
      const normalizedConnections = Array.isArray(data)
        ? data
        : data?.connections || [];
      console.log("response", normalizedConnections);
      return thunkAPI.fulfillWithValue(normalizedConnections);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );
      console.log("[AcceptConnection] Response:", response.data);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error(
        "[AcceptConnection] Error:",
        error.response?.data || error.message
      );
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, thunkAPI) => {
    try {
      const token = data.token || localStorage.getItem("token");
      const response = await clientServer.post("/update_profile_data", {
        token,
        ...data.profileData,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to update profile" }
      );
    }
  }
);
