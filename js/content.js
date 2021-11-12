chrome.runtime.sendMessage({ "todo": "showPageAction" });

//Array of selectors for detection
const selectorJSON = {
	'[data-test-id=closeup-image] .zI7 img':'image',
	'[data-test-id=pin-closeup-image] .zI7 img':'image',
	'video':'video',
	'div[role=img]':'backgroundImage'
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	
	let selector = ""
	//try and check which selector would match
	Object.keys(selectorJSON).forEach(sel =>{
		if(document.querySelectorAll(sel).length > 0)
			selector = sel
			console.log(selector)
	})
	
	// //check if this selector exists on the page. otherwise another selector has to be used
	// let selector = '[data-test-id=closeup-image] .zI7 img';
	// if(document.querySelectorAll(selector).length == 0)
	// 	selector = '[data-test-id=pin-closeup-image] .zI7 img';
	// //identify the largest image from the page. There could be two image links. The last one is usually the largest.
	// //does not work for videos
	// let imageArray = document.querySelectorAll(selector);
	// //if image array is empty then the page has a video
	// if (imageArray.length == 0) {
	// 	//using the same name for the variable to reuse the code. Only one video will get picked and stored in an array of length 1
	// 	imageArray = document.querySelectorAll('video');
	// }
	let mediaArray = document.querySelectorAll(selector);
	let mainImage = mediaArray[mediaArray.length - 1];

	//choose what to do depending on the button clicked
	if (request.todo == "openNewTab") {
		window.open(mainImage.src, '_blank');
	}
	//using a hack to save the image. A link element for saving is added and clicked. Then it is removed.
	else if (request.todo == "saveImage") {
		let link = document.createElement('a');
		link.href = '#';
		link.target = '_blank';
		link.download = mainImage.src;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
})