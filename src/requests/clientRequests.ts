import axios, { AxiosResponse } from "axios"
import { FileDB } from "../types";


const baseUrl = "https://ounn.space" //replace with specific domain url


export const deleteFile = async (file: FileDB | null): Promise<AxiosResponse | null> => {
  const customToken = localStorage.getItem("customToken");

  const fileId = file?.ID;
  if (!fileId) {
    return Promise.resolve(null);
  }
  return axios.delete(`${baseUrl}/api/file/${fileId}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {
    console.log(response);
    return response
  }).catch((error) => {
    console.log(error);
    return null
  });
}

export const downloadFile = (file: FileDB) => {
  const cid = file.cid;
  if (!cid) {
    return;
  }
  const customToken = localStorage.getItem("customToken");

  axios.get(`${baseUrl}/api/file/${cid}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
    responseType: 'blob', // set response type as blob to handle binary data
  }).then((response) => {
    console.log(response)
    // Create a new Blob object with the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    // Create an object URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link and programmatically 'click' it to initiate the download
    const link = document.createElement('a');
    link.href = url;
    const filename = response.headers['original-filename'];

    link.setAttribute('download', filename); // or any other filename you want
    link.click();

    // For better performance, revoke the object URL after the download
    window.URL.revokeObjectURL(url);
  }).catch((error) => {
    console.log(error);
    return null
  });
}

export const savePassword = async (password: string): Promise<AxiosResponse | null> => {
  const customToken = localStorage.getItem("customToken");

  return axios.post(`${baseUrl}/api/password`, { password: password }, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {
    console.log(response);
    return response
  }).catch((error) => {
    console.log(error);
    return null
  });


}