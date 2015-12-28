// JavaScript File
var microphone;
var audio;
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;

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
  console.log(navigator);
  if(navigator.getUserMedia){
    navigator.getUserMedia({audio: true}, function(stream) {
      audio = stream;
      microphone = context.createMediaStreamSource(stream);
      var filter = context.createBiquadFilter();
  
      // microphone -> filter -> destination.
      microphone.connect(filter);
      //filter.connect(context.destination);
      setTimeout(initMp3Player, 100);
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
	//document.getElementById('audio_box').appendChild(audio);
	microphone.muted = true;
	analyser = context.createAnalyser(); // AnalyserNode method
	canvas = document.getElementById('analyser_render');
	ctx = canvas.getContext('2d');
	// Re-route audio playback into the processing graph of the AudioContext
	microphone.connect(analyser);
	//analyser.connect(context.destination);
	frameLooper();
}

function frameLooper(){
	window.webkitRequestAnimationFrame(frameLooper);
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
}