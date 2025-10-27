const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const Alumni = require('../model/alumni.model');
const Admin = require('../model/admin.model');
const mailSender = require('../utils/nodemailer.utils');
require('dotenv').config();

exports.adminSignup = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in admin signup',
            error: error.message
        });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const payload = {
            admin: {
                id: admin._id,
                role: admin.role
            }
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: '1d'
        });

        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        return res.cookie('token', token, options).json({
            success: true,
            token,
            admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in admin login',
            error: error.message
        });
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const pendingAlumni = await User.find({
            role: 'alumni',
            'verificationDetails.verificationStatus': 'pending'
        }).exec();

        const pendingAlumniDetails = [];
        for (const user of pendingAlumni) {
            const alumniData = await Alumni.findOne({ userId: user._id }).exec();
            pendingAlumniDetails.push({
                userId: user._id,
                email: user.email,
                verificationDetails: user.verificationDetails,
                alumniDetails: alumniData
                
            });
        }

        return res.status(200).json({
            success: true,
            data: pendingAlumniDetails
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching pending verifications',
            error: error.message
        });
    }
};

exports.updateVerificationStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const status = req.body.status;
        const adminId = req.admin.id; 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.verificationDetails.verificationStatus = status;
        user.verificationDetails.verifiedAt = new Date();
        user.verificationDetails.verifiedBy = adminId;
        user.verified = status === 'approved';
        user.loginAllowed = status === 'approved';

        await user.save();

        const alumniData = await Alumni.findOne({ userId: user._id });

        const emailSubject = `Alumni Verification ${status.toUpperCase()}`;
        const emailContent = status === 'approved' 
            ? `Dear ${alumniData.name},\n\nYour alumni verification has been approved. You can now login to your account.`
            : `Dear ${alumniData.name},\n\nYour alumni verification has been rejected. Please contact the administrator for more information.`;

        await mailSender(user.email, emailSubject, emailContent);

        return res.status(200).json({
            success: true,
            message: `Verification ${status} successfully`,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating verification status',
            error: error.message
        });
    }
};