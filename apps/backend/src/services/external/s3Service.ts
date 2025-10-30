import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import mime from "mime-types";
import { Readable } from "stream";

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || "ap-southeast-2",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || "hcmue-tailieu-hoctap-20251029";
    }

    /**
     * Generate S3 key theo cấu trúc: hoc-phan/{maHocPhan}/{maLop}/{uuid}-{filename}
     */
    private generateS3Key(maHocPhan: string, maLop: string, originalFilename: string): string {
        const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueId = randomUUID().substring(0, 8);

        return `hoc-phan/${maHocPhan}/${maLop}/${uniqueId}-${cleanFilename}`;
    }

    /**
     * Upload file lên S3
     */
    async uploadFile(params: {
        maHocPhan: string;
        maLop: string;
        file: Express.Multer.File;
    }): Promise<{ s3Key: string; fileUrl: string }> {
        const { maHocPhan, maLop, file } = params;

        const s3Key = this.generateS3Key(maHocPhan, maLop, file.originalname);
        const contentType = file.mimetype || mime.lookup(file.originalname) || "application/octet-stream";

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            Body: file.buffer,
            ContentType: contentType,
        });

        await this.s3Client.send(command);

        const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        return { s3Key, fileUrl };
    }

    /**
     * Xóa file trên S3
     */
    async deleteFile(s3Key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });

        await this.s3Client.send(command);
    }

    /**
     * Get file stream từ S3 để download
     */
    async getFileStream(s3Key: string): Promise<{ stream: Readable; contentType: string; contentLength?: number }> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });

        const response = await this.s3Client.send(command);

        if (!response.Body) {
            throw new Error("File not found in S3");
        }

        // Convert response body to readable stream
        const stream = response.Body as Readable;
        const contentType = response.ContentType || "application/octet-stream";
        const contentLength = response.ContentLength;

        return { stream, contentType, contentLength };
    }

    /**
     * Get filename from S3 key
     */
    getFilenameFromKey(s3Key: string): string {
        const parts = s3Key.split("/");
        const fullFilename = parts[parts.length - 1];

        // Remove UUID prefix (e.g., "a1b2c3d4-slide.pdf" -> "slide.pdf")
        const match = fullFilename.match(/^[a-f0-9]{8}-(.+)$/i);
        return match ? match[1] : fullFilename;
    }
}
