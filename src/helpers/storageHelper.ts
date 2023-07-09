import axios from "axios";
import { decryptContent, getHashFromSignature, getKeyFromHash } from "./cipher";
import { baseUrl } from "../constants";
import { FileDB, PieData, PieTypes } from "../types";

export const decryptMetadata = async (encryptedMetadata: string, ivStr: string, key: CryptoKey) => {
  //decrypt metadata

  const encryptedMetadataBytes = Uint8Array.from(
    atob(encryptedMetadata),
    (c) => c.charCodeAt(0)
  )

  const iv = Uint8Array.from(atob(ivStr), (c) => c.charCodeAt(0))

  //deecrypt the metadata
  const metadataBuffer = await decryptContent(
    iv,
    key,
    encryptedMetadataBytes
  )

  //transform metadata from ArrayBuffer to string
  const decoder = new TextDecoder()
  const metadataString = decoder.decode(metadataBuffer)

  //transform metadata from string to JSON Object
  const metadata = JSON.parse(metadataString)

  return metadata
}

export const formatByteWeight = (weight: number): string => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  const TB = GB * 1024;

  let size: string;
  switch (true) {
    case weight >= TB:
      size = `${(weight / TB).toFixed(2)} TB`;
      break;
    case weight >= GB:
      size = `${(weight / GB).toFixed(2)} GB`;
      break;
    case weight >= MB:
      size = `${(weight / MB).toFixed(2)} MB`;
      break;
    case weight >= KB:
      size = `${(weight / KB).toFixed(2)} KB`;
      break;
    default:
      size = `${weight} B`;
  }

  console.log("File Size:", size);
  return size;
}

export const getDecryptedFilesList = async (customToken: string | null): Promise<FileDB[] | undefined> => {
  try {
    //get files list from /api/files with auth header "Bearer customToken"
    const response = await axios
      .get(`${baseUrl}/api/files`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
        },
      })
    const filesList: FileDB[] = await response.data.files;

    const signature = sessionStorage.getItem("personalSignature");

    if (!signature) {
      return;
    }

    const hash = await getHashFromSignature(signature);
    const key = await getKeyFromHash(hash);
    //iterate through filesList and decrypt metadata
    const decryptedFiles = await Promise.all(
      filesList.map(async (file: FileDB) => {
        //decrypt metadata
        const metadata = await decryptMetadata(file.encryptedMetadata, file.iv, key);
        //set metadata
        file.metadata = metadata;
        return file;
      })
    );

    return decryptedFiles;

  } catch (error) {
    console.log(error);
    throw error;
  }

}


//Function that sorts file types by extension

export const sortFilesByType = (files: FileDB[]): PieData[] => {
  const types: PieTypes = {
    'Photos': ["jpg", "jpeg", "png", "gif", "svg", "webp", "tiff", "psd", "raw", "bmp", "heif", "indd", "jpeg 2000", "ico", "jp2", "jxr", "hdp", "wdp", "cur", "dds", "tga", "ai", "eps", "ps", "svgz", "cdr", "dxf", "wmf", "emf", "dwg", "dng", "cr2", "nef", "orf", "sr2", "raf", "pef", "rw2", "rwl", "mrw", "mos", "arw", "kdc", "dcr", "erf", "x3f", "srw", "nrw", "3fr", "mef", "pct", "pict", "ppm", "pbm", "pgm", "pnm", "webp"],
    'Videos': ["webm", "mpg", "mp2", "mpeg", "mpe", "mpv", "ogg", "mp4", "m4p", "m4v", "avi", "wmv", "mov", "qt", "flv", "swf", "avchd", "mkv", "3gp", "3g2", "mxf", "roq", "nsv", "flv", "f4v", "f4p", "f4a", "f4b"],
    'Documents': ["doc", "docx", "docm", "dotx", "dotm", "docb", "xls", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw", "ppt", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm", "pdf", "txt", "rtf", "odt", "wpd", "wps", "csv", "xml", "json", "log", "msg", "pages", "numbers", "key", "odp", "pps", "xps", "dot", "dotx", "dotm", "doc", "docm", "docx", "xls", "xlsb", "xlsm", "xlsx", "xlt", "xltm", "xltx", "ppt", "pptm", "pptx", "pot", "potm", "potx", "ppa", "ppam", "pps", "ppsm", "ppsx", "sldm", "sldx", "odt", "odp", "ods", "odg", "odc", "odb", "odf", "wp", "wpd", "wps", "csv", "xml", "json", "log", "msg", "pages", "numbers", "key", "xps"],
    'Music': ["3gp", "aa", "aac", "aax", "act", "aiff", "alac", "amr", "ape", "au", "awb", "dct", "dss", "dvf", "flac", "gsm", "iklax", "ivs", "m4a", "m4b", "m4p", "mmf", "mp3", "mpc", "msv", "nmf", "nsf", "ogg", "oga", "mogg", "opus", "ra", "rm", "raw", "rf64", "sln", "tta", "voc", "vox", "wav", "wma", "wv", "webm", "8svx", "cda"],
    'Presentations': ["ppt", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm", "key", "odp", "pps", "xps"],
    'Spreadsheets': ["xls", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw", "numbers", "ods"],
    'PDFs': ["pdf"],
    'Compressed Files': ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso", "dmg", "tgz", "tbz2", "txz", "zipx", "s7z", "apk", "deb", "rpm", "pkg", "sit", "sitx", "gz", "tgz", "bz2", "tbz2", "xz", "txz", "lz", "tlz", "ar", "lzh", "lzma", "lzo", "rz", "war", "ear", "jar", "sar", "rar", "alz", "ace", "z", "cpio", "7z", "rz", "cab", "wim", "swm", "dwm", "esd", "img", "fat", "ntfs", "vhd", "mbr", "squashfs", "cramfs", "vmdk", "vdi", "dmg", "iso", "udf", "ecryptfs", "gpg", "aes"],
    'Code Files': ["html", "htm", "xhtml", "shtml", "xml", "css", "js", "php", "php4", "php3", "phtml", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "asp", "aspx", "ascx", "jsp", "jspx", "cshtml", "vbhtml", "htaccess", "htpasswd", "conf", "htgroups", "htgroups", "ini", "fla", "swf", "xml", "json", "c", "cpp", "cxx", "h", "hpp", "hxx", "cc", "hh", "ino", "cs", "java", "jar", "coffee", "tpl", "less", "scss", "sql", "md", "c", "h", "asm", "s", "ms", "es", "fs", "fsx", "fsi", "rs", "rlib", "d", "erl", "hrl", "ex", "exs", "go", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "php", "php4", "php3", "phtml", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "asp", "aspx", "ascx", "jsp", "jspx", "cshtml", "vbhtml", "htaccess", "htpasswd", "conf", "htgroups", "htgroups", "ini", "fla", "swf", "xml", "json", "c", "cpp", "cxx", "h", "hpp", "hxx", "cc", "hh", "ino", "cs", "java", "jar", "coffee", "tpl", "less", "scss", "sql", "md", "c", "h", "asm", "s", "ms", "es", "fs", "fsx", "fsi", "rs", "rlib", "d", "erl", "hrl", "ex", "exs", "go", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "php", "php4", "php3", "phtml", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "asp", "aspx", "ascx", "jsp", "jspx", "cshtml", "vbhtml", "htaccess", "htpasswd", "conf", "htgroups", "htgroups", "ini", "fla", "swf", "xml", "json", "c", "cpp", "cxx", "h", "hpp", "hxx", "cc", "hh", "ino", "cs", "java", "jar", "coffee", "tpl", "less", "scss", "sql", "md", "c", "h", "asm", "s", "ms", "es", "fs", "fsx", "fsi", "rs", "rlib", "d", "erl", "hrl", "ex", "exs", "go", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "php", "php4", "php3", "phtml", "py", "pyc", "pyo", "pyd", "pyw", "pyz", "pywz", "pyzw", "cgi", "pl", "asp", "aspx", "ascx", "jsp", "jspx", "cshtml", "vbhtml", "htaccess", "htpasswd", "conf", "htgroups", "htgroups", "ini", "fla", "swf", "xml", "json", "c", "cpp", "cxx", "h", "hpp", "hxx", "cc", "hh", "ino", "cs", "java", "jar", "coffee", "tpl", "less", "scss", "sql", "md", "c", "h", "asm"],
    'Executables': ["exe", "msi", "bin", "command", "sh", "bat", "apk", "app", "gadget", "jar", "wsf"],
    'Others': []
  }

  const counts: { [key: string]: number } = {}
  let totalCount = 0;

    for (const file of files) {
        if (file.metadata) {
            let extension = file.metadata.type.split('/').pop()?.toLowerCase() || '';
            if (!extension) {
                const fileNameParts = file.metadata.name.split('.');
                extension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() || '' : '';
            }
            let found = false;
            for (const typeName in types) {
                if (types[typeName].includes(extension)) {
                    counts[typeName] = (counts[typeName] || 0) + 1;
                    totalCount += 1;
                    found = true;
                    break;
                }
            }
            if (!found) {
              counts['Others'] = (counts['Others'] ||0) + 1;
              totalCount += 1;
            }
        }
    }

    const data: PieData[] = [];
    for (const typeName in counts) {
        data.push({
            name: typeName,
            value: (counts[typeName] / totalCount) * 100,
        });
    }

    return data;
}

