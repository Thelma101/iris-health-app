import cloudinary from "../config/cloudinary";

export const uploadBuffer = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" = "image"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        }
      )
      .end(buffer);
  });
};
