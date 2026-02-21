const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER;

if (!connectionString) {
  console.warn("[BlobService] WARNING: Azure Storage connection string missing. Blob operations will fail.");
}

const blobServiceClient = connectionString ? BlobServiceClient.fromConnectionString(connectionString) : null;
const containerClient = connectionString ? blobServiceClient.getContainerClient(containerName) : null;


// Extract account name and key from connection string for SAS generation
function getStorageCredentials() {
  const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

  if (!accountNameMatch || !accountKeyMatch) {
    throw new Error("Could not extract account credentials from connection string");
  }

  return {
    accountName: accountNameMatch[1],
    accountKey: accountKeyMatch[1]
  };
}

async function uploadToBlob(file) {
  const blobName = `${uuidv4()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype || 'application/octet-stream'
    }
  });

  // Generate SAS URL for public access
  const sasUrl = generateSASUrl(blobName);
  console.log(`[BlobService] Uploaded: ${blobName}, URL: ${sasUrl}`);

  return sasUrl;
}

function generateSASUrl(blobName) {
  try {
    const { accountName, accountKey } = getStorageCredentials();
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // SAS token valid for 10 years (adjust as needed)
    const expiresOn = new Date();
    expiresOn.setFullYear(expiresOn.getFullYear() + 10);

    const sasToken = generateBlobSASQueryParameters({
      containerName: containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse("r"), // Read-only permission
      expiresOn: expiresOn,
    }, sharedKeyCredential).toString();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return `${blockBlobClient.url}?${sasToken}`;
  } catch (error) {
    console.error("[BlobService] Error generating SAS URL:", error);
    // Fallback to regular URL (will work if container is public)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }
}

async function deleteFromBlob(blobName) {
  if (!blobName) return;

  // Extract blob name from URL if full URL is provided
  let actualBlobName = blobName;
  if (blobName.includes('blob.core.windows.net')) {
    const urlParts = blobName.split('/');
    actualBlobName = urlParts[urlParts.length - 1].split('?')[0]; // Remove SAS token if present
  }

  const blockBlobClient = containerClient.getBlockBlobClient(actualBlobName);
  await blockBlobClient.deleteIfExists();
  console.log(`[BlobService] Deleted: ${actualBlobName}`);
}

module.exports = { uploadToBlob, deleteFromBlob };
