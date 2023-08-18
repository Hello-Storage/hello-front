
// Map of file extensions with their corresponding icons
export const fileIcons = { pdf: 'fa-file-pdf', png: 'fa-file-image', jpg: 'fa-file-image', jpeg: 'fa-file-image', doc: 'fa-file-word', docx: 'fa-file-word', xls: 'fa-file-excel', xlsx: 'fa-file-excel', ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint', zip: 'fa-file-archive', rar: 'fa-file-archive', mp3: 'fa-file-audio', wav: 'fa-file-audio', mp4: 'fa-file-video', avi: 'fa-file-video', mov: 'fa-file-video', txt: 'fa-file-alt', js: 'fa-file-code', ts: 'fa-file-code', py: 'fa-file-code', java: 'fa-file-code', c: 'fa-file-code', cpp: 'fa-file-code', cs: 'fa-file-code', go: 'fa-file-code', php: 'fa-file-code', html: 'fa-file-code', css: 'fa-file-code', key: 'fa-key', dll: 'fa-wrench', apk: 'fa-file-code', exe: 'fa-file-code', iso: 'fa-file-code', dmg: 'fa-file-code', json: 'fa-file-code', csv: 'fa-file-code', xml: 'fa-file-code', svg: 'fa-file-code', ttf: 'fa-file-code', woff: 'fa-file-code', woff2: 'fa-file-code', eot: 'fa-file-code', otf: 'fa-file-code', md: 'fa-file-code', yml: 'fa-file-code', yaml: 'fa-file-code', sh: 'fa-file-code', bat: 'fa-file-code', bin: 'fa-file-code', ps1: 'fa-file-code', vbs: 'fa-file-code', cmd: 'fa-file-code', jar: 'fa-file-code', sql: 'fa-file-code' };

// Set of viewable file extensions
export const viewableExtensions = new Set(['html', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico', 'mp4', 'webm', 'ogg', 'mp3', 'wav', 'txt', 'csv', 'md', 'xml', 'js', 'json', 'css', 'pdf']);

// Takes a file name and returns the file extension
export const getFileExtension = (fileName: string): string | null => {
    // Split the file name by the dot
    const parts = fileName.split('.');

    // If there is only one part, there is no extension
    if (parts.length <= 1) return null;

    // Return the last part, which is the extension
    return parts[parts.length - 1];
}