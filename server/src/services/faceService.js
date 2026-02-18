const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");

const key = process.env.AZURE_FACE_KEY;
const endpoint = process.env.AZURE_FACE_ENDPOINT;
const useMock = process.env.USE_FACE_MOCK === "true";

const credentials = new msRest.ApiKeyCredentials({
    inHeader: { "Ocp-Apim-Subscription-Key": key },
});

const client = new Face.FaceClient(credentials, endpoint);

/**
 * Mock data for development when Azure Face API is gated or unavailable
 */
const mockFace = (id) => ({
    faceId: id || "mock-face-id-" + Math.random().toString(36).substr(2, 9),
    faceRectangle: { top: 10, left: 10, width: 100, height: 100 }
});

const detectFaces = async (imageUrl) => {
    if (useMock) {
        console.log(" [MOCK] Detecting faces for:", imageUrl);
        return [mockFace()];
    }

    try {
        const detectedFaces = await client.face.detectWithUrl(imageUrl, {
            returnFaceId: true,
            returnFaceLandmarks: false,
            // Deprecated attributes (age, gender, emotion) removed due to Azure gating/Responsible AI policy
            recognitionModel: "recognition_04",
            detectionModel: "detection_03"
        });
        return detectedFaces;
    } catch (error) {
        console.error("Error detecting faces:", error);
        throw error;
    }
};

const createFaceList = async (faceListId) => {
    if (useMock) {
        console.log(" [MOCK] Creating face list:", faceListId);
        return;
    }

    try {
        await client.faceList.create(faceListId, faceListId, { recognitionModel: "recognition_04" });
    } catch (error) {
        if (error.code !== "FaceListAlreadyExists") throw error;
    }
};

const addFaceToList = async (faceListId, imageUrl, userData) => {
    if (useMock) {
        const mockPersistedId = "mock-persisted-" + Math.random().toString(36).substr(2, 9);
        console.log(" [MOCK] Adding face to list:", faceListId, "ID:", mockPersistedId);
        return mockPersistedId;
    }

    try {
        const result = await client.faceList.addFaceFromUrl(faceListId, imageUrl, { userData: JSON.stringify(userData) });
        return result.persistedFaceId;
    } catch (error) {
        console.error("Error adding face to list:", error);
        throw error;
    }
};

const findSimilarFaces = async (faceId, faceListId) => {
    if (useMock) {
        console.log(" [MOCK] Finding similar faces for:", faceId);
        return [{
            persistedFaceId: "mock-persisted-match",
            confidence: 0.95
        }];
    }

    try {
        const similarFaces = await client.face.findSimilar(faceId, {
            faceListId: faceListId,
            maxNumOfCandidatesReturned: 50,
            mode: "matchFace"
        });
        return similarFaces;
    } catch (error) {
        console.error("Error finding similar faces:", error);
        throw error;
    }
};

module.exports = { detectFaces, createFaceList, addFaceToList, findSimilarFaces };

