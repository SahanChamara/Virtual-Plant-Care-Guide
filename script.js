let startDetect = document.getElementById("startDetect");
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

startDetect.addEventListener('click', function () {
    console.log("click");
    // Start video stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error('Error accessing webcam:', err));




})