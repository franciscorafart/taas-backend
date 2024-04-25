import s3Client from "../config/s3";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const retrieveFileUrlS3 = async (filename: string, expiry?: number) => {
  const getParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
    Expires: expiry || 60, // seconds
  };

  const command = new GetObjectCommand(getParams);
  const res = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return res;
};
