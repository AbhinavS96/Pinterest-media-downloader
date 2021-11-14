
window.onload = () =>{
	chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id,	{todo: "getData"}, (res) => {
			console.log(res[0])
			//create the download elements
			res.forEach((element, index) => {
				let li = document.createElement("li")
				let button = document.createElement("button")
				let img = document.createElement("img")
				img.src = element.imageURL
				img.classList = "image"
				button.innerText = "Download " + element.type
				button.classList = "btn btn-outline-danger"
				let text = document.createTextNode((index+1).toString())
				li.appendChild(text)
				li.appendChild(img)
				li.appendChild(button)
				
				// add event listeners to the buttons
				document.getElementById("downloads").appendChild(li)
				button.addEventListener("click", ()=>{
					chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
						chrome.tabs.sendMessage(tabs[0].id,	{todo: "saveImage", "imageURL": res[index].imageURL})
					})
				})
			});
		})
	})
	//for the save all button
	document.getElementById('saveButton').addEventListener("click", ()=>{
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.tabs.sendMessage(tabs[0].id,	{todo: "saveAllImages"})
		})
	})
}

