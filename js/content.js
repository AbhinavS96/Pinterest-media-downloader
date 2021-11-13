chrome.runtime.sendMessage({ "todo": "showPageAction" });

//function that would parse the meta json and return an array of media objects
let mediaArray = () => {
	let response = []	
	
	//get the meta JSON
	const data = JSON.parse(document.querySelector('#__PWS_DATA__').innerText)

	//get the first key out from storypins. This is hard to guess
	let storyKey = Object.keys(data.props.initialReduxState.storyPins)[0]
	let storyPins = data.props.initialReduxState.storyPins
	//check if the page has stories. Otherwise it is a single pic or video
	if(storyPins[storyKey]){
		//get pages as an array 
		let pages = storyPins[storyKey].pages

		//loop over pages and get all the images or videos
		pages.forEach(page => {
			let image = page.blocks[0].image;
			if(image)
				response.push({
					"url": image.images.originals.url,
					"type": "image"
				})
			else
				response.push({
					"url": page.blocks[0].video.video_list.V_EXP3.url,
					"type": "video"
				})
		});
	}
	else{
		//take a similar approach as in the if condition
		let pinsKey = Object.keys(data.props.initialReduxState.pins)[0]
		let pins = data.props.initialReduxState.pins[pinsKey]

		//check if this is a video
		if(pins.videos){
			let videoKey = Object.keys(pins.videos.video_list)[0]
			response.push({
				"url": pins.videos.video_list[videoKey].url,
				"type": "video"
			})
		}
		else{
			response.push({
				"url": pins.images.orig.url,
				"type": "image"
			})
		}
	}
	return response
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	//decide what to do based on the message
	if(request.todo == 'getData'){
		sendResponse(mediaArray())
	}
	else if (request.todo == "openNewTab") {
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