import { UploadStatus } from "api/types/upload";

export const convertJson2UploadStatus = (obj: any): UploadStatus[] => {
  const res: UploadStatus[] = [];
  for (const i in obj) {
    const temp: UploadStatus = {
      name: obj[i]["name"],
      read: obj[i]["read"],
      size: obj[i]["size"],
    };

    res.push(temp);
  }

  return res;
};
