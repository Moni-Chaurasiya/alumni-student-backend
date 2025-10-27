const admin = require('../firebase.js');
const User = require('../model/user.model.js');

async function sendPushNotification(token, title, body, data) {
  try {
    const message = {
      token,
      notification: { title, body },
      data,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function sendNotificationByRole(role, title, body, data) {
  try {
    const users = await User.find({ role, fcmToken: { $exists: true, $ne: null } });
    for (const user of users) {
      await sendPushNotification(user.fcmToken, title, body, data);
      console.log("Notification sended successfully")
    }
  } catch (error) {
    console.error(`Error sending push notifications to ${role}:`, error);
    throw error;
  }
}

async function sendNotificationToAll(title, body, data) {
  try {
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    const sendPromises = users.map(user => sendPushNotification(user.fcmToken, title, body, data));
    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    throw error;
  }
}

module.exports = { sendPushNotification, sendNotificationByRole , sendNotificationToAll};