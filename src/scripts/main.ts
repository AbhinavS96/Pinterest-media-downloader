import config from "./config.js";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { todo: "getData" }, (res) => {
    //Initial setup of localized text
    (document.querySelector("title") as HTMLTitleElement).textContent =
      chrome.i18n.getMessage("title_tag");
    (
      document.querySelector("#main-heading") as HTMLHeadingElement
    ).textContent = chrome.i18n.getMessage("h1_tag");
    (
      document.querySelector("#errorMessage .error-wrapper") as HTMLDivElement
    ).textContent = chrome.i18n.getMessage("error_message");
    (
      document.querySelector("#saveButton span") as HTMLSpanElement
    ).textContent = chrome.i18n.getMessage("download_all");

    if (res.length > 0) {
      //hide the error message
      (document.querySelector("#errorMessage") as HTMLDivElement).hidden = true;

      type DownloadResponse = {
        imageURL: string;
        type: string;
        downloadURL: string;
      };

      //create the download elements
      res.forEach((element: DownloadResponse, index: number) => {
        const li = document.createElement("li");
        const liWrapper = document.createElement("div");
        liWrapper.classList.value = "li-wrapper";
        const button = document.createElement("button");
        const img = document.createElement("img");
        img.src = element.imageURL;
        img.classList.value = "image";
        img.loading = "lazy";
        const span = document.createElement("span");
        //text content is generated based on the type of the data.
        span.textContent = chrome.i18n.getMessage("download");
        const loader = document.createElement("div");
        loader.classList.value = "loader";
        loader.setAttribute("hidden", "true");
        button.appendChild(span);
        button.appendChild(loader);
        button.classList.value = "btn";
        const text = document.createTextNode((index + 1).toString() + ".");
        liWrapper.appendChild(text);
        liWrapper.appendChild(img);
        liWrapper.appendChild(button);
        li.appendChild(liWrapper);

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
        (
          document.querySelector("#downloadAllContainer") as HTMLElement
        ).hidden = true;
      } else {
        document.getElementById("saveButton").addEventListener("click", () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              todo: "saveAllImages",
              downloadURLs: res.map((i: DownloadResponse) => i.downloadURL),
              index: res.length,
            });
          });
        });
      }
    } else {
      //remove the download container just for visual appeal
      (document.querySelector("#downloadContainer") as HTMLElement).hidden =
        true;
      (document.querySelector("#downloadAllContainer") as HTMLElement).hidden =
        true;
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //enable or disable the button based on the status of the download returned
  if (request.download) {
    document
      .querySelectorAll("button")
      [request.index].setAttribute("disabled", "true");
    (
      document
        .querySelectorAll("button")
        [request.index].querySelector(".loader") as HTMLElement
    ).hidden = false;
    document
      .querySelectorAll("button")
      [request.index].querySelector("span").hidden = true;
  } else {
    document
      .querySelectorAll("button")
      [request.index].removeAttribute("disabled");
    (
      document
        .querySelectorAll("button")
        [request.index].querySelector(".loader") as HTMLElement
    ).hidden = true;
    document
      .querySelectorAll("button")
      [request.index].querySelector("span").hidden = false;
  }
});
