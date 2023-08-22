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
  pdf: <FaFilePdf size={32} color="#3b82f6" />, // "fa-file-pdf",
  png: <FaFileImage size={32} color="#3b82f6" />,
  jpg: <FaFileImage size={32} color="#3b82f6" />,
  jpeg: <FaFileImage size={32} color="#3b82f6" />,
  doc: <FaFileWord size={32} color="#3b82f6" />,
  docx: <FaFileWord size={32} color="#3b82f6" />,
  xls: <FaFileExcel size={32} color="#3b82f6" />,
  xlsx: <FaFileExcel size={32} color="#3b82f6" />,
  ppt: <FaFilePowerpoint size={32} color="#3b82f6" />,
  pptx: <FaFilePowerpoint size={32} color="#3b82f6" />,
  zip: <FaFileArchive size={32} color="#3b82f6" />,
  rar: <FaFileArchive size={32} color="#3b82f6" />,
  mp3: <FaFileAudio size={32} color="#3b82f6" />,
  wav: <FaFileAudio size={32} color="#3b82f6" />,
  mp4: <FaFileVideo size={32} color="#3b82f6" />,
  avi: <FaFileVideo size={32} color="#3b82f6" />,
  mov: <FaFileVideo size={32} color="#3b82f6" />,
  txt: <FaFileAlt size={32} color="#3b82f6" />,
  js: <FaFileCode size={32} color="#3b82f6" />,
  ts: <FaFileCode size={32} color="#3b82f6" />,
  py: <FaFileCode size={32} color="#3b82f6" />,
  java: <FaFileCode size={32} color="#3b82f6" />,
  c: <FaFileCode size={32} color="#3b82f6" />,
  cpp: <FaFileCode size={32} color="#3b82f6" />,
  cs: <FaFileCode size={32} color="#3b82f6" />,
  go: <FaFileCode size={32} color="#3b82f6" />,
  php: <FaFileCode size={32} color="#3b82f6" />,
  html: <FaFileCode size={32} color="#3b82f6" />,
  css: <FaFileCode size={32} color="#3b82f6" />,
  key: <FaKey size={32} color="#3b82f6" />,
  dll: <FaWrench size={32} color="#3b82f6" />,
  apk: <FaFileCode size={32} color="#3b82f6" />,
  exe: <FaFileCode size={32} color="#3b82f6" />,
  iso: <FaFileCode size={32} color="#3b82f6" />,
  dmg: <FaFileCode size={32} color="#3b82f6" />,
  json: <FaFileCode size={32} color="#3b82f6" />,
  csv: <FaFileCode size={32} color="#3b82f6" />,
  xml: <FaFileCode size={32} color="#3b82f6" />,
  svg: <FaFileCode size={32} color="#3b82f6" />,
  ttf: <FaFileCode size={32} color="#3b82f6" />,
  woff: <FaFileCode size={32} color="#3b82f6" />,
  woff2: <FaFileCode size={32} color="#3b82f6" />,
  eot: <FaFileCode size={32} color="#3b82f6" />,
  otf: <FaFileCode size={32} color="#3b82f6" />,
  md: <FaFileCode size={32} color="#3b82f6" />,
  yml: <FaFileCode size={32} color="#3b82f6" />,
  yaml: <FaFileCode size={32} color="#3b82f6" />,
  sh: <FaFileCode size={32} color="#3b82f6" />,
  bat: <FaFileCode size={32} color="#3b82f6" />,
  bin: <FaFileCode size={32} color="#3b82f6" />,
  ps1: <FaFileCode size={32} color="#3b82f6" />,
  vbs: <FaFileCode size={32} color="#3b82f6" />,
  cmd: <FaFileCode size={32} color="#3b82f6" />,
  jar: <FaFileCode size={32} color="#3b82f6" />,
  sql: <FaFileCode size={32} color="#3b82f6" />,
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
      <FaFile size={32} color="#3b82f6" />
    )
  );
};

export const isViewable = (fileName: string) => {
  const ext = getFileExtension(fileName);

  return viewableExtensions.has(ext);
};
