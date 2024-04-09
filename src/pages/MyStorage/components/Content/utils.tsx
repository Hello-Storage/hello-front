import { ReactNode } from "react";
import {
  FaFile
} from "react-icons/fa";
import { Theme } from "state/user/reducer";

// Map of file extensions with their corresponding icons
import { fileIcons } from "./FileIcons";
import { File } from "api";

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
  "yml",
  "yaml",
  "php",
  "py",
  "java",
  "gitignore",
  "sh",
  "c",
  "cpp",
  "h",
  "cs",
  "css",
  "scss",
  "sass",
  "gitconfig",
  "md",
  "reg",
  "toml",
  "ts",
  "tsx",
  "flv",
  "mkv",
  "avi",
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

export const getFileIcon = (file: File, theme: Theme) => {
  // find extension
  const ext = getFileExtension(file.name);
  const color = (theme === Theme.DARK ? "#ffffff" : "#272727")
  const classn = "p-2 rounded-lg min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] " + (theme === Theme.DARK ? "bg-[#32334b]" : "bg-gray-200")
  const IconComponent = (fileIcons as { [key: string]: (color: string, classn: string) => ReactNode })[ext];
  return IconComponent ? IconComponent(color, classn) : (
    <FaFile
      color={color}
      className={classn}
    />
  );
};

export const isViewable = (fileName: string) => {
  const ext = getFileExtension(fileName);

  return viewableExtensions.has(ext);
};
