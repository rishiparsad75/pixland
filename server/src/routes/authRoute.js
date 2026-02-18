const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const { protect, superAdmin } = require("../middleware/authMiddleware");
const { sendOTP, verifyOTP } = require("../services/smsService");
const { sendEmailOTP } = require("../services/emailService");




const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

router.post("/register", async (req, res) => {
    const { name, email, mobile, password, otp } = req.body;

    try {
        // Verify OTP
        const otpRecord = await OTP.findOne({ mobile: email }); // Using mobile field to store email-key in OTP model for now or update model
        if (!otpRecord) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        // Logic to verify OTP code
        console.log(`[Verification] Checking OTP for ${email}: Received ${otp}, Expected ${otpRecord.pinId}`);
        if (otpRecord.pinId.toString().trim() !== otp.toString().trim()) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({ message: "Email or Mobile already registered" });
        }

        const user = await User.create({
            name,
            email,
            mobile,
            password,
        });

        if (user) {
            await OTP.deleteOne({ _id: otpRecord._id });
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post("/photographer-register", async (req, res) => {
    const { name, email, password, mobile, cameraModel, otp } = req.body;

    try {
        // Verify OTP
        const otpRecord = await OTP.findOne({ mobile: email });
        if (!otpRecord) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        console.log(`[Verification] Checking Photographer OTP for ${email}: Received ${otp}, Expected ${otpRecord.pinId}`);
        if (otpRecord.pinId.toString().trim() !== otp.toString().trim()) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });

        if (userExists) {
            return res.status(400).json({ message: "Email or Mobile already registered" });
        }

        const user = await User.create({
            name,
            email,
            password,
            mobile,
            cameraModel,
            role: "photographer",
            status: "pending",
        });

        if (user) {
            await OTP.deleteOne({ _id: otpRecord._id });
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log(`Login attempt for ${email}: User found, Password match: ${isMatch}`);
            if (isMatch) {
                // Check user status
                if (user.status === 'pending') {
                    return res.status(403).json({
                        message: "Your account is pending admin approval. Please wait for verification."
                    });
                }

                if (user.status === 'rejected') {
                    return res.status(403).json({
                        message: "Your account has been rejected. Please contact support."
                    });
                }

                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role, // Essential for frontend RBAC
                    token: generateToken(user._id),
                });
            }
        } else {
            console.log(`Login attempt for ${email}: User NOT found`);
        }
        res.status(401).json({ message: "Invalid email or password" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send OTP to mobile number
// @route   POST /api/auth/send-otp
// @access  Public
router.post("/send-otp", async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required" });
    }

    try {
        // Delegate OTP generation and sending to Infobip 2FA API
        const pinId = await sendOTP(mobile);

        if (pinId) {
            // Save pinId to DB (TTL will handle expiration)
            await OTP.findOneAndUpdate(
                { mobile },
                { pinId: pinId },
                { upsert: true, new: true }
            );
            res.status(200).json({ message: "OTP sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send OTP via Infobip" });
        }
    } catch (error) {

        console.error("Send OTP error:", error);
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
});

// @desc    Verify OTP and login/signup
// @route   POST /api/auth/verify-otp
// @access  Public
router.post("/verify-otp", async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ message: "Mobile and OTP are required" });
    }

    try {
        const otpRecord = await OTP.findOne({ mobile });

        if (!otpRecord) {
            return res.status(400).json({ message: "No OTP request found for this number" });
        }

        // Verify PIN with Infobip 2FA API
        const isVerified = await verifyOTP(otpRecord.pinId, otp);

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }


        // OTP is valid, find or create user
        let user = await User.findOne({ mobile });

        if (!user) {
            // Check if there's an email user with this mobile (optional logic)
            // For now, let's just create a new user if not found
            // Since we don't have name/email, we'll use mobile as name/email placeholder or ask frontend to provide it
            // However, typical mobile login for existing users works if they added mobile to profile
            return res.status(200).json({
                success: true,
                newUser: true,
                message: "OTP verified. Redirection to complete registration or login.",
                mobile
            });
        }

        // User exists, login
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            message: "Login successful"
        });

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
});

// @desc    Complete registration with mobile (for new users)
// @route   POST /api/auth/register-mobile
// @access  Public
router.post("/register-mobile", async (req, res) => {
    const { name, email, mobile } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });

        if (userExists) {
            return res.status(400).json({ message: "User with this email or mobile already exists" });
        }

        const user = await User.create({
            name,
            email,
            mobile,
            password: Math.random().toString(36).slice(-8), // Dummy password for mobile users
            status: "active" // Mobile verified users are active
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Super Admin: Get all photographers
router.get("/photographers", protect, superAdmin, async (req, res) => {
    try {
        const photographers = await User.find({ role: "photographer" }).select("-password");
        res.json(photographers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching photographers" });
    }
});

// Get current user information
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Super Admin: Create a photographer
router.post("/photographers", protect, superAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const photographer = await User.create({
            name,
            email,
            password,
            role: "photographer"
        });
        res.status(201).json({ _id: photographer._id, name: photographer.name, email: photographer.email });
    } catch (error) {
        res.status(500).json({ message: "Error creating photographer" });
    }
});

// Super Admin: Get all users (including admins/photographers)
router.get("/", protect, superAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Super Admin: Delete user
router.delete("/:id", protect, superAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

// Super Admin: Approve user
router.patch("/:id/approve", protect, superAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User approved successfully", user });
    } catch (error) {
        console.error("Approve error:", error);
        res.status(500).json({ message: "Error approving user", error: error.message });
    }
});

// Super Admin: Reject user
router.patch("/:id/reject", protect, superAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User rejected successfully", user });
    } catch (error) {
        console.error("Reject error:", error);
        res.status(500).json({ message: "Error rejecting user", error: error.message });
    }
});

// @desc    Send Registration OTP to Email
// @route   POST /api/users/send-registration-otp
// @access  Public
router.post("/send-registration-otp", async (req, res) => {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
        return res.status(400).json({ message: "Email and Mobile are required" });
    }

    try {
        // Check if unique
        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({ message: "Email or Mobile already registered" });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (reusing OTP model)
        // We use mobile: email as the key to store registration OTPs
        await OTP.findOneAndUpdate(
            { mobile: email },
            { pinId: otpCode },
            { upsert: true, new: true }
        );

        // Send Email
        const sent = await sendEmailOTP(email, otpCode);
        if (sent) {
            res.status(200).json({ message: "Verification code sent to email" });
        } else {
            res.status(500).json({ message: "Failed to send email. Check server configuration." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

