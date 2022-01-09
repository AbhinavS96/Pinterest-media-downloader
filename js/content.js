chrome.runtime.sendMessage({ todo: "showPageAction" });

//needed to reload the script on page navigation
document.addEventListener(
  "click",
  (e) => {
    e.stopPropagation();
  },
  true
);

//function that would parse the meta json and return an array of media objects on a pin page
const pinMediaArray = () => {
  let response = [];

  //get the meta JSON
  const data = JSON.parse(document.querySelector("#__PWS_DATA__").textContent);

  //get the first key out from storypins. This is hard to guess
  let storyKey = Object.keys(data.props.initialReduxState.storyPins)[0];
  let storyPins = data.props.initialReduxState.storyPins;
  //check if the page has stories. Otherwise it is a single pic or video
  if (storyPins[storyKey]) {
    //get pages as an array
    let pages = storyPins[storyKey].pages;

    //loop over pages and get all the images or videos
    pages.forEach((page) => {
      let image = page.blocks[0].image;
      if (image)
        response.push({
          imageURL: image.images.originals.url,
          type: "image",
          downloadURL: image.images.originals.url,
        });
      else
        response.push({
          imageURL: page.blocks[0].video.video_list.V_EXP3.thumbnail,
          type: "video",
          downloadURL: page.blocks[0].video.video_list.V_EXP3.url,
        });
    });
  } else {
    //take a similar approach as in the if condition
    let pinsKey = Object.keys(data.props.initialReduxState.pins)[0];
    let pins = data.props.initialReduxState.pins[pinsKey];

    //check if this is a video
    if (pins.videos) {
      let videoKey = Object.keys(pins.videos.video_list)[0];
      response.push({
        imageURL: pins.images.orig.url,
        type: "video",
        downloadURL: pins.videos.video_list[videoKey].url,
      });
    } else {
      response.push({
        imageURL: pins.images.orig.url,
        type: "image",
        downloadURL: pins.images.orig.url,
      });
    }
  }
  return response;
};

//function to get all images on a collection page -beta
const collectionMediaArray = () => {
  let response = [];
  //get the meta JSON
  const data = JSON.parse(document.querySelector("#__PWS_DATA__").textContent);
  //data.props.initialReduxState.feeds[0]

  //saving the key separately as it cannot be guessed
  const feedKey = Object.keys(
    data.props.initialReduxState.resources.BoardFeedResource
  );

  data.props.initialReduxState.resources.BoardFeedResource[
    feedKey
  ].data.forEach((item) => {
    if (item.videos) {
      let videoKey = Object.keys(item.videos.video_list)[0];
      console.log(videoKey);
      response.push({
        imageURL: item.videos.video_list[videoKey].thumbnail,
        type: "video",
        downloadURL: item.videos.video_list[videoKey].url,
      });
    }
  });

  return response;
};

const setDownloadStatus = (status, index) => {
  chrome.runtime.sendMessage({ download: status, index: index });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //conditions to identify page type
  const pinPageCondition = () => window.location.href.indexOf("/pin/") >= 0;
  const collectionPageCondition = () => {
    try {
      return (
        JSON.parse(
          document.querySelector('script[type="application/ld+json"]')
            .textContent
        ).mainEntityOfPage["@type"] === "CollectionPage"
      );
    } catch (e) {
      return false;
    }
  };

  //decide what to do based on the message
  if (request.todo == "getData") {
    if (pinPageCondition()) sendResponse(pinMediaArray());
    else if (collectionPageCondition()) sendResponse(collectionMediaArray());
    else sendResponse([]);
  } else if (request.todo == "saveImage") {
    downloadImage(request.downloadURL, request.index);
  } else if (request.todo == "saveAllImages")
    downloadAllImages(request.downloadURLs, request.index);
});

//function to download the media
const downloadImage = async (imageSrc, index) => {
  setDownloadStatus(true, index);
  const image = await fetch(imageSrc);
  const imageBlob = await image.blob();
  //moving away from hack save and using the js library.
  saveAs(imageBlob, imageSrc.split("/")[imageSrc.split("/").length - 1]);
  setDownloadStatus(false, index);
};

//using js zip library to zip and download the media
const downloadAllImages = async (imageArray, index) => {
  setDownloadStatus(true, index);
  let zip = new JSZip();
  for (const i of imageArray) {
    const image = await fetch(i);
    const imageBlob = await image.blob();
    const imageFile = new File(
      [imageBlob],
      i.split("/")[i.split("/").length - 1]
    );
    zip.file(i.split("/")[i.split("/").length - 1], imageFile);
  }
  zip
    .generateAsync({ type: "blob" })
    .then((content) => saveAs(content, "pinterest"))
    .finally(() => setDownloadStatus(false, index));
};
