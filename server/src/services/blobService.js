const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER;

if (!connectionString) {
  throw new Error("Azure Storage connection string missing in .env");
}

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerClient =
  blobServiceClient.getContainerClient(containerName);

async function uploadToBlob(file) {
  const blobName = `${uuidv4()}-${file.originalname}`;

  const blockBlobClient =
    containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer);

  return blockBlobClient.url;
}

module.exports = { uploadToBlob };
