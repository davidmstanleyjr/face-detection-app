// finds the video element in the html page and connects it with the javascript logic.
const video = document.getElementById("video");

//models from the api. Video starts after these models load.
Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri("models"),
	faceapi.nets.faceLandmark68Net.loadFromUri("models"),
	faceapi.nets.faceRecognitionNet.loadFromUri("models"),
	faceapi.nets.faceExpressionNet.loadFromUri("models"),
	faceapi.nets.ageGenderNet.loadFromUri("models"),
]).then(startVideo);

//starts video. Streams webcam into the video element in the html page.
function startVideo() {
	navigator.getUserMedia(
		{ video: {} },
		(stream) => (video.srcObject = stream),
		(err) => console.error(err)
	);
}
