/*
Send a face to RunwayML Face-Parser, receive back a semantic mapm send it to SPADE-Face, receive face, repeat
Before starting, make sure Face-Parser and SPADE-FACE models are both running, and that the model paths are correct (see below)
by Matty Mariansky
*/

//model paths, make sure they match inside Runway
//if they are both the same in Runway, start them, and one will update
const faceParserPath = "http://localhost:8000/query";
const spadeFacePath = "http://localhost:8001/query";

//set to false it you want Runway to save the images you produce (you can then also set it to save video)
const saveImages = true;

let styleFace;
let realFace, realFaceImg;
let segmentation, segmentationImg;

let weHaveFace = false;
let weHaveSegmentation = false;
let counter = 0;
let imageCount = 800; //how many images to produce

function preload() {
  //load a face file to start with, use it for the style face too
  //assuming this is a 512x512px size
  realFace = loadImage("assets/dudea.png");
}

function setup() {
  canvas = createCanvas(512, 512);
  image(realFace, 0, 0);
  styleFace = get();
  styleFace.loadPixels();
  background(0, 0, 0);
  generateSegments();
}

function draw() {
  if (weHaveFace) {
    image(realFaceImg, 0, 0);
    realFace = get(); //convert element to img
    if (saveImages) {
      realFace.save("dudea" + nf(counter, 4, 0), "png");
    }
    weHaveFace = false;
    if (counter < imageCount) {
      generateSegments();
    } else {
      noLoop();
    }
  } else if (weHaveSegmentation) {
    image(segmentationImg, 0, 0);
    segmentation = get(); //convert element to img
    if (saveImages) {
      //segmentation.save("segment" + nf(counter, 4, 0), "png");
    }
    weHaveSegmentation = false;
    generateFace();
  }
}

// send realface image to Runway Face-Parser to segment it
function generateSegments() {
  realFace.loadPixels();
  let imageString = realFace.canvas.toDataURL("image/png");
  const data = {
    image: imageString,
  };
  httpPost(faceParserPath, "json", data, gotSegments, gotError);
}

// callback when we have the segmented face back
function gotSegments(data) {
  counter++;
  weHaveSegmentation = true;
  weHaveFace = false;
  console.log("Segments");
  console.log(data);
  segmentationImg = createImg(data.parsed_face);
  segmentationImg.hide();
}

// send the segments to SPADE-FACE to get a real face back
function generateFace() {
  segmentation.loadPixels();
  let imageString1 = segmentation.canvas.toDataURL("image/png");
  let imageString2 = styleFace.canvas.toDataURL("image/png");
  const data = {
    semantic_map: imageString1,
    style_image: imageString2,
  };
  httpPost(spadeFacePath, "json", data, gotFace, gotError);
}

// callback when we have a real face back
function gotFace(data) {
  weHaveSegmentation = false;
  weHaveFace = true;
  console.log("Face");
  console.log(data);
  realFaceImg = createImg(data.output);
  realFaceImg.hide();
}

// callback if there is an error
function gotError(error) {
  console.error(error);
}
