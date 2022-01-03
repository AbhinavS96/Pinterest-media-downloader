chrome.runtime.sendMessage({ "todo": "showPageAction" });

//needed to reload the script on page navigation
document.addEventListener("click", function(e) {
    e.stopPropagation();
}, true);

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
					"imageURL": image.images.originals.url,
					"type": "image",
					"downloadURL": image.images.originals.url
				})
			else
				response.push({
					"imageURL": page.blocks[0].video.video_list.V_EXP3.thumbnail,
					"type": "video",
					"downloadURL": page.blocks[0].video.video_list.V_EXP3.url
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
				"imageURL": pins.images.orig.url,
				"type": "video",
				"downloadURL": pins.videos.video_list[videoKey].url
			})
		}
		else{
			response.push({
				"imageURL": pins.images.orig.url,
				"type": "image",
				"downloadURL": pins.images.orig.url
			})
		}
	}
	return response
}

function downloadStatus(status, index) {
    chrome.runtime.sendMessage({"download": status, "index":index});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	//decide what to do based on the message
	if(request.todo == 'getData'){
		if(window.location.href.indexOf('/pin/') >= 0)
			sendResponse(mediaArray())
		else
			sendResponse([])
	}
	else if (request.todo == "saveImage") {
		downloadImage(request.downloadURL, request.index)
	}
	else if(request.todo == "saveAllImages")
		downloadAllImages(request.downloadURLs, request.index)
})

//function to download the media
async function downloadImage(imageSrc, index) {
	downloadStatus(true, index)
	const image = await fetch(imageSrc)
	const imageBlob = await image.blob()
	const imageURL = URL.createObjectURL(imageBlob)
	
	//using a hack to save the image. A link element for saving is added and clicked. Then it is removed.
	const link = document.createElement('a')
	link.href = imageURL
	link.download = imageSrc.split('/')[imageSrc.split('/').length-1]
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	downloadStatus(false, index)
  }

async function downloadAllImages(imageArray, index) {
	downloadStatus(true, index)
	let zip = new JSZip()
	for(const i of imageArray){
		const image = await fetch(i)
		const imageBlob = await image.blob()
		const imageFile = new File([imageBlob], i.split('/')[i.split('/').length-1]);
		zip.file(i.split('/')[i.split('/').length-1], imageFile);
	}
	zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "pinterest")).finally(() => downloadStatus(false, index));
}