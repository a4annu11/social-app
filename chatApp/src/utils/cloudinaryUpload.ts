const CLOUD_NAME = 'dtdwbxpwz';
const UPLOAD_PRESET = 'socialapp';

export const uploadToCloudinary = async (file: any) => {
  const data = new FormData();

  data.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.fileName || 'upload',
  });

  data.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: data,
    },
  );

  const json = await res.json();

  return {
    url: json.secure_url,
    public_id: json.public_id,
    type: json.resource_type,
  };
};
