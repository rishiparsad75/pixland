const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const path = require("path");
const fs = require("fs");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(__dirname, "../../models");
let modelsLoaded = false;

/**
 * Load models if not already loaded
 */
const loadModels = async () => {
    if (modelsLoaded) return;

    try {
        console.log("[FaceAPI] Loading models from:", MODEL_PATH);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
        modelsLoaded = true;
        console.log("[FaceAPI] Models loaded successfully");
    } catch (error) {
        console.error("[FaceAPI] Error loading models:", error);
        throw new Error("Face models not found. Please ensure weight files are in /server/models");
    }
};

/**
 * Detect faces and extract descriptors from an image URL or buffer
 */
const detectAndExtractDescriptors = async (imageSource) => {
    await loadModels();

    try {
        let img;
        if (typeof imageSource === 'string') {
            img = await canvas.loadImage(imageSource);
        } else {
            img = await canvas.loadImage(imageSource);
        }

        const detections = await faceapi
            .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 }))
            .withFaceLandmarks()
            .withFaceDescriptors();


        return detections.map(d => ({
            descriptor: Array.from(d.descriptor),
            faceRectangle: {
                top: d.detection.box.y,
                left: d.detection.box.x,
                width: d.detection.box.width,
                height: d.detection.box.height
            }
        }));
    } catch (error) {
        console.error("[FaceAPI] Detection failed:", error);
        throw error;
    }
};

/**
 * Legacy support for identify route (detect only)
 */
const detectFaces = async (imageUrl) => {
    const results = await detectAndExtractDescriptors(imageUrl);
    return results.map(r => ({
        faceId: Math.random().toString(36).substr(2, 9), // Mock faceId for legacy compatibility
        faceRectangle: r.faceRectangle,
        descriptor: r.descriptor
    }));
};

/**
 * Compare two face descriptors using Euclidean Distance
 * face-api.js descriptors are L2-normalized and designed for Euclidean comparison.
 * Distance < 0.5 = strong match, < 0.6 = good match, > 0.6 = likely different person
 * Returns DISTANCE (lower is better, the opposite of cosine similarity)
 */
const compareFaces = (desc1, desc2) => {
    if (!desc1 || !desc2) return Infinity;

    const v1 = new Float32Array(desc1);
    const v2 = new Float32Array(desc2);

    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
        const diff = v1[i] - v2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum); // Euclidean distance
};

module.exports = {
    detectAndExtractDescriptors,
    detectFaces,
    compareFaces,
    loadModels
};

