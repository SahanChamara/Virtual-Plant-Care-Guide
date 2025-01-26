import { GoogleGenerativeAI } from "@google/generative-ai";

let startDetect = document.getElementById("startDetect");
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let resultDetection = document.getElementById("disease");

startDetect.addEventListener('click', function () {

    // Start video stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error('Error accessing webcam:', err));


});

// Load the custom model
const classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/r6BsdZohI/model.json', modelLoaded);

function modelLoaded() {
    console.log('Model Loaded!');
    classifyVideo();
}

let imageData='';
let base64Image="";

// Classify video frame
function classifyVideo() {
    classifier.classify(video, async (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        resultDetection.innerText = `Label: ${results[0].label}, Confidence: ${results[0].confidence.toFixed(2)}`;
        console.log(resultDetection);
        console.log(results[0].label);

        if (results[0].label == "Class 3") {
            console.log("this person is Sahan Chamara");

            // capturing the detected object
            // Draw the current video frame onto the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a data URL (base64 image)
            imageData = canvas.toDataURL('image/png');
            console.log("actucal base 64",imageData);
            base64Image=imageData;
            

            // converting base 64 data url to blob object
            const blob = base64ToBlob(imageData);

            // finaly convert the detected object to image object
            const url = URL.createObjectURL(blob);
            console.log('Normal URL:', url);

            //isDetectionActive = false;

            func();

        } else {
            requestAnimationFrame(classifyVideo);
        }

    });
}


// Convert base64 to Blob
function base64ToBlob(base64, mimeType = 'image/png') {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeType });
}

// API Intregration

const genAI = new GoogleGenerativeAI("");

const func = async () => {
    console.log("my base 64 data",base64Image);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "analys this image";
    const image = {
        inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/png",
        },
    };

    const result = await model.generateContent([prompt,image]);
    // console.log(result.response.text());

    console.log(result.response.text());
    

    document.getElementById("ins1").innerHTML=`<p>${result.response.text()}</p>`
}