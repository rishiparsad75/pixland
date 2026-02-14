const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");

const key = process.env.AZURE_FACE_KEY;
const endpoint = process.env.AZURE_FACE_ENDPOINT;

const credentials = new msRest.ApiKeyCredentials({
    inHeader: { "Ocp-Apim-Subscription-Key": key },
});

const client = new Face.FaceClient(credentials, endpoint);

const detectFaces = async (imageUrl) => {
    try {
        const detectedFaces = await client.face.detectWithUrl(imageUrl, {
            returnFaceId: true,
            returnFaceLandmarks: false,
            returnFaceAttributes: ["age", "gender", "emotion"],
            recognitionModel: "recognition_04", // Most accurate model
            detectionModel: "detection_03"
        });
        return detectedFaces;
    } catch (error) {
        console.error("Error detecting faces:", error);
        throw error;
    }
};

const createFaceList = async (faceListId) => {
    try {
        await client.faceList.create(faceListId, { name: faceListId, recognitionModel: "recognition_04" });
    } catch (error) {
        if (error.code !== "FaceListAlreadyExists") throw error;
    }
};

const addFaceToList = async (faceListId, imageUrl, userData) => {
    try {
        const result = await client.faceList.addFaceFromUrl(faceListId, imageUrl, { userData: JSON.stringify(userData) });
        return result.persistedFaceId;
    } catch (error) {
        console.error("Error adding face to list:", error);
        throw error;
    }
};

const findSimilarFaces = async (faceId, faceListId) => {
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
