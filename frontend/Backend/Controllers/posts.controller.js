import User from "../Model/user.model.js";
import Post from "../Model/post.model.js";
import Comment from "../Model/comment.model.js"; // ✅ FIX: Comment import

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  try {
    const { token, body } = req.body;

    console.log("Create Post Request:", {
      hasFile: !!req.file,
      fileName: req.file?.filename,
      fileMimetype: req.file?.mimetype,
      body: body,
      token: token ? "present" : "missing",
    });

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      userId: user._id,
      body: body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype.split("/")[0] : "",
    });

    await post.save();

    console.log("Post saved successfully:", post._id);

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the post belongs to the user (Post schema uses userId field)
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // ✅ FIX: detetePost → deleteOne
    await Post.deleteOne({ _id: post_id });

    return res.json({ message: "Post Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;
  console.log("POST_ID:", post_id);

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return res.status(404).json({ message: "Post not Found" });
    }

    const comments = await Comment.find({ postId: post_id })
      .populate("userId", "username name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ comments });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "Post not FOund" });
    }

    const comment = await Comment.findOne({ _id: comment_id });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ FIX: userId → user
    if (comment.user.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "unaurhorized" });
    }

    await Comment.deleteOne({ _id: comment_id });

    return res.json({ message: "Comment Deleted", comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const increment_likes = async (req, res) => {
  const { post_id } = req.body;

  try {
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post not FOund" });
    }

    post.likes = post.likes + 1;

    await post.save();
    return res.json({ message: "Likes Incremented" });
  } catch (error) {
    return res.status(500).json({ message: error.message }); // ✅ FIX: empty catch hata diya
  }
};
