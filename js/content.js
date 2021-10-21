chrome.runtime.sendMessage({ "todo": "showPageAction" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	//identify the largest image from the page. There could be two image links. The last one is usually the largest.
	//does not work for videos
	let imageArray = document.querySelectorAll('[data-test-id=closeup-image] .zI7 img');
	//if image array is empty then the page has a video
	if (imageArray.length == 0) {
		//using the same name for the variable to reuse the code. Only one video will get picked and stored in an array of length 1
		imageArray = document.querySelectorAll('video');
	}
	let mainImage = imageArray[imageArray.length - 1];

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