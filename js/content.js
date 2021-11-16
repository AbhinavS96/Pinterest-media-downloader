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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	//decide what to do based on the message
	if(request.todo == 'getData'){
		sendResponse(mediaArray())
	}
	else if (request.todo == "saveImage") {
		//async function to read the image stream and then save it. Doesn't work otherwise. 
		//video support is untested
		console.log(request)
		//if(request.type == 'image')
			downloadImage(request.downloadURL)
		// else{
		// 	const link = document.createElement('a')
		// 	link.href = request.downloadURL
		// 	console.log(link.href)
		// 	link.download = 'sample.mp4'
		// 	document.body.appendChild(link)
		// 	link.click()
		// 	document.body.removeChild(link)
		// }
	}
})

//function to download the image. not tested for videos.
//works in console but not here?
async function downloadImage(imageSrc) {
	const image = await fetch(imageSrc)
	const imageBlog = await image.blob()
	const imageURL = URL.createObjectURL(imageBlog)
	
	//using a hack to save the image. A link element for saving is added and clicked. Then it is removed.
	const link = document.createElement('a')
	link.href = imageURL
	link.download = 'a.mp4'
	link.innerText = "aaaa"
	document.body.appendChild(link)
	link.click()
	console.log('click')
	document.body.removeChild(link)
  }