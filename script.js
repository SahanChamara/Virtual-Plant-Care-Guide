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

document.getElementById("stopDetect").addEventListener('click', () => {
    return
})

// Load the custom model
const classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/8GYtlPoCt/model.json', modelLoaded);

function modelLoaded() {
    console.log('Model Loaded!');
    classifyVideo();
}

let imageData = '';
let base64Image = "";
let diseaseName = "";

// Classify video frame
function classifyVideo() {
    classifier.classify(video, async (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        resultDetection.innerText = `${results[0].label}, Confidence: ${results[0].confidence.toFixed(2)}`;
        console.log(resultDetection);
        console.log(results[0].label);

        if (!results || results.length === 0) {
            console.log("no classification found.");
            return;
        }

        let detectedLabel = results[0].label;
        let diseaseList = ["Anthracnose", "Black Spot", "mosaic virus", "Peper Bell Bacterial Spot", "Blight", "botrytis cinerea", "fire blight", "Healthy", "leaf curl", "Powdery Mildew", "Rust"];

        if (diseaseList.includes(detectedLabel) && results[0].confidence.toFixed(2) > 0.90) {
            console.log("this is a ", results[0].label, "Disease");
            diseaseName = results[0].label + " Plant Disease";
            console.log("disease name variable", diseaseName);

            // capturing the detected object
            // Draw the current video frame onto the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a data URL (base64 image)
            imageData = canvas.toDataURL('image/png');
            base64Image = imageData;


            // converting base 64 data url to blob object
            const blob = base64ToBlob(imageData);

            // finaly convert the detected object to image object
            const url = URL.createObjectURL(blob);

            setTimeout(() => {
                func();
            }, 5000);

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
var md = window.markdownit();

const genAI = new GoogleGenerativeAI("");
let prompt;

const func = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    if (diseaseName.startsWith("Healthy")) {
        prompt = "Can you Recommend a more tips to protect this Healthy plant?";
    } else {
        prompt = diseaseName + " This is a plant Disease. analys this plant disease and give me how i treatment to it step by step";

    }

    const image = {
        inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/png",
        },
    };

    const result = await model.generateContent([prompt, image]);

    console.log(result.response.text());

    let finalresult = md.render(result.response.text());

    document.getElementById("treatment").innerHTML = `<p>${finalresult}</p>`


}
