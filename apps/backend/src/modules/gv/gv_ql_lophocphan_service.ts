import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getMyLopHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { hoc_ky_id } = req.query;

        const result = await serviceFactory.gvLopHocPhanService.getMyLopHocPhan(
            gvUserId,
            hoc_ky_id as string | undefined
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getLopHocPhanDetailHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.getLopHocPhanDetail(id, gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getStudentsOfLHPHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.getStudentsOfLHP(id, gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getDocumentsHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.getDocuments(id, gvUserId);

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const uploadDocumentHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;
        const { ten_tai_lieu } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Không có file được upload")
            );
        }

        const result = await serviceFactory.gvLopHocPhanService.uploadDocument(
            id,
            gvUserId,
            file,
            ten_tai_lieu
        );

        if (result.isSuccess) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getGradesHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.getGrades(id, gvUserId);

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const upsertGradesHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Danh sách điểm không hợp lệ")
            );
        }

        // ✅ Validate UUID format và điểm số
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const item of items) {
            // Validate UUID sinh viên
            if (!item.sinh_vien_id || !uuidRegex.test(item.sinh_vien_id)) {
                return res.status(400).json(
                    ServiceResultBuilder.failure(
                        `Sinh viên ID không hợp lệ (phải là UUID): ${item.sinh_vien_id || 'undefined'}`
                    )
                );
            }

            // Validate điểm số
            if (typeof item.diem_so !== 'number' || item.diem_so < 0 || item.diem_so > 10) {
                return res.status(400).json(
                    ServiceResultBuilder.failure(
                        `Điểm số không hợp lệ: ${item.diem_so} (phải từ 0-10)`
                    )
                );
            }
        }

        const result = await serviceFactory.gvLopHocPhanService.upsertGrades(id, gvUserId, items);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const deleteDocumentHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id, docId } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.deleteDocument(id, docId, gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const downloadDocumentHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id, docId } = req.params;

        const result = await serviceFactory.gvLopHocPhanService.streamDocument(
            id,
            docId,
            gvUserId
        );

        if (!result.isSuccess) {
            return res.status(400).json(result);
        }

        const { stream, contentType, contentLength, filename } = result.data!;

        // Set response headers
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);

        if (contentLength) {
            res.setHeader("Content-Length", contentLength);
        }

        // Stream file to response
        stream.pipe(res);

        // Handle stream errors
        stream.on("error", (error: Error) => {
            console.error("Stream error:", error);
            if (!res.headersSent) {
                res.status(500).json(
                    ServiceResultBuilder.failure("Lỗi khi stream file")
                );
            }
        });
    } catch (err: any) {
        console.error("Error downloading document:", err);
        if (!res.headersSent) {
            res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    }
};

export const updateDocumentHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id, docId } = req.params;
        const { ten_tai_lieu } = req.body;

        if (!ten_tai_lieu) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu tên tài liệu")
            );
        }

        const result = await serviceFactory.gvLopHocPhanService.updateDocument(
            id,
            docId,
            gvUserId,
            ten_tai_lieu
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
