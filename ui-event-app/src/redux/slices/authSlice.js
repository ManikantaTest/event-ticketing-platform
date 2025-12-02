import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../utils/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register-user", formData);
      return res.data; // return response (success message, user data, etc.)
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Registration failed. Try again."
      );
    }
  }
);

export const loginOAuthUser = createAsyncThunk(
  "auth/loginOAuthUser",
  async (payload, { rejectWithValue }) => {
    try {
      // payload contains { googleToken } OR { facebookToken }
      const response = await api.post("/auth/oauth-login", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OAuth login failed");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/user/profile`);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load user data");
    }
  }
);

export const updateUserInterests = createAsyncThunk(
  "auth/updateUserInterests",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`user/${id}/updateInterests`, {});
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update interests"
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "auth/updateUserRole",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("auth/register-organizer", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update role");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,

    interestedEvents: [],
    interestedEventsLoading: false,

    updateInterestsLoading: false,
    updateInterestsError: null,
    updateInterestsSuccess: false,

    loading: false,
    error: null,
    isAuthenticated: false,

    registerLoading: false,
    registerError: null,
    registerSuccess: false,

    updateRoleLoading: false,
    updateRoleError: null,
    updateRoleSuccess: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.interestedEvents = [];
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
    },
    resetUpdateInterestsStatus: (state) => {
      state.updateInterestsSuccess = false;
    },
    updateRoleSuccessStatus: (state, action) => {
      state.updateRoleSuccess = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.userId;
        state.token = action.payload.token;
        state.interestedEvents = action.payload.userInterests;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", action.payload.userId);
        localStorage.setItem("role", action.payload.userRole);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.isAuthenticated = false;
      })

      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload.userId;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", action.payload.userId);
        localStorage.setItem("role", action.payload.userRole);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
        state.isAuthenticated = false;
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data._id;
        state.interestedEvents = action.payload.data.interestedEvents;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })

      .addCase(updateUserRole.pending, (state) => {
        state.updateRoleLoading = true;
        state.updateRoleError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.updateRoleLoading = false;
        state.isAuthenticated = true;
        state.updateRoleSuccess = true;
        localStorage.setItem("role", "organizer");
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.updateRoleLoading = false;
        state.updateRoleError = action.payload || "Something went wrong";
      })

      .addCase(updateUserInterests.pending, (state) => {
        state.updateInterestsLoading = true;
        state.updateInterestsError = null;
      })
      .addCase(updateUserInterests.fulfilled, (state, action) => {
        state.updateInterestsLoading = false;
        state.updateInterestsSuccess = true;
        state.interestedEvents = action.payload.data.interestedEvents;
      })
      .addCase(updateUserInterests.rejected, (state, action) => {
        state.updateInterestsLoading = false;
        state.updateInterestsError = action.payload || "Something went wrong";
      })
      .addCase(loginOAuthUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(loginOAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        state.user = action.payload.userId;
        state.token = action.payload.token;
        state.interestedEvents = action.payload.userInterests;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", action.payload.userId);
        localStorage.setItem("role", action.payload.userRole);
      })
      .addCase(loginOAuthUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OAuth login failed";
        state.isAuthenticated = false;
      });
  },
});

export const { logout, resetUpdateInterestsStatus, updateRoleSuccessStatus } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
