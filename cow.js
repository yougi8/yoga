let video;
let poseNet;
let pose;
let skeleton;
let thirtysecs;
let posesArray = ['cow'];
let state = 'waiting';
var imgArray = new Array();

var poseImage;

let yogi;
let poseLabel;

var targetLabel;
var errorCounter;
var iterationCounter;
var poseCounter;
var target;

var timeLeft;

function setup() {
  var canvas = createCanvas(640, 480);
  canvas.position(130, 210);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

 
  
  poseCounter = 0;
  targetLabel = 1;// targetLabel 설정 1은 mountain 2는 tree 3은 dog ... 
  target = posesArray[poseCounter];
  //pose 이름 설정 
  document.getElementById("poseName").textContent = target;
  timeLeft = 10;
  document.getElementById("time").textContent = "00:" + timeLeft;
  errorCounter = 0;
  iterationCounter = 0;
  //image 넣어주기 
   
  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  
  yogi = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  yogi.load(modelInfo, yogiLoaded);
}
  
function yogiLoaded(){
  console.log("Model ready!");
  classifyPose();
}

function classifyReady() {
    state = 'waiting'
    if (pose) {
      let nose = pose.keypoints[0].score;
      let ankleR = pose.keypoints[14].score;
      state = 'detect'
      if ((nose > 0.5) && (ankleR > 0.5)) {
        //console.log('detect');
        state = 'detect';
      } else {
        state = 'waiting';
        //console.log('waiting');
      }
    }
  }

function classifyPose(){
    classifyReady();
    if (pose && (state == 'detect')) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    yogi.classify(inputs, gotResult);
  } else {
    console.log("Pose not found");
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
   
  if (results[0].confidence > 0.70) {
    console.log("Confidence");
    //사용자의 포즈와 targetlabel 1 =mountain 이 일치하는 경우 
    if (results[0].label == "cow"){
      console.log(targetLabel);
      iterationCounter = iterationCounter + 1;
      //반복횟수 하나씩 늘리기 

      console.log(iterationCounter)
      //10초동안 포즈 지속하면 
      if (iterationCounter == 11) {
        console.log("30!")
        iterationCounter = 0;
        //다음으로 넘어가 
        console.log('pose success');;}
      else{
        console.log("doin this")
        ////1초씩 줄이기 
        timeLeft = timeLeft - 1;
        //시간이 10보다 작은면 
        if (timeLeft < 10){
          document.getElementById("time").textContent = "00:0" + timeLeft;
        } //시간이 10보다 크면  
        else{
        document.getElementById("time").textContent = "00:" + timeLeft;}
        setTimeout(classifyPose, 1000);}}
    else{
      //사용자의 포즈와 targetlabel =mountain이 일치하지 않은경우 
      errorCounter = errorCounter + 1;
      console.log("error");
      if (errorCounter >= 4){
        console.log("four errors");
        iterationCounter = 0;
        timeLeft = 10;
        if (timeLeft < 10){
          document.getElementById("time").textContent = "00:0" + timeLeft;
        }else{
        document.getElementById("time").textContent = "00:" + timeLeft;}
        errorCounter = 0;
        setTimeout(classifyPose, 100);
      }else{
        setTimeout(classifyPose, 100);
      }}}
  // confidence 넘지 못했을떄 
  else{
    console.log("whatwe really dont want")
    setTimeout(classifyPose, 100);
}}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  document.getElementById("rectangle").style.display = "none";
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1,1);
  image(video, 0, 0, video.width, video.height);
  
  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(244, 194, 194);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();
  fill(255,204,0);
  noStroke();
  textSize(60);
  textAlign(CENTER, CENTER);
  text(state, width * 0.85, height * 0.1);
}

// function nextPose(){
//   //pose 완료했을떄 
//   if (poseCounter >= 5) {
//     console.log("Well done, you have learnt all poses!");
//     document.getElementById("finish").textContent = "Amazing!";
//     document.getElementById("welldone").textContent = "All poses done.";
//     document.getElementById("sparkles").style.display = 'block';
//   }//pose 진행중 
//   else{
//     console.log("Well done, you all poses!");
//     //var stars = document.getElementById("starsid");
//     //stars.classList.add("stars.animated");
//     errorCounter = 0;
//     iterationCounter = 0;
//     //한개씩 늘려서 다음포즈 진행 
//     poseCounter = poseCounter + 1;
//     targetLabel = poseCounter + 1;
//     console.log("next pose target label" + targetLabel)
//     target = posesArray[poseCounter];
//     document.getElementById("poseName").textContent = target;
//     document.getElementById("welldone").textContent = "Well done, next pose!";
//     document.getElementById("sparkles").style.display = 'block';
//     document.getElementById("poseImg").src = imgArray[poseCounter].src;
//     console.log("classifying again");
//     timeLeft = 10;
//     document.getElementById("time").textContent = "00:" + timeLeft;
//     setTimeout(classifyPose, 4000)}
// }
