chrome.runtime.sendMessage({ "todo": "showPageAction" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	
	const data = JSON.parse(document.querySelector('#__PWS_DATA__').innerText)

	//get the first key out from storypins. This is hard to guess
	let storyKey = Object.keys(data.props.initialReduxState.storyPins)[0]
	let storyPins = data.props.initialReduxState.storyPins
	//check if the page has stories. Otherwise it is a single pic or video
	if(storyPins[storyKey]){ console.log('test')
		//get pages as an array 
		let pages = storyPins[storyKey].pages

		//loop over pages and get all the images or videos
		pages.forEach(page => {
			let image = page.blocks[0].image;
			if(image)
				console.log(image.images.originals.url)
			else
				console.log(page.blocks[0].video.video_list.V_EXP3.url)
		});
	}
	else{
		//take a similar approach as in the if condition
		let pinsKey = Object.keys(data.props.initialReduxState.pins)[0]
		let pins = data.props.initialReduxState.pins[pinsKey]

		//check if this is a video
		if(pins.videos){
			let videoKey = Object.keys(pins.videos.video_list)[0]
			console.log(pins.videos.video_list[videoKey].url)
		}
		else{
			console.log(pins.images.orig.url)
		}
	}
	
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