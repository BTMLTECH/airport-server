import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Memory storage setup (storing files in memory for now)
const storage = multer.memoryStorage();

const uploadDocument = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {

    const allowedMimes = [
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'image/jpg', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel', 
      'text/csv', 
    ];

    // Check if the uploaded file's mimetype is allowed
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error('Only PDF, JPG, PNG, XLSX, XLS, CSV files are allowed'));
    } else {
      cb(null, true); 
    }
  },
});

export default uploadDocument;
