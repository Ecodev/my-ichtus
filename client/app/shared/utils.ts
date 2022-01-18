/**
 * Copy text to clipboard.
 * Accepts line breaks \n as textarea do.
 */
export function copyToClipboard(text: string): void {
    const input = document.createElement('textarea');
    document.body.append(input);
    input.value = text;
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}
