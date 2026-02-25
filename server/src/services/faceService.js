const faceapi = require("@vladmandic/face-api");
const { Canvas, Image, ImageData, createCanvas, loadImage } = require("canvas");
const path = require("path");
const mongoose = require("mongoose");

// Patch face-api.js for Node.js environment
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = path.join(__dirname, "../../models");

let modelsLoaded = false;
let descriptorStore = []; // In-memory cache

// --- Queue System for Scans (Selfies) ---
const scanQueue = [];
let activeScans = 0;
const MAX_PARALLEL_SCANS = 4;

/**
 * Loads the face-api.js models into memory.
 */
const loadModels = async () => {
    if (modelsLoaded) return;
    try {
        console.log("[FaceService] Loading models...");
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
            faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
            faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH)
        ]);
        modelsLoaded = true;
        console.log("[FaceService] Models loaded.");
    } catch (error) {
        console.error("[FaceService] Error loading models:", error.message);
        throw error;
    }
};

/**
 * Initial Loader: Loads all descriptors from DB into memory.
 */
const initFaceService = async () => {
    try {
        await loadModels();
        const ImageModel = require("../models/Image");
        console.log("[FaceService] Filling cache from MongoDB...");

        const images = await ImageModel.find({
            "metadata.detectedFaces.0": { $exists: true },
            status: "ready"
        }).select("url metadata.detectedFaces event");

        descriptorStore = [];
        images.forEach(img => {
            img.metadata.detectedFaces.forEach(face => {
                if (face.descriptor && Array.isArray(face.descriptor)) {
                    descriptorStore.push({
                        descriptor: new Float32Array(face.descriptor),
                        metadata: {
                            url: img.url,
                            eventId: img.event,
                            faceRectangle: face.faceRectangle
                        }
                    });
                }
            });
        });

        console.log(`[FaceService] Cache ready: ${descriptorStore.length} descriptors.`);
        return { success: true, count: descriptorStore.length };
    } catch (error) {
        console.error("[FaceService] Init Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Resize image to max 600px for scans.
 */
const resizeImage = async (buffer) => {
    try {
        const img = await loadImage(buffer);
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
                height = (height / width) * MAX_DIM;
                width = MAX_DIM;
            } else {
                width = (width / height) * MAX_DIM;
                height = MAX_DIM;
            }
        }

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toBuffer("image/jpeg");
    } catch (e) {
        return buffer;
    }
};

/**
 * [SCANS] Queued & Resized - For high performance under load.
 */
const enqueueScan = (imageBuffer) => {
    return new Promise((resolve, reject) => {
        scanQueue.push({ imageBuffer, resolve, reject });
        processScanQueue();
    });
};

const processScanQueue = async () => {
    if (activeScans >= MAX_PARALLEL_SCANS || scanQueue.length === 0) return;

    const { imageBuffer, resolve, reject } = scanQueue.shift();
    activeScans++;

    try {
        await loadModels();
        const resizedBuffer = await resizeImage(imageBuffer);
        const img = new Image();
        img.src = resizedBuffer;

        const detection = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            resolve(null);
        } else {
            resolve({
                descriptor: Array.from(detection.descriptor),
                faceRectangle: {
                    top: detection.detection.box.top,
                    left: detection.detection.box.left,
                    width: detection.detection.box.width,
                    height: detection.detection.box.height
                }
            });
        }
    } catch (error) {
        reject(error);
    } finally {
        activeScans--;
        processScanQueue();
    }
};

/**
 * [UPLOADS] Non-Queued, Original Quality - For background indexing.
 */
const extractAllFacesFromBuffer = async (imageBuffer) => {
    try {
        await loadModels();
        const img = new Image();
        img.src = imageBuffer;

        const detections = await faceapi.detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        return detections.map(d => ({
            descriptor: Array.from(d.descriptor),
            faceRectangle: {
                top: d.detection.box.top,
                left: d.detection.box.left,
                width: d.detection.box.width,
                height: d.detection.box.height
            }
        }));
    } catch (error) {
        console.error("[FaceService] Upload Extraction Error:", error.message);
        throw error;
    }
};

/**
 * Fast in-memory matching using Euclidean distance.
 */
const findMatchesInMemory = (targetDescriptor, threshold = 0.5) => {
    if (!targetDescriptor || descriptorStore.length === 0) return [];

    const tD = new Float32Array(targetDescriptor);
    const matches = [];

    for (const item of descriptorStore) {
        const distance = faceapi.euclideanDistance(tD, item.descriptor);
        if (distance < threshold) {
            matches.push({
                ...item.metadata,
                similarity: parseFloat((1 - distance).toFixed(4))
            });
        }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
};

const addDescriptorToCache = (descriptor, metadata) => {
    descriptorStore.push({
        descriptor: new Float32Array(descriptor),
        metadata
    });
};

const getServiceStatus = () => {
    return {
        modelsLoaded,
        descriptorCount: descriptorStore.length,
        activeScans,
        queueLength: scanQueue.length,
        provider: "Node.js Optimized V2"
    };
};

module.exports = {
    initFaceService,
    extractFaceDescriptor: enqueueScan,
    extractAllFaces: extractAllFacesFromBuffer,
    findMatchesInMemory,
    addDescriptorToCache,
    getServiceStatus,
    // Compatibility wrappers
    detectAndExtractDescriptors: async (buf) => {
        const res = await enqueueScan(buf);
        return res ? [res] : [];
    },
    compareFaces: (d1, d2) => {
        const dist = faceapi.euclideanDistance(new Float32Array(d1), new Float32Array(d2));
        return 1 - dist;
    }
};
