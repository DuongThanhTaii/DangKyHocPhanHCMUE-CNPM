import multer from "multer";

// Multer config: store file in memory (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed file types
    const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
        "text/plain",
        "video/mp4",
        "image/jpeg",
        "image/png",
        "application/zip",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter,
});
