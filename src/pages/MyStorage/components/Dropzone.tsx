import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const getColor = (
  isFocused: boolean,
  isDragAccept: boolean,
  isDragReject: boolean
) => {
  if (isDragAccept) {
    return "border-[#00e676]";
  }
  if (isDragReject) {
    return "border-[#ff1744]";
  }
  if (isFocused) {
    return "border-[#2196f3]";
  }
  return "border-[#eeeeee]";
};

export default function Dropzone() {
  const onDrop = useCallback((acceptedFiles: any[]) => {
    // Do something with the files
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop });

  return (
    <div
      className={[
        "flex flex-col items-center p-8 border-2 rounded-sm border-dashed bg-gray-50 outline-none mb-5 md:hidden",
        `${getColor(isFocused, isDragAccept, isDragReject)}`,
      ].join(" ")}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag'n drop to upload, or click to here</p>
      )}
    </div>
  );
}
