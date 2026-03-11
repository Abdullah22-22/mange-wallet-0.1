import User from "../../modules/Auth/userModel.js";

export async function getAiStatus(req, res, next) {
    try {
        const user = await User.findById(req.userId).select("aiConsent aiConsentAt");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            aiConsent: user.aiConsent,
            aiConsentAt: user.aiConsentAt,
        });
    } catch (err) {
        next(err);
    }
}

export async function setAiConsent(req, res, next) {
    try {
        const { consent } = req.body;

        if (typeof consent !== "boolean") {
            return res.status(400).json({ message: "Consent must be boolean" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                aiConsent: consent,
                aiConsentAt: consent ? new Date() : null,
            },
            { new: true }
        ).select("aiConsent aiConsentAt");

        return res.json({
            aiConsent: user.aiConsent,
            aiConsentAt: user.aiConsentAt,
        });
    } catch (err) {
        next(err);
    }
}