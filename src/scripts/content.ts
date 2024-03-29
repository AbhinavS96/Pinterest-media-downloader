chrome.runtime.sendMessage({ todo: "showPageAction" });

//needed to reload the script on page navigation
document.addEventListener(
  "click",
  (e) => {
    //stop propogation only if the click was on an <a> tag
    if ((e.target as Element).closest("a")) e.stopPropagation();
  },
  true
);

//defining the type for the response globally for now to access in the next two functions
type DownloadResponse =
  | {
      imageURL: string;
      type: string;
      downloadURL: string;
    }[];

//function that would parse the meta json and return an array of media objects on a pin page
const pinMediaArray = () => {
  let response: DownloadResponse = [];

  //get the meta JSON
  const data = JSON.parse(document.querySelector("#__PWS_DATA__").textContent);

  //check if the page has stories. Otherwise it is a single pic or video
  const pinsKey = Object.keys(data.props.initialReduxState.pins)[0];
  const pins = data.props.initialReduxState.pins[pinsKey];

  //check if this is a story. It can have images and videos inside.
  if (pins.story_pin_data) {
    pins.story_pin_data.pages.forEach((page: any) => {
      if (page.blocks[0].type === "story_pin_video_block") {
        response.push({
          imageURL: page.blocks[0].video.video_list.V_EXP3.thumbnail as string,
          type: "video",
          downloadURL: page.blocks[0].video.video_list.V_EXP3.url as string,
        });
      } else if (page.blocks[0].type === "story_pin_image_block") {
        response.push({
          imageURL: page.blocks[0].image.images.originals.url,
          type: "image",
          downloadURL: page.blocks[0].image.images.originals.url,
        });
      }
    });
  }
  // check if this is a video
  else if (pins.videos) {
    const videoKey = Object.keys(pins.videos.video_list)[0];
    response.push({
      imageURL: pins.images.orig.url,
      type: "video",
      downloadURL: pins.videos.video_list[videoKey].url,
    });
  } else if (pins.images) {
    response.push({
      imageURL: pins.images.orig.url,
      type: "image",
      downloadURL: pins.images.orig.url,
    });
  }
  return response;
};

//function to get all images on a collection page -beta
const collectionMediaArray = () => {
  let response: DownloadResponse = [];
  //get the meta JSON
  const data = JSON.parse(document.querySelector("#__PWS_DATA__").textContent);
  //data.props.initialReduxState.feeds[0]

  //saving the key separately as it cannot be guessed
  const feedKey = Object.keys(
    data.props.initialReduxState.resources.BoardFeedResource
  )[0];

  data.props.initialReduxState.resources.BoardFeedResource[
    feedKey
  ].data.forEach((item: any) => {
    if (item.videos) {
      const videoKey = Object.keys(item.videos.video_list)[0];
      //video URL needs to be changed for it to work. need to figure out a better workaround.
      //for now, making an assumption that the 720p version will be available
      let newURL = item.videos.video_list[videoKey].url.split("/hls/");
      newURL = newURL[0] + "/720p/" + newURL[1].split(".m3u8")[0] + ".mp4";
      response.push({
        imageURL: item.videos.video_list[videoKey].thumbnail,
        type: "video",
        downloadURL: newURL,
      });
    } else if (item.story_pin_data) {
      item.story_pin_data.pages.forEach((page: any) => {
        const image = page.blocks[0].image;
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
    } else if (item.images) {
      response.push({
        imageURL: item.images.orig.url,
        type: "image",
        downloadURL: item.images.orig.url,
      });
    }
  });

  return response;
};

const setDownloadStatus = (status: boolean, index: number) => {
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
const downloadImage = async (imageSrc: string, index: number) => {
  setDownloadStatus(true, index);
  const image = await fetch(imageSrc);
  const imageBlob = await image.blob();
  //@ts-ignore: Cannot find name error
  saveAs(imageBlob, imageSrc.split("/")[imageSrc.split("/").length - 1]);
  setDownloadStatus(false, index);
};

//using js zip library to zip and download the media
const downloadAllImages = async (imageArray: string[], index: number) => {
  setDownloadStatus(true, index);
  //@ts-ignore: Cannot find name error
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
    //@ts-ignore: Cannot find name error
    .then((content: any) => saveAs(content, "pinterest"))
    .finally(() => setDownloadStatus(false, index));
};
