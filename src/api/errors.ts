/**
 * Error handling utilities for the API layer.
 * All errors thrown from the API layer are Error instances with Spanish messages.
 */

export interface ApiErrorResponse {
    status: {
        code: number;
        message: string;
    };
}

/**
 * Extracts a user-friendly Spanish error message from an unknown error.
 * @param err - The caught error (typically from axios)
 * @param fallback - Default Spanish message if extraction fails
 * @returns A Spanish error message string
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: ApiErrorResponse } };
        const message = axiosError.response?.data?.status?.message;
        if (message && typeof message === 'string') {
            return message;
        }
    }
    if (err instanceof Error) {
        return err.message;
    }
    return fallback;
}

/**
 * Creates a standardized API error with a Spanish message.
 * @param err - The caught error
 * @param fallback - Default Spanish message
 * @returns An Error instance with a Spanish message
 */
export function createApiError(err: unknown, fallback: string): Error {
    return new Error(extractErrorMessage(err, fallback));
}