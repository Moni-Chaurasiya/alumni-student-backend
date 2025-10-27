const Discussion = require('../model/discussion.model');
const { sendNotificationToAll } = require('../utils/pushNotificationService');

exports.postDiscussion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Discussion content cannot be empty."
      });
    }

    const discussion = await Discussion.create({
      userId,
      content
    });

    const notificationTitle = `New Discussion Posted`;
    
    const truncatedContent = content.length > 100 
      ? content.substring(0, 97) + '...' 
      : content;

    sendNotificationToAll(
      notificationTitle,
      truncatedContent,
      {
        type: 'discussion',
        discussionId: discussion._id.toString(),
        userId: userId
      }
    ).catch(error => {
      console.error('Failed to send push notifications for new discussion:', error);
    });

    return res.status(201).json({
      success: true,
      message: "Discussion posted successfully.",
      data: discussion,
    });
  } catch (error) {
    console.error("Error posting discussion:", error);
    return res.status(500).json({
      success: false,
      message: "Error posting discussion",
      error: error.message,
    });
  }
};

exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('userId', 'name avatar') 
      .populate('comments.userId', 'name avatar')
      .sort('-createdAt'); 
    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    res.status(200).json(discussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      discussionId,
      { $set: req.body },
      { new: true } 
    );
    if (!updatedDiscussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    res.status(200).json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const deletedDiscussion = await Discussion.findByIdAndDelete(discussionId);
    if (!deletedDiscussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    res.status(200).json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.commentOnDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.id
    const { text } = req.body;
    const discussion = await Discussion.findById(discussionId).exec();
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found.",
      });
    }

    discussion.comments.push({ userId, text });
    await discussion.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully.",
      data: discussion,
    });
  } catch (error) {
    console.error("Error commenting on discussion:", error);
    return res.status(500).json({
      success: false,
      message: "Error commenting on discussion",
      error: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { commentId } = req.params;
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    discussion.comments = discussion.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await discussion.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};