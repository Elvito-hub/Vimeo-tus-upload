import axios from "axios";
import { useState } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import * as tus from "tus-js-client";
import "./App.css";

function App() {
  // const socket = io();
  const [file, setFile] = useState();
  const [videoUrl, setVideoUrl] = useState("");

  // socket.on("percentage", (arg) => {
  //   console.log(arg); // world
  // });
  console.log(file);

  const uploadHandler = () => {
    const formData = new FormData();
    formData.append("videoFile", file);
    var url = "http://localhost:8080/postvid";
    const config = {
      method: "POST",
      url,
      Headers: {
        "Content-type": "multipart/form-data",
      },
      data: formData,
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(percentCompleted);
      },
    };
    axios(config).then((res) => {
      console.log(res);
    });
  };
  const headerPost = {
    Accept: "application/vnd.vimeo.*+json;version=3.4",
    Authorization: `bearer ur auth key`,
    "Content-Type": "application/json",
  };

  const clientUploadHandler = async () => {
    console.log(file.size);
    const response = await axios({
      method: "post",
      url: `https://api.vimeo.com/me/videos`,
      headers: headerPost,
      data: {
        upload: {
          approach: "tus",
          size: file.size,
        },
      },
    });
    console.log(response);
    const upload = new tus.Upload(file, {
      endPoint: "https://api.vimeo.com/me/videos",
      uploadUrl: response.data.upload.upload_link,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      headers: {},
      onError: function (error) {
        console.log("Failed because: " + error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        console.log("Download %s from %s", upload.file.name, upload.url);
        setVideoUrl(response.data.link);
      },
    });
    upload.start();
  };
  return (
    <div className="App">
      <h1>Upload Videos</h1>
      <input
        type="file"
        id="thevideo"
        onChange={(e) => {
          setFile(document.getElementById("thevideo").files[0]);
        }}
      />
      <button disabled={!file} onClick={(e) => clientUploadHandler()}>
        Upload
      </button>
      {/* <ReactPlayer url="https://vimeo.com/750381764" /> */}
      {videoUrl && <a href={videoUrl}>Video link</a>}
    </div>
  );
}

export default App;
