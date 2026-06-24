import { boot } from 'quasar/wrappers';
import * as faceapi from 'face-api.js';

export default boot(async () => {
  // Models are served from /models in the public folder
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
  console.log('face-api.js models loaded');
});
