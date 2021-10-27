// finds the video element in the html page and connects it with the javascript logic.
const video = document.getElementById("video");
let predictedAges = [];

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
			.withFaceExpressions()
			.withAgeAndGender();
		const resizedDetections = faceapi.resizeResults(detections, displaySize);
		//clears all the detections and allows for one face detection.
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

		const age = resizedDetections[0].age;
		const interpolatedAge = interpolateAgePredictions(age);
		const bottomRight = {
			x: resizedDetections[0].detection.box.bottomRight.x - 50,
			y: resizedDetections[0].detection.box.bottomRight.y,
		};

		new faceapi.draw.DrawTextField(
			[`${faceapi.utils.round(interpolatedAge, 0)} years`],
			bottomRight
		).draw(canvas);
	}, 100);
});

//this takes every 30 predicted ages and finds a median value
function interpolateAgePredictions(age) {
	predictedAges = [age].concat(predictedAges).slice(0, 30);
	const avgPredictedAge =
		predictedAges.reduce((total, a) => total + a) / predictedAges.length;
	return avgPredictedAge;
}
