// Quick fix to make Azure Blob Storage container public
// This will allow existing images to display without SAS tokens
// Run with: node quickfix-public-container.js

const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

async function makeContainerPublic() {
    try {
        console.log("🔧 Making Azure container public...");

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );

        const containerClient = blobServiceClient.getContainerClient(
            process.env.AZURE_STORAGE_CONTAINER
        );

        // Set container access policy to "blob" (anonymous read access for blobs)
        await containerClient.setAccessPolicy("blob");

        console.log("✅ Container is now public!");
        console.log("📸 All existing images should now be visible in the gallery.");
        console.log("\nNote: New images will still use SAS tokens for better security.");
    } catch (error) {
        console.error("❌ Error making container public:", error.message);
        console.log("\nAlternative: Set container to public in Azure Portal:");
        console.log("1. Go to Storage Account → Containers");
        console.log("2. Select your container");
        console.log("3. Change 'Public access level' to 'Blob'");
    }
}

makeContainerPublic();
