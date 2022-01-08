chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { todo: "getData" }, (res) => {
    if (res.length > 0) {
      //hide the error message
      document.querySelector("#errorMessage").hidden = true;

      //create the download elements
      res.forEach((element, index) => {
        let li = document.createElement("li");
        let button = document.createElement("button");
        let img = document.createElement("img");
        img.src = element.imageURL;
        img.classList = "image";
        button.textContent = "Download " + element.type;
        button.classList = "btn btn-outline-danger";
        let text = document.createTextNode((index + 1).toString() + ".");
        li.appendChild(text);
        li.appendChild(img);
        li.appendChild(button);

        // add event listeners to the buttons
        document.getElementById("downloads").appendChild(li);
        button.addEventListener("click", () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              todo: "saveImage",
              downloadURL: res[index].downloadURL,
              type: res[index].type,
              index: index,
            });
          });
        });
      });

      //for the save all button
      if (res.length == 1) {
        document.querySelector("#downloadAllContainer").hidden = true;
      } else {
        document.getElementById("saveButton").addEventListener("click", () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              todo: "saveAllImages",
              downloadURLs: res.map((i) => i.downloadURL),
              index: res.length,
            });
          });
        });
      }
    } else {
      //remove the download container just for visual appeal
      document.querySelector("#downloadContainer").hidden = true;
      document.querySelector("#downloadAllContainer").hidden = true;
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //enable or disable the button based on the status of the download returned
  if (request.download) {
    document
      .querySelectorAll("button")
      [request.index].setAttribute("disabled", true);
    document.querySelector(".loader").hidden = false;
    document.querySelector("#button_text").hidden = true;
  } else {
    document
      .querySelectorAll("button")
      [request.index].removeAttribute("disabled");
    document.querySelector(".loader").hidden = true;
    document.querySelector("#button_text").hidden = false;
  }
});
