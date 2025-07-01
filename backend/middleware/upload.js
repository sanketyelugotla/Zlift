const multer = require("multer")
const path = require("path")

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "uploads/"

        // Organize uploads by type
        if (file.fieldname === "logo" || file.fieldname === "banner") {
            uploadPath += "partners/"
        } else if (file.fieldname === "images") {
            uploadPath += "products/"
        } else if (file.fieldname === "license") {
            uploadPath += "documents/"
        } else {
            uploadPath += "misc/"
        }

        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    },
})

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else if (file.mimetype === "application/pdf" && file.fieldname === "license") {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type. Only images and PDF documents are allowed."), false)
    }
}

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10, // Maximum 10 files
    },
})

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 5MB.",
            })
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 10 files allowed.",
            })
        }
    }

    if (error.message === "Invalid file type. Only images and PDF documents are allowed.") {
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }

    next(error)
}

module.exports = upload
module.exports.handleUploadError = handleUploadError
