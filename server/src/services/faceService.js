const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

// Load env if not already loaded (useful for standalone scripts)
dotenv.config({ path: path.join(__dirname, "../../.env") });

const FACE_SERVICE_URL = "https://pixland-face-service-bffshxd7ccg8d3dg.centralindia-01.azurewebsites.net";
const MATCH_THRESHOLD = 0.55;

/**
 * Extract face descriptors (embeddings) using the Python Microservice.
 * @param {Buffer} imageBuffer - Raw image data
 * @returns {Promise<Array>} - Array of face objects { descriptor: [...], faceRectangle: {...} }
 */
const extractFaceDescriptors = async (imageBuffer) => {
    try {
        console.log(`[FaceService] Extracting descriptors from Python service: ${FACE_SERVICE_URL}/extract`);

        // Create FormData for multipart upload
        const FormData = require("form-data");
        const form = new FormData();
        form.append("image", imageBuffer, { filename: "upload.jpg", contentType: "image/jpeg" });

        const response = await axios.post(`${FACE_SERVICE_URL}/extract`, form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 30000, // 30s timeout for DeepFace
        });

        if (response.data && response.data.embedding) {
            return [{
                descriptor: response.data.embedding,
                faceRectangle: {
                    top: response.data.face_area.y,
                    left: response.data.face_area.x,
                    width: response.data.face_area.w,
                    height: response.data.face_area.h
                }
            }];
        }

        return [];
    } catch (error) {
        console.error("[FaceService] Extraction Error:", error.response?.data?.message || error.message);
        if (error.response?.data?.error === "NO_FACE_DETECTED") {
            throw { code: "NO_FACE_DETECTED", message: "Face detection failed" };
        }
        throw new Error(`Face Service unavailable: ${error.message}`);
    }
};

/**
 * Compare two faces using the Python Microservice.
 * @param {Array} embedding1 
 * @param {Array} embedding2 
 * @returns {Promise<number>} - Confidence score (0 to 1)
 */
const compareFaces = async (embedding1, embedding2) => {
    try {
        const response = await axios.post(`${FACE_SERVICE_URL}/compare`, {
            embedding1,
            embedding2
        }, { timeout: 10000 });

        return response.data.similarity;
    } catch (error) {
        console.error("[FaceService] Comparison Error:", error.message);
        return 0;
    }
};

/**
 * Match a face against a list of candidates.
 * Replaces Azure findSimilarInList logic.
 */
const findSimilarInList = async (targetEmbedding, candidates) => {
    // candidates should be array of { id, descriptor }
    // We can do this on our end to save API calls or call /compare in a loop (not ideal)
    // However, for small batches, we can do cosine similarity in JS.

    const results = [];
    for (const cand of candidates) {
        if (!cand.descriptor) continue;
        const sim = await compareFaces(targetEmbedding, cand.descriptor);
        if (sim >= MATCH_THRESHOLD) {
            results.push({
                persistedFaceId: cand.id,
                confidence: sim
            });
        }
    }
    return results.sort((a, b) => b.confidence - a.confidence);
};

const checkFaceServiceHealth = async () => {
    try {
        const response = await axios.get(`${FACE_SERVICE_URL}/health`, { timeout: 3000 });
        return { online: true, provider: "Python (ArcFace)" };
    } catch {
        return { online: false };
    }
};

module.exports = {
    extractFaceDescriptors,
    detectAndExtractDescriptors: extractFaceDescriptors,
    compareFaces,
    findSimilarInList,
    checkFaceServiceHealth,
    // Azure specific wrappers (empty now)
    ensureFaceListExists: async () => console.log("[FaceService] Local mode: FaceList not required."),
    addFaceToList: async () => null
};
