/**
 * Returns `value` only if it is a same-site relative path, otherwise "/".
 * Prevents open redirects through ?callbackUrl=https://evil.example or //evil.example.
 */
export function safeCallbackUrl(value: string | null | undefined): string {
    if (!value || !value.startsWith("/")) return "/";
    if (value.startsWith("//") || value.startsWith("/\\")) return "/";
    if (/[\u0000-\u001f]/.test(value)) return "/";
    return value;
}
