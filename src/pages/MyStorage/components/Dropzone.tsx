import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useFetchData, useAuth } from "hooks";
import language from "languages/es.json"
import { useLanguage } from "languages/LanguageProvider";


import { setUploadStatusAction } from "state/uploadstatus/actions";

import { useAppDispatch, useAppSelector } from "state";
import { AxiosProgressEvent } from "axios";
import { Theme } from "state/user/reducer";
import { FilesUpload } from "api/types/upload";
import { filesUpload } from "utils/upload/filesUpload";

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


const Dropzone = () => {

  const {lang} = useLanguage()

  const { encryptionEnabled, autoEncryptionEnabled } = useAppSelector(
    (state) => state.userdetail
  );


  const thisEncryptionEnabledRef = useRef(encryptionEnabled);
  const thisAutoEncryptionEnabledRef = useRef(autoEncryptionEnabled);


  useEffect(() => {
    thisEncryptionEnabledRef.current = encryptionEnabled;
    thisAutoEncryptionEnabledRef.current = autoEncryptionEnabled;
  }, [autoEncryptionEnabled, encryptionEnabled])


  const { fetchUserDetail } = useFetchData();
  const { name } = useAppSelector((state) => state.user);

  const { logout } = useAuth();
  const dispatch = useAppDispatch();

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: progressEvent.total,
      })
    );
  };

  const getRoot = () =>
    location.pathname.includes("/space/folder")
      ? location.pathname.split("/")[3]
      : "/";

  const handleFileUpload = async (files: any, isFolder: boolean) => {
    const root = getRoot();
    if (!files) return;

    const encapsulatedFile: FilesUpload = {
      files,
      isFolder,
      root,
      encryptionEnabled: thisEncryptionEnabledRef.current,
      name,
      logout,
      dispatch,
      onUploadProgress,
      fetchUserDetail,
    }

    filesUpload(encapsulatedFile).then(() => {
      fetchUserDetail();
    })

  };

  const onDrop = useCallback((acceptedFiles: any[]) => {
    const isFolderUpload = acceptedFiles[0]?.path?.includes("/");
    handleFileUpload(acceptedFiles, !!isFolderUpload);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop });

  const { theme } = useAppSelector((state) => state.user);

  return (
    <div
      className={[
        "flex-col items-center justify-center p-8 border-2 rounded-sm border-dashed outline-none mb-[15px] hidden sm:flex",
        `${getColor(isFocused, isDragAccept, isDragReject)}`, (theme === Theme.DARK ? "dark-theme3" : " bg-gray-100")
      ].join(" ")}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-center">{language[lang]["1522"]}</p>
      ) : (
        <p className="text-center">{language[lang]["151"]}</p>
      )}
    </div>
  );
}

export default Dropzone;