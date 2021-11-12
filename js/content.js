chrome.runtime.sendMessage({ "todo": "showPageAction" });

//Array of selectors for detection
const selectorJSON = {
	'[data-test-id=closeup-image] .zI7 img':'image("[data-test-id=closeup-image] .zI7 img")',
	'[data-test-id=pin-closeup-image] .zI7 img':'image("[data-test-id=pin-closeup-image] .zI7 img")',
	'video': 'video("video")',
	'div[role=img]':'backgroundImage("div[role=img]")'
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
	let mediaLink = eval(selectorJSON[selector])

	//choose what to do depending on the button clicked
	if (request.todo == "openNewTab") {
		window.open(mediaLink, '_blank');
	}
	//using a hack to save the image. A link element for saving is added and clicked. Then it is removed.
	else if (request.todo == "saveImage") {
		let link = document.createElement('a');
		link.href = '#';
		link.target = '_blank';
		link.download = mediaLink;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
})


//function for images
let image = function(selector){
	let temp = document.querySelectorAll(selector)
	return temp[temp.length-1].src
}

//function for background images
let backgroundImage = function(selector){
	let temp = document.querySelectorAll(selector)
	return temp[temp.length-1].style.backgroundImage.slice(5, -2)
}

//function for videos
let video = function(selector){
	let temp = document.querySelectorAll(selector)
	console.log(temp)
	if(temp[temp.length-1].src.indexOf('blob:') > -1){
		let re = new RegExp("https:\/\/v\.pinimg\.com\/videos.*\.mp4");
		temp = document.querySelectorAll('#__PWS_DATA__')
		console.log(re.exec(temp[temp.length - 1].innerText)[0].split('"')[0])
		return re.exec(temp[temp.length - 1].innerText)[0].split('"')[0]
	}
	return temp[temp.length-1].src
}