window.onload = function(){
	var worker = new Worker("worker.js");

    worker.addEventListener('message', function(e) {
    	console.log("Done");
	  	output.src = e.data;
	}, false);

	var canvas = document.getElementById("travolta");
	var context = canvas.getContext('2d');

	var invisibleCanvas = document.createElement('canvas');
	var tempContext = invisibleCanvas.getContext("2d");

	var imageInput = document.getElementById("image");

	var video = document.getElementById("travoltaGreenScreen");
	var $resizable = $("#resizable");

	var output = document.getElementById("output");
	
	var image = new Image();
	window.imageExists = false;

	var greenHex = 0x1CCF01;
	var targetR = (greenHex >> 16) & 0xff;
	var targetG = (greenHex >> 8) & 0xff;
	var targetB = greenHex & 0xff;
	var tolerance = 175;
	var encoder;

	$resizable.resizable({
		aspectRatio: 1.240484429065744,
	}).draggable();

	imageInput.onchange = function(){
		image.onload = function() { imageExists = true; canvas.width = image.width; canvas.height = image.height; };
  		image.onerror = function() { imageExists = false; };
  		if(imageInput.files[0] != undefined){
			image.src = URL.createObjectURL(imageInput.files[0]);
		}
	}

	var interval = setInterval(chroma, 1000/29.97);

	function chroma(){
		canvas.width = canvas.width;
		if(imageExists){
			context.drawImage(image, 0, 0);
		}
		invisibleCanvas.width = $resizable.width();
		invisibleCanvas.height = $resizable.height();
		tempContext.drawImage(video, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
    	var frame = tempContext.getImageData(0, 0, invisibleCanvas.width, invisibleCanvas.height);
		var l = frame.data.length / 4;

		for (var i = 0; i < l; i++) {
		  var r = frame.data[i * 4 + 0];
		  var g = frame.data[i * 4 + 1];
		  var b = frame.data[i * 4 + 2];

		  if (Math.abs(r - targetR) / 2 + Math.abs(g - targetG) + Math.abs(b - targetB) / 2 < tolerance){
		  	frame.data[i * 4 + 0] = 0;
		  	frame.data[i * 4 + 1] = 0;
		  	frame.data[i * 4 + 2] = 0;
		  	frame.data[i * 4 + 3] = targetG - g;
		  }
		}

		tempContext.putImageData(frame, 0, 0);
    	context.drawImage(invisibleCanvas, $resizable.css("left").replace("px", ""), $resizable.css("top").replace("px", ""));
    }

    window.generateGif = function(){
    	clearInterval(interval);

    	worker.postMessage({delay:1000/29.97,w:canvas.width,h:canvas.height});

    	video.pause();
    	video.currentTime = 0;
    	var frame = 0;
    	setTimeout(getFrame, 200);

    	function getFrame(){
    		chroma();
			var data = context.getImageData(0, 0, canvas.width, canvas.height);
			worker.postMessage({frame: data});
			video.currentTime = (frame+1) / 29.97;
    		frame++;
    		if(video.currentTime == frame / 29.97){
    			setTimeout(getFrame, 200);
    		}else{
    			worker.postMessage({});
    			video.play();
    			interval = setInterval(chroma, 1000/29.97);
    		}
    	}
    }
}