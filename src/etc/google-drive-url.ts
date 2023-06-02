export function getGoogleDriveUrl(fileId: string) {
  return 'https://drive.google.com/uc?id=' + fileId;
}

export function getGoogleDriveFileID(url: string) {
  if (url.split('uc?id=').length == 0) return null;
  return url.split('uc?id=')[1];
}
