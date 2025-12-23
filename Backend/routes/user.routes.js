import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getMyConnectionsRequests,
  getUserAndProfile,
  getUsrProfileAndUserBasedOnUsername,
  login,
  register,
  sendConnectionRequest,
  updateProfile,
  updateUserProfile,
  uploadProfilePicture,
  whatAreMyConnections,
} from "../Controllers/user.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept common image formats
  const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
  const extname = allowedTypes.test(
    file.originalname.toLowerCase().split(".").pop()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed (jpeg, jpg, png, gif, webp, heic, heif)"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

router.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);

router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/update_profile_data", updateProfile);
router.get("/user/get_all_users", getAllUserProfile);
router.post("/user/download_resume", downloadProfile);
router.post("/user/send_connection_request", sendConnectionRequest);
router.get("/user/getConnectionRequests", getMyConnectionsRequests);
router.get("/user/user_connection_request", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);
router.get(
  "/user/get_profile_based_on_username",
  getUsrProfileAndUserBasedOnUsername
);

export default router;
