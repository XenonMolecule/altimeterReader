// JavaScript File
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
      var microphone = context.createMediaStreamSource(stream);
      var filter = context.createBiquadFilter();
  
      // microphone -> filter -> destination.
      microphone.connect(filter);
      filter.connect(context.destination);
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
