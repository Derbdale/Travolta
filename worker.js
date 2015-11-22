importScripts('b64.js', 'LZWEncoder.js','NeuQuant.js','GIFEncoder.js');

var encoder = new GIFEncoder();

self.addEventListener('message', function(e) {
	if(e.data.delay !== undefined){
		encoder.setRepeat(0);
		encoder.setDelay(e.data.delay);
		encoder.setSize(e.data.w,e.data.h);
		encoder.setQuality(10);
		encoder.start();
	} else if(e.data.frame !== undefined) {
		var data = e.data.frame.data;
		encoder.addFrame(data,true);
	} else {
		encoder.finish();
		var binary_gif = encoder.stream().getData();
		var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
        
        self.postMessage(data_url);
	}
}, false);
