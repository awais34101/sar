import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { s3Service } from './s3';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware to handle file uploads to S3
export const uploadToS3 = (fieldName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return next();
      }

      try {
        // Upload to S3
        const s3Key = await s3Service.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        // Add S3 info to request
        req.body.s3Key = s3Key;
        req.body.fileUrl = await s3Service.getFileUrl(s3Key);
        req.body.fileName = req.file.originalname;
        req.body.fileSize = req.file.size;
        req.body.fileType = req.file.mimetype;

        next();
      } catch (error) {
        console.error('S3 upload error:', error);
        res.status(500).json({ error: 'Failed to upload file to cloud storage' });
      }
    });
  };
};

// Middleware to handle multiple file uploads
export const uploadMultipleToS3 = (fieldName: string, maxCount: number = 5) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uploadMultiple = upload.array(fieldName, maxCount);

    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || !Array.isArray(req.files)) {
        return next();
      }

      try {
        const uploadPromises = req.files.map(async (file) => {
          const s3Key = await s3Service.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype
          );

          return {
            s3Key,
            fileUrl: await s3Service.getFileUrl(s3Key),
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        req.body.uploadedFiles = uploadedFiles;

        next();
      } catch (error) {
        console.error('S3 multiple upload error:', error);
        res.status(500).json({ error: 'Failed to upload files to cloud storage' });
      }
    });
  };
};