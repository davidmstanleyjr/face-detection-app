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

//video overlays for face detection
video.addEventListener("playing", () => {
	const canvas = faceapi.createCanvasFromMedia(video);
	document.body.append(canvas);

	const displaySize = { width: video.width, height: video.height };
	faceapi.matchDimensions(canvas, displaySize);

	//every 100 milliseconds the app awaits the faceapi and it detects all of the faces.
	//then it resizes the detections to the canvas and then draws them on the canvas
	setInterval(async () => {
		const detections = await //detects landmarks
		faceapi
			.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions();
		const resizedDetections = faceapi.resizeResults(detections, displaySize);
		//clears all the detections and allows for one face detection.
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
	}, 100);
});
