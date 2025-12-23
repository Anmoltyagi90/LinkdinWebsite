import bcrypt from "bcrypt";
import User from "../Model/user.model.js";
import Profile from "../Model/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionRequest from "../Model/connection.model..js";
// import { connection } from "mongoose";
import Post from "../Model/post.model.js";
import Comment from "../Model/comment.model.js";
import { profile } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import { connect } from "http2";

const convertUserDataTOPDF = async (userData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const fullPath = path.join(uploadsDir, outputPath);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const stream = fs.createWriteStream(fullPath);

    doc.pipe(stream);

    // Add profile picture if available
    if (userData.userId?.profilePicture) {
      const imagePath = path.join(__dirname, "..", "uploads", userData.userId.profilePicture);
      if (fs.existsSync(imagePath)) {
        try {
          doc.image(imagePath, 100, 100, {
            align: "center",
            height: 100,
          });
        } catch (error) {
          console.log("Error adding image:", error.message);
        }
      }
    }

    let yPosition = userData.userId?.profilePicture ? 220 : 100;

    // Basic Information
    doc.fontSize(18).font("Helvetica-Bold").text(`${userData.userId?.name || "N/A"}`, 100, yPosition);
    yPosition += 25;
    doc.fontSize(12).font("Helvetica").text(`Username: ${userData.userId?.username || "N/A"}`);
    yPosition += 20;
    doc.text(`Email: ${userData.userId?.email || "N/A"}`);
    yPosition += 20;

    // Bio
    if (userData.bio) {
      yPosition += 10;
      doc.fontSize(14).font("Helvetica-Bold").text("About:", 100, yPosition);
      yPosition += 20;
      doc.fontSize(12).font("Helvetica").text(userData.bio, { width: 400 });
      yPosition += 30;
    }

    // Current Position
    if (userData.currentPost) {
      doc.fontSize(14).font("Helvetica-Bold").text("Current Position:", 100, yPosition);
      yPosition += 20;
      doc.fontSize(12).font("Helvetica").text(userData.currentPost);
      yPosition += 30;
    }

    // Work History
    if (userData.postWork && Array.isArray(userData.postWork) && userData.postWork.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Work History:", 100, yPosition);
      yPosition += 20;
      userData.postWork.forEach((work) => {
        doc.fontSize(12).font("Helvetica-Bold").text(`${work.position || "Position"}`, 100, yPosition);
        yPosition += 15;
        if (work.company) {
          doc.fontSize(11).font("Helvetica").text(`Company: ${work.company}`, 120, yPosition);
          yPosition += 15;
        }
        if (work.years) {
          doc.fontSize(11).font("Helvetica").text(`Duration: ${work.years}`, 120, yPosition);
          yPosition += 20;
        }
        yPosition += 5;
      });
    }

    // Education
    if (userData.eduction && Array.isArray(userData.eduction) && userData.eduction.length > 0) {
      yPosition += 10;
      doc.fontSize(14).font("Helvetica-Bold").text("Education:", 100, yPosition);
      yPosition += 20;
      userData.eduction.forEach((edu) => {
        if (edu.degree) {
          doc.fontSize(12).font("Helvetica-Bold").text(`${edu.degree}`, 100, yPosition);
          yPosition += 15;
        }
        if (edu.fieldOfStudy) {
          doc.fontSize(11).font("Helvetica").text(`Field: ${edu.fieldOfStudy}`, 120, yPosition);
          yPosition += 15;
        }
        if (edu.school) {
          doc.fontSize(11).font("Helvetica").text(`School: ${edu.school}`, 120, yPosition);
          yPosition += 20;
        }
        yPosition += 5;
      });
    }

    stream.on("finish", () => {
      resolve(fullPath);
    });

    stream.on("error", (error) => {
      reject(error);
    });

    doc.end();
  });
};

// ============ REGISTER ============
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUSer = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUSer.save();

    const profile = new Profile({ userId: newUSer._id });
    await profile.save();

    return res.json({ message: "User created Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============ LOGIN ============
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN BODY =>", req.body);

    if (!email || !password)
      return res.status(400).json({ message: "All field are required" });

    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    console.log("Upload Profile Picture Request:", {
      hasFile: !!req.file,
      fileName: req.file?.filename,
      fileSize: req.file?.size,
      fileMimetype: req.file?.mimetype,
      token: token ? "present" : "missing",
    });

    const user = await User.findOne({ token: token });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check file size (additional check)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        message: "File too large. Maximum size is 10MB",
      });
    }

    user.profilePicture = req.file.filename;
    await user.save();

    console.log("Profile picture saved successfully:", req.file.filename);

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: req.file.filename,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUSerData } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) return res.status(400).json({ message: "user not found" });

    const { username, email } = newUSerData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "user already exists" });
      }
    }

    Object.assign(user, newUSerData);

    await user.save();

    return res.json({ message: "user updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) return res.status(400).json({ message: "user not found" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json(userProfile);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });

    if (!userProfile)
      return res.status(400).json({ message: "user not found" });

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profile = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ profile });
  } catch (error) {}
};

export const downloadProfile = async (req, res) => {
  const user_id = req.body?.id || req.query?.id;

  try {
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Convert profile to PDF
    const outputPath = await convertUserDataTOPDF(userProfile);
    
    // Set headers for file download
    const fileName = `${userProfile.userId?.username || "resume"}_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    
    // Send the file for download
    return res.download(outputPath, fileName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          return res.status(500).json({
            message: "Error downloading file",
            error: err.message,
          });
        }
      }
      // Clean up the file after download
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Download profile error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  console.log("sendConnectionRequest - Received body:", req.body);
  console.log("sendConnectionRequest - Extracted values:", { token, connectionId });

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!connectionId) {
      return res.status(400).json({ message: "Connection ID is required" });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });

    if (!connectionUser) {
      return res.status(400).json({ message: "connection User not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(200).json({ message: "Request already sent", alreadyExists: true });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
      status_accepted: false, // Explicitly set to false for pending requests
    });

    await request.save();
    return res.json({ message: "Request Sent" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyConnectionsRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  console.log(`[whatAreMyConnections] Received request with token:`, token ? "Token exists" : "No token");
  
  try {
    const user = await User.findOne({ token });
    console.log(`[whatAreMyConnections] User lookup result:`, user ? `User found: ${user._id}` : "User NOT found");

    if (!user) {
      console.error(`[whatAreMyConnections] User not found for token`);
      return res.status(404).json({ message: "user not found" });
    }

    console.log(`[whatAreMyConnections] Looking for pending requests where connectionId = ${user._id} and status_accepted = false`);
    
    // Find pending connection requests where current user is the recipient (connectionId)
    // These are requests that need to be accepted/rejected
    const pendingRequests = await ConnectionRequest.find({
      connectionId: user._id,
      status_accepted: false,
    }).populate("userId", "name username email profilePicture");

    console.log(`[whatAreMyConnections] Raw pending requests count: ${pendingRequests.length}`);
    console.log(`[whatAreMyConnections] Raw pending requests:`, JSON.stringify(pendingRequests, null, 2));

    // Also check ALL connection requests for debugging
    const allRequests = await ConnectionRequest.find({});
    console.log(`[whatAreMyConnections] Total connection requests in DB: ${allRequests.length}`);
    if (allRequests.length > 0) {
      console.log(`[whatAreMyConnections] Sample connection request:`, {
        _id: allRequests[0]._id,
        userId: allRequests[0].userId,
        connectionId: allRequests[0].connectionId,
        status_accepted: allRequests[0].status_accepted,
      });
    }

    // Return pending requests with normalized structure
    const normalizedRequests = pendingRequests
      .filter(conn => conn.userId) // Filter out any requests where userId wasn't populated
      .map(conn => ({
        _id: conn._id,
        userId: conn.userId, // The user who sent request to current user
        connectionId: conn.connectionId,
        status_accepted: conn.status_accepted,
      }));

    console.log(`[whatAreMyConnections] Found ${normalizedRequests.length} pending requests for user ${user._id}`);
    if (normalizedRequests.length > 0) {
      console.log(`[whatAreMyConnections] Sample normalized request:`, normalizedRequests[0]);
    }
    return res.json(normalizedRequests);
  } catch (error) {
    console.error(`[whatAreMyConnections] Error:`, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  // Support both GET (query params) and POST (body)
  const { token, requestId, connection_id, action_type } = req.method === 'GET' ? req.query : req.body;
  const requestIdToUse = requestId || connection_id;
  
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (!requestIdToUse) {
      return res.status(400).json({ message: "requestId or connection_id is required" });
    }

    const connection = await ConnectionRequest.findOne({
      _id: requestIdToUse,
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.json({ message: "Request updated" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name username email profilePicture");

    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, comment_text } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({
      _id: post_id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: comment_text,
    });

    await comment.save();

    return res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUsrProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile
      .findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture");

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
