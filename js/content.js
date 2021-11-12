chrome.runtime.sendMessage({ "todo": "showPageAction" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	
	const data = JSON.parse(document.querySelector('#__PWS_DATA__').innerText)

	let storyKey = Object.keys(data.props.initialReduxState.storyPins)[0]
	let stories = data.props.initialReduxState.storyPins[storyKey].pages[0].blocks

	stories.forEach(story => {
		console.log(story.video.video_list.V_EXP3.url)
	});
	
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