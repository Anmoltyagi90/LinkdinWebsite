import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  activeCheck,
  createPost,
  delete_comment_of_user,
  deletePost,
  get_comments_by_post,
  increment_likes,
} from "../Controllers/posts.controller.js";
import { commentPost, getAllPosts } from "../Controllers/user.controller.js";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get("/", activeCheck);

router.post("/post", upload.single("media"), createPost);

router.get("/posts", getAllPosts);

router.post("/delete_post", deletePost);

router.post("/comment", commentPost);
router.get("/get_comments", get_comments_by_post);
router.post("/delete_comments", delete_comment_of_user);
router.post("/increment_post_likes", increment_likes);

export default router;
