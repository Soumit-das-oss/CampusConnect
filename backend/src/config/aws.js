const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 object key (file path)
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToS3(buffer, key, contentType = 'application/pdf') {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: 'inline', // Allow viewing in browser
    },
  });

  await upload.done();
  
  // Generate a pre-signed URL that works for 7 days
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 604800 }); // 7 days
  return signedUrl;
}

/**
 * Delete a file from S3
 * @param {string} url - Full S3 URL of the file
 * @returns {Promise<void>}
 */
async function deleteFromS3(url) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  // Extract the key from the URL
  // URL format: https://bucket-name.s3.region.amazonaws.com/key
  const urlParts = url.split('.amazonaws.com/');
  if (urlParts.length < 2) {
    throw new Error('Invalid S3 URL format');
  }
  
  const key = decodeURIComponent(urlParts[1]);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

module.exports = {
  s3Client,
  uploadToS3,
  deleteFromS3,
};
