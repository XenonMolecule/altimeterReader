// JavaScript File
var microphone;
var audio;
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;
var stages = [0,0,0,0];
var beepType;
var run = false;
var beeps = [0,0,0];
var continuation = false;
var counter = 0;
var stage = 0;
var altitude = 0;
var battery = 0;
var onAlt = true;
var altDigits = [];
var batDigits = [];
var countToFinish=0;
var ableToSwitchAlttoBat = false;
var over = false;

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
  console.log("Browser Supported");
  
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var context = new AudioContext();

  navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
  if(navigator.getUserMedia){
    navigator.getUserMedia({audio: true}, function(stream) {
      audio = stream;
      microphone = context.createMediaStreamSource(stream);
      var filter = context.createBiquadFilter();
  
      // microphone -> filter -> destination.
      microphone.connect(filter);
      console.log("Access Gained")
    }, function(e) { console.log('Ouch, get some ointment for that burn, because you were denied ', e)});
  } else {
    //failed test 2
    alert("Sorry your internet browser is not currently supported");
    console.log("Unsupported Browser Test 2");
  }
} else {
  //failed test 1
  alert("Sorry, your internet browser is not currently supported");
  console.log("Unsupported Browser")
}

function initMp3Player(){
  console.log("initializing Mp3 analyzer");
	microphone.muted = true;
	analyser = context.createAnalyser(); // AnalyserNode method
	canvas = document.getElementById('analyser_render');
	ctx = canvas.getContext('2d');
	// Re-route audio playback into the processing graph of the AudioContext
	microphone.connect(analyser);
	frameLooper();
}

function frameLooper(){
	window.requestAnimationFrame(frameLooper);
	fbc_array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(fbc_array);
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	ctx.fillStyle = '#00CCFF'; // Color of the bars
	bars = 100;
	for (var i = 0; i < bars; i++) {
		bar_x = i * 3;
		bar_width = 2;
		bar_height = -(fbc_array[(i*2)] / 2);
		ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
  }
  //frequencies 85-95, amp: 50
  //frequencies 45-55 amp : >50
  //break 90, 50, 65, 98, 20 amp: >100 for some, >50 for all
  altimeterCalc();
}

function testAltimeter(){
  for(var i = 0; i < stages.length; i++){
    stages[i] = 0;
  }
  testStage(40,60,0);
  testStage(80,95,1);
  isItABreak(60,70,2);
  isItABreak(10,30,3);
  if((stages[0]==1&&stages[1]==1)){
    beepType = 1;
  } else if((stages[0]+stages[1]+stages[2]+stages[3])>=5){
    beepType = 2;
  } else {
    beepType = 0;
  }
  return beepType;
}

function testStage(min, max, stage){
  for(var i = min; i<=max; i++){
    if((-(fbc_array[(i*2)] / 2))<-50){
      stages[stage] = 1;
    } else if((-(fbc_array[((i*2)+10)]/2))<-100){
      stages[stage] = 2;
    }else if(stages[stage]==0){
      stages[stage] = 0;
    }
  }
}

function isItABreak(min,max,stage){
  for(var i = min; i <=max; i++){
    if((-(fbc_array[(i*2)]/2))<-50){
      stages[stage] = 2
    } else if(stages[stage]==0){
      stages[stage] == 0;
    }
  }
}

window.addEventListener('load',delayMp3(),false);

function delayMp3(){
  setTimeout(initMp3Player,3000);
}

function altimeterCalc(){
  if(!over){
    if(run){
      //console.log("running")
      var output = testAltimeter();
      if(output == 0){
        beeps[0]++;
        continuation = false;
      } else if(output==1){
        if(!continuation){
          counter++;
          var add = Math.round((counter/20));
          beeps[1]+=add;
          continuation = true;
          counter=0;
        } else {
          counter++;
          continuation = true;
        }
      } else {
        beeps[2]++;
      }
      if(beeps[0]>39){
        moveOn();
      }
      if(beeps[2]>20&&ableToSwitchAlttoBat){
        onAlt = false;
        beeps = [0,0,0];
      }
      if(countToFinish===5){
        done();
        terminateCheck();
      }
    } else if(testAltimeter()==2){
      run = true;
      setTimeout(enableSwitch,3000);
    }
  }
}

function moveOn(){
  //console.log("moving on")
  if(beeps[1]==10){
    beeps[1]=0;
  }
  if(onAlt){
    altDigits.push(beeps[1]);
  } else if(!onAlt){
    batDigits.push(beeps[1]);
    countToFinish++;
  }
  beeps = [0,0,0];
}

function done(){
  console.log("done");
  altitude = 0;
  battery = 0;
  for(var i = 0; i<altDigits.length;i++){
    altitude+=altDigits[i]*(10^(-(i-(altDigits.length-1))));
  }
  for(var i = 0; i<batDigits.length;i++){
    battery+=batDigits[i]*(10^(-(i-1)));
  }
  terminateCheck();
  console.log("altitude: "+altitude+" feet");
  console.log("battery: "+battery+" volts");
}

function enableSwitch(){
  ableToSwitchAlttoBat = true;
}

function terminateCheck(){
  over = true
}