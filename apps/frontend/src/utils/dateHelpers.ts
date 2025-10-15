/**
 * Convert ISO string sang format datetime-local
 * @example "2025-06-25T01:00:00.000Z" → "2025-06-25T01:00"
 */
export function toDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert datetime-local format sang ISO string
 * @example "2025-06-25T01:00" → "2025-06-25T01:00:00.000Z"
 */
export function toISOString(datetimeLocal: string): string {
    return new Date(datetimeLocal).toISOString();
}