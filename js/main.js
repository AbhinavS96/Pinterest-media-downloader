// var pinURL;
// let button = document.querySelector('#newTabButton');
// if(button){
// 	button.addEventListener('click', ()=>{
// 		window.open(pinURL);
// 		console.log("yes");
// 	})
// }
// else{
// 	console.log("failed")
// }

window.onload = () =>{
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