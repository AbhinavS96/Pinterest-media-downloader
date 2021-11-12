chrome.runtime.sendMessage({ "todo": "showPageAction" });

//Array of selectors for detection
const selectorJSON = {
	'[data-test-id=closeup-image] .zI7 img':'mediaArray[mediaArray.length - 1].src',
	'[data-test-id=pin-closeup-image] .zI7 img':'mediaArray[mediaArray.length - 1].src',
	'#__PWS_DATA__':'let re = new RegExp("https:\/\/v\.pinimg\.com\/videos.*\.mp4"); re.exec(mediaArray[mediaArray.length - 1].innerText)[0].split(\'"\')[0]',
	'div[role=img]':'mediaArray[mediaArray.length - 1].style.backgroundImage.slice(5, -2)'
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	
	let selector = ""
	//try and check which selector would match
	Object.keys(selectorJSON).forEach(sel =>{
		if(document.querySelectorAll(sel).length > 0)
			selector = sel
	})

	//store the array of images/videos
	let mediaArray = document.querySelectorAll(selector);
	//evaluate the code corresponding to the detected media
	let mainImage = eval(selectorJSON[selector])

	//choose what to do depending on the button clicked
	if (request.todo == "openNewTab") {
		window.open(mainImage, '_blank');
	}
	//using a hack to save the image. A link element for saving is added and clicked. Then it is removed.
	else if (request.todo == "saveImage") {
		let link = document.createElement('a');
		link.href = '#';
		link.target = '_blank';
		link.download = mainImage;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
})