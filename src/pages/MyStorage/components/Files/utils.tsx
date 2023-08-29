import { ReactNode } from "react";
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileAudio,
  FaFileCode,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
  FaKey,
  FaWrench,
} from "react-icons/fa";

// Map of file extensions with their corresponding icons
export const fileIcons = {
  pdf: (
    <FaFilePdf
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  png: (
    <FaFileImage
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  jpg: (
    <FaFileImage
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  jpeg: (
    <FaFileImage
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  doc: (
    <FaFileWord
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  docx: (
    <FaFileWord
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  xls: (
    <FaFileExcel
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  xlsx: (
    <FaFileExcel
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  ppt: (
    <FaFilePowerpoint
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  pptx: (
    <FaFilePowerpoint
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  zip: (
    <FaFileArchive
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  rar: (
    <FaFileArchive
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  mp3: (
    <FaFileAudio
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  wav: (
    <FaFileAudio
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  mp4: (
    <FaFileVideo
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  avi: (
    <FaFileVideo
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  mov: (
    <FaFileVideo
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  txt: (
    <FaFileAlt
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  js: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  ts: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  py: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  java: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  c: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  cpp: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  cs: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  go: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  php: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  html: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  css: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  key: (
    <FaKey size={32} color="#272727" className="bg-gray-200 p-2 rounded-lg" />
  ),
  dll: (
    <FaWrench
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  apk: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  exe: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  iso: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  dmg: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  json: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  csv: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  xml: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  svg: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  ttf: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  woff: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  woff2: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  eot: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  otf: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  md: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  yml: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  yaml: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  sh: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  bat: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  bin: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  ps1: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  vbs: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  cmd: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  jar: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
  sql: (
    <FaFileCode
      size={32}
      color="#272727"
      className="bg-gray-200 p-2 rounded-lg"
    />
  ),
};

// Set of viewable file extensions
export const viewableExtensions = new Set([
  "html",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "svg",
  "webp",
  "ico",
  "mp4",
  "webm",
  "ogg",
  "mp3",
  "wav",
  "txt",
  "csv",
  "md",
  "xml",
  "js",
  "json",
  "css",
  "pdf",
]);

// Takes a file name and returns the file extension
export const getFileExtension = (fileName: string): string => {
  // Split the file name by the dot
  const parts = fileName.split(".");

  // If there is only one part, there is no extension
  if (parts.length <= 1) return "";

  // Return the last part, which is the extension
  return parts[parts.length - 1].toLowerCase();
};

export const getFileIcon = (fileName: string) => {
  // find extension
  const ext = getFileExtension(fileName);
  return (
    (fileIcons as { [key: string]: ReactNode })[ext] ?? (
      <FaFile
        size={32}
        color="#272727"
        className="bg-gray-200 p-2 rounded-lg"
      />
    )
  );
};

export const isViewable = (fileName: string) => {
  const ext = getFileExtension(fileName);

  return viewableExtensions.has(ext);
};
