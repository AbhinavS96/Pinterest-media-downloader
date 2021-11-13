
window.onload = () =>{
	chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id,	{todo: "getData"}, (res) => {
			console.log(res[0])
			//create the download elements
			res.forEach((element, index) => {
				let li = document.createElement("li")
				let button = document.createElement("button")
				let img = document.createElement("img")
				img.src = element.url
				img.classList = "image"
				button.innerText = "Download " + element.type
				button.classList = "btn btn-outline-danger"
				let text = document.createTextNode((index+1).toString())
				li.appendChild(text)
				li.appendChild(img)
				li.appendChild(button)
				document.getElementById("downloads").appendChild(li)
			});
		})
	})

	document.getElementById('saveButton').addEventListener("click", ()=>{
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			chrome.tabs.sendMessage(tabs[0].id,	{todo: "saveImage"})
		})
	})
}

