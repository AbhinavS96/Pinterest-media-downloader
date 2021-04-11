chrome.runtime.sendMessage({"todo":"showPageAction"});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
	if(request.todo == "openNewTab"){
		window.open(document.querySelector('.zI7 img').src, '_blank');
	}
	else if(request.todo == "saveImage"){
		let link = document.createElement('a');
		link.href = '#';
		link.target = '_blank';
		link.download = document.querySelector('.zI7 img').src;
		document.body.appendChild(link);	
		link.click();
		document.body.removeChild(link);
	}
})