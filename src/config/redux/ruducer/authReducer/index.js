import { createSlice } from "@reduxjs/toolkit";
import {
  getAboutUser,
  getAllUsers,
  getConnectionsRequest,
  getMyConncetionRequset,
  loginUser,
  registerUser,
  updateProfile,
  AcceptConnection,
} from "../../action/authActiion";

// Initial state
const initialState = {
  user: undefined,
  token: null,
  isError: false, // Any error occurred
  isSuccess: false, // Successful action
  isLoading: false, // Loading state
  loggedIn: false, // User login status
  message: "",
  isTokenThere: false,
  profileFetched: false, // Profile fetch status
  connections: [], // User connections (if any)
  connectionRequest: [], // Connection requests
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== REGISTER =====
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering...";
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false; // Signup does not log in
        state.message =
          action.payload?.message || "Registration successful, please login";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Registration failed!";
      })

      // ===== LOGIN =====
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Logging in...";
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || { email: action.payload?.email };
        state.message = action.payload?.message || "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message =
          action.payload?.message || action.error?.message || "Login failed!";
      })

      // ===== GET USER PROFILE =====
      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Fetching profile...";
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.profileFetched = true;
        state.user = action.payload || null;
        state.message = "Profile fetched successfully";
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.profileFetched = false;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch profile";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.all_profiles_fetched = true;
        // Backend returns { profile: [...] }
        state.all_users = action.payload?.profile || [];
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload;
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyConncetionRequset.fulfilled, (state, action) => {
        console.log("[REDUCER] getMyConncetionRequset fulfilled with payload:", action.payload);
        console.log("[REDUCER] Payload type:", typeof action.payload);
        console.log("[REDUCER] Payload is array:", Array.isArray(action.payload));
        console.log("[REDUCER] Payload length:", action.payload?.length);
        state.connectionRequest = action.payload;
        console.log("[REDUCER] State connectionRequest updated:", state.connectionRequest);
      })
      .addCase(getMyConncetionRequset.rejected, (state, action) => {
        state.message = action.payload;
      })
      // .addCase(getMyConncetionRequset.rejected, (state, action) => {
      //   state.connectionRequest = [];
      // })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.message = "Updating profile...";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload?.message || "Failed to update profile";
      });
  },
});

export const { reset, setTokenIsThere, setTokenIsNotThere } = authSlice.actions;
export default authSlice.reducer;
