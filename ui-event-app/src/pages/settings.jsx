import { Person } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserDetails,
  updateEmail,
  updatePassword,
  updateProfile,
} from "../redux/slices/userSlice";

export default function Settings() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("Account Info");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [emailData, setEmailData] = useState({
    currentEmail: "",
    newEmail: "",
    confirmEmail: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    newEmail: "",
    confirmEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isOAuthUser = user && user.isOAuth;

  const isProfileValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.phoneNumber &&
    profileData.firstName &&
    profileData.lastName &&
    profileData.phoneNumber;

  const isEmailValid =
    !errors.newEmail &&
    !errors.confirmEmail &&
    emailData.newEmail &&
    emailData.confirmEmail;

  const isPasswordValid =
    !errors.newPassword &&
    !errors.confirmPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    (isOAuthUser || passwordData.currentPassword);

  const validateName = (value) => {
    if (!value.trim()) return "Required";
    if (value.trim().length < 2) return "Minimum 2 characters";
    return "";
  };

  const validatePhone = (value) => {
    const phoneRegex = /^(\+91)?\s?\d{10}$/;
    if (!value.trim()) return "Required";
    if (!phoneRegex.test(value)) return "Enter valid 10-digit phone";
    return "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Required";
    if (!emailRegex.test(value)) return "Enter valid email";
    return "";
  };

  const validatePassword = (value) => {
    if (!value.trim()) return "Required";
    if (value.length < 6) return "Minimum 6 characters";
    return "";
  };

  // Load user on mount
  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  // Prefill when user is loaded
  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.username || "").split(" ");
      const last = rest.join(" ");

      setProfileData({
        firstName: first || "",
        lastName: last || "",
        phoneNumber: user.phone || "",
      });

      setEmailData((prev) => ({
        ...prev,
        currentEmail: user.email || "",
      }));
    }
  }, [user]);

  const handleProfileChange = (field) => (event) => {
    const value = event.target.value;
    setProfileData((prev) => ({ ...prev, [field]: value }));

    let err = "";
    if (field === "firstName") err = validateName(value);
    if (field === "lastName") err = validateName(value);
    if (field === "phoneNumber") err = validatePhone(value);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleEmailChange = (field) => (event) => {
    const value = event.target.value;
    setEmailData((prev) => ({ ...prev, [field]: value }));

    let err = "";
    if (field === "newEmail") err = validateEmail(value);

    if (field === "confirmEmail") {
      err = value !== emailData.newEmail ? "Emails do not match" : "";
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handlePasswordChange = (field) => (event) => {
    const value = event.target.value;
    setPasswordData((prev) => ({ ...prev, [field]: value }));

    let err = "";
    if (field === "newPassword") err = validatePassword(value);
    if (field === "confirmPassword") {
      err = value !== passwordData.newPassword ? "Passwords do not match" : "";
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSaveProfile = () => {
    dispatch(updateProfile(profileData));
  };

  const handleSaveEmail = () => {
    dispatch(updateEmail(emailData)).then((res) => {
      if (!res.error) {
        setEmailData({
          currentEmail: emailData.newEmail,
          newEmail: "",
          confirmEmail: "",
        });
      }
    });
  };

  const handleSavePassword = () => {
    const payload = isOAuthUser
      ? {
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }
      : passwordData;

    dispatch(updatePassword(payload)).then((res) => {
      if (!res.error) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #ffffff 40%, #ffffff 100%)",
        p: 2,
      }}
    >
      <Grid
        container
        spacing={0}
        sx={{
          width: "100%",
          maxWidth: "1400px",
          margin: "auto",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          background: "white",
        }}
      >
        {/* SIDEBAR */}
        <Grid
          item
          xs={12}
          md="auto"
          sx={{
            width: { xs: "100%", md: "330px" },
            backdropFilter: "blur(14px)",
            borderRight: "1px solid #e6e6e6",
            background: "rgba(255,255,255,0.75)",
          }}
        >
          {/* Sidebar Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #e4e4e4",
              background: "linear-gradient(135deg, #eef2ff, #fafbff)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a1a1a", letterSpacing: 0.3 }}
            >
              Account Settings
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ py: 2 }}>
            {["Account Info", "Change Email", "Password"].map((tab) => (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  mx: 2,
                  px: 3,
                  py: 2,
                  borderRadius: "12px",
                  cursor: "pointer",
                  mb: 1,
                  fontSize: "15px",
                  fontWeight: activeTab === tab ? 600 : 500,
                  transition: "0.3s",
                  color: activeTab === tab ? "#2D3ADF" : "#555",
                  background:
                    activeTab === tab
                      ? "rgba(90, 102, 255, 0.08)"
                      : "transparent",
                  "&:hover": {
                    background:
                      activeTab === tab
                        ? "rgba(90, 102, 255, 0.15)"
                        : "#f4f4f4",
                  },
                }}
              >
                {tab}
              </Box>
            ))}
          </Box>
        </Grid>

        {/* MAIN PANEL */}
        <Grid item xs sx={{ flexGrow: 1 }}>
          <Box sx={{ p: 5, minHeight: "90vh" }}>
            {/* ACCOUNT INFO */}
            {activeTab === "Account Info" && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 1, color: "#2D3748" }}
                >
                  Account Information
                </Typography>

                <Typography sx={{ color: "#718096", mb: 3 }}>
                  Manage your personal details and profile information.
                </Typography>

                <Divider sx={{ mb: 4 }} />

                {/* Profile Photo */}
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Profile Photo
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar
                      src={user?.userProfileImage}
                      sx={{
                        width: 90,
                        height: 90,
                        bgcolor: "#ddd",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {!user?.userProfileImage && (
                        <Person sx={{ fontSize: 40 }} />
                      )}
                    </Avatar>

                    <Button
                      component="label"
                      variant="contained"
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        px: 3,
                        borderRadius: "10px",
                        "&:hover": { opacity: 0.9 },
                      }}
                    >
                      Upload New
                      <input hidden accept="image/*" type="file" />
                    </Button>
                  </Box>
                </Box>

                {/* Profile Inputs */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Profile Information
                </Typography>

                <Grid container spacing={3} sx={{ maxWidth: "700px" }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={handleProfileChange("firstName")}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={handleProfileChange("lastName")}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange("phoneNumber")}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  disabled={!isProfileValid}
                  sx={{
                    mt: 4,
                    backgroundColor: "#2D3748",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: "10px",
                    "&:hover": { backgroundColor: "#1a202c" },
                    opacity: isProfileValid ? 1 : 0.5,
                    cursor: isProfileValid ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSaveProfile}
                >
                  Save My Profile
                </Button>
              </Box>
            )}

            {/* CHANGE EMAIL */}
            {activeTab === "Change Email" && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Change Email
                </Typography>
                <Typography sx={{ color: "#718096", mb: 3 }}>
                  Update your account email address.
                </Typography>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3} sx={{ maxWidth: "600px" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Email"
                      value={emailData.currentEmail}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Email"
                      value={emailData.newEmail}
                      onChange={handleEmailChange("newEmail")}
                      error={!!errors.newEmail}
                      helperText={errors.newEmail}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Email"
                      value={emailData.confirmEmail}
                      onChange={handleEmailChange("confirmEmail")}
                      error={!!errors.confirmEmail}
                      helperText={errors.confirmEmail}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  disabled={!isEmailValid}
                  sx={{
                    mt: 3,
                    backgroundColor: "#2D3748",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: "10px",
                    "&:hover": { backgroundColor: "#1a202c" },
                    opacity: isProfileValid ? 1 : 0.5,
                    cursor: isProfileValid ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSaveEmail}
                >
                  Save New Email
                </Button>
              </Box>
            )}

            {/* CHANGE PASSWORD */}
            {activeTab === "Password" && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isOAuthUser ? "Set Password" : "Change Password"}
                </Typography>

                <Typography sx={{ color: "#718096", mb: 3 }}>
                  {isOAuthUser
                    ? "Create a password for your account."
                    : "Make sure your account stays secure."}
                </Typography>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3} sx={{ maxWidth: "600px" }}>
                  {!isOAuthUser && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange("currentPassword")}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange("newPassword")}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange("confirmPassword")}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  disabled={!isPasswordValid}
                  sx={{
                    mt: 3,
                    backgroundColor: "#2D3748",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: "10px",
                    "&:hover": { backgroundColor: "#1a202c" },
                    opacity: isProfileValid ? 1 : 0.5,
                    cursor: isProfileValid ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSavePassword}
                >
                  Save New Password
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
