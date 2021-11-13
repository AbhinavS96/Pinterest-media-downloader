
window.onload = () =>{
	chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id,	{todo: "getData"}, (res) => {
			console.log(res[0])
		})
	})
	document.getElementById('newTabButton').addEventListener("click", ()=>{
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.tabs.sendMessage(tabs[0].id,	{todo: "openNewTab"})
		})
	})

	document.getElementById('saveButton').addEventListener("click", ()=>{
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.tabs.sendMessage(tabs[0].id,	{todo: "saveImage"})
		})
	})
}

