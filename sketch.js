/*
Send a face to RunwayML Face-Parser, receive back a semantic mapm send it to SPADE-Face, receive face, repeat
by Matty Mariansky
*/

let realFace;
let segmentation;
//model paths, make sure they match inside Runway
const faceParserPath = "http://localhost:8000/query";

function preload() {
  realFace = loadImage("assets/dudea.png");
}

function setup() {
  canvas = createCanvas(512, 512);
  background(0, 0, 0);
  image(realFace, 0, 0);
  generateSegments();
}

function draw() {
  /*image(segmentation, 0, 0);
  if (generatedImage) {
    image(generatedImage, 0, 360, 640, 360);
  }*/
}

function generateSegments() {
  // send realface image to Runway to segment it
  segmentation.loadPixels();
  let imageString = segmentation.canvas.toDataURL("image/png");
  const path = "http://localhost:8000/query";
  const data = {
    semantic_map: imageString,
  };
  httpPost(path, "json", data, gotImage, gotError);
}

// callback when the model returns data
function gotImage(data) {
  // get the image according to SPADE-Landscape's Output Specification
  generatedImage = createImg(data.output);
  generatedImage.hide();
  generateImage();
}

// callback if there is an error
function gotError(error) {
  console.error(error);
}
