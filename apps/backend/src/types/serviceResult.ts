export interface ServiceResult<T = void> {
    isSuccess: boolean;
    message: string;
    errorCode?: string;
    data?: T;
}

export class ServiceResultBuilder {
    static success<T>(message: string, data?: T): ServiceResult<T> {
        return {
            isSuccess: true,
            message,
            data,
        };
    }

    static failure<T = void>(message: string, errorCode?: string): ServiceResult<T> {
        return {
            isSuccess: false,
            message,
            errorCode,
        };
    }
}