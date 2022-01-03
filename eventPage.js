chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	if(request.todo == "showPageAction"){
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.action.enable(tabs[0].id);
		})
	}
});

chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
	chrome.action.enable(tabs[0].id);
});