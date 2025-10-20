import multer from "multer";
export const uploadExcel = multer({ storage: multer.memoryStorage() });
