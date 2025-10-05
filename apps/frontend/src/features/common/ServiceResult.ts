export interface ServiceResult<T = void> {
    isSuccess: boolean;
    message: string;
    errorCode?: string;
    data?: T;
}