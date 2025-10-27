const  User  = require('../model/user.model');
const News = require('../model/newsPost.model');
const { uploadFileOnCloudinary } = require('../utils/uploadOnCloudinary.utils');
const { sendNotificationByRole } = require('../utils/pushNotificationService');


exports.postNews = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members are allowed to post news.',
      });
    }

    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required.',
      });
    }

    let imageUrl = null;

    if (req.files && req.files.imageFile) {
      const result = await uploadFileOnCloudinary(req.files.imageFile, 'newsImages');
      imageUrl = result.secure_url;
    }

    const news = await News.create({
      title,
      content,
      category,
      imageFile: imageUrl,
    });

    //const facultyName = user.name || "Faculty";

    const notificationPayload = {
      type: 'news',
      newsId: news._id.toString(),
      category,
    };

    const roles = ['alumni', 'student', 'faculty'];

    for (const role of roles) {
      sendNotificationByRole(
        role,
        `New ${category} Announcement`,
       // `${facultyName} posted: ${title}`,
        ` posted: ${title}`,
        notificationPayload
      ).catch(error => {
        console.error(`Failed to send push notifications to ${role} for new news:`, error);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'News posted successfully.',
      data: news,
    });
  } catch (error) {
    console.error('Error posting news:', error);
    return res.status(500).json({
      success: false,
      message: 'Error posting news',
      error: error.message,
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Fetched all news',
      data: newsList,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message,
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Fetched news successfully',
      data: news,
    });
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message,
    });
  }
};

exports.updateNews = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members are allowed to post news.',
      });
    }

    const { title, content, category, isPublished } = req.body;

    let updatedData = {
      title,
      content,
      category,
      isPublished,
    };

    if (req.files && req.files.imageFile) {
      const result = await uploadFileOnCloudinary(req.files.imageFile, 'newsImages');
      updatedData.imageFile = result.secure_url;
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'News updated successfully',
      data: updatedNews,
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating news',
      error: error.message,
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members are allowed to post news.',
      });
    }


    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting news',
      error: error.message,
    });
  }
};