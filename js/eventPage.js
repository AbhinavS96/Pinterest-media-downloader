chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	if(request.todo == "showPageAction"){
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.action.show(tabs[0].id);
		})
	}
})

	