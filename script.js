// Print a welcome message to the console
console.log("Welome to console");

//
 let local_path = "http://127.0.0.1:3000"; // local path
 let remote_path =
   "https://github.com/AkhilBarthwal005/Spotify-Clone.github.io"; // remote path


// Function to disable a button based on index and total length
function diableButton(index, id, length) {
  if (index == 0 || index == length - 1) {
    id.style.opacity = "0.2";
    id.style.pointerEvents = "none";
  }
}
// Function to enable a button based on index and total length
function enableButton(index, id, length) {
  if (index > 0 && index < length - 1) {
    id.style.opacity = "1";
    id.style.pointerEvents = "fill";
  }
}

// Function to convert seconds to minutes and seconds format
function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Ensure the input is a non-negative number
  seconds = Math.max(0, seconds);

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Add leading zeros if necessary
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  // Return the formatted time string
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Async function to fetch songs based on a given folder
async function getSongs(currFolder) {
  let songs_table = await fetch(`${remote_path}/songs/${currFolder}`,{mode : "cors"});
  let text = await songs_table.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let a = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}

// Async function to fetch song images details based on a given folder
async function getSongImagesDetails(currFolder) {
  let songs_img = await fetch(`${remote_path}/img/songs/${currFolder}`, {
    mode: "cors",
  });
  let img_path = await songs_img.text();
  let div = document.createElement("div");
  div.innerHTML = img_path;
  let a = div.getElementsByTagName("a");
  let songs_images = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".webp")) {
      songs_images.push(element.href);
    }
  }
  return songs_images;
}

// Async function to get song details from song URLs and a current folder
async function getSongDetails(songs, currFolder) {
  let arr = [];
  for (let index = 0; index < songs.length; index++) {
    const element = songs[index];
    currFolder = currFolder.replaceAll(" ", "%20");
    console.log("current folder " + currFolder);
    arr[index] = element
      .split(`/songs/${currFolder}/`)[1]
      .replaceAll("%20", " ")
      .split("-");
  }
  return arr;
}

// Async function to display song details on the webpage
async function displaySongDetails(songs_images, songs_details) {
  let songsLibaray = document
    .querySelector(".songs-libaray")
    .querySelector("ul");
  songsLibaray.innerHTML = "";
  for (let index = 0; index < songs_images.length; index++) {
    const song_img = songs_images[index];
    const song_name = songs_details[index][0];
    const artist_name = songs_details[index][1];
    songsLibaray.innerHTML =
      songsLibaray.innerHTML +
      `
        <li class="song-list">
              <img class="song-image" src="${song_img}" alt="">
              <div class="song-detail">
                <h4>${song_name}</h4>
                <p class="grey">${artist_name.replace(".mp3", "")}</p>
              </div>
              <img class="play invert" src="img/svg/play.svg" alt="">
            </li>
        `;
  }
}

// Function to play a song and update local storage
function playSong(song_name, current_song, currFolder, flag = true) {
  localStorage.setItem("last_played_song", song_name);
  localStorage.setItem("last_folder", currFolder);
  current_song.src = `/songs/${currFolder}/` + song_name;
  document.querySelector(".cureent-song-details").innerText = song_name;
  document.querySelector(".timeline").innerText = "00:00/00:00";
  if (flag) {
    current_song.play();
    play.src = "img/svg/pause.svg";
  }
}

// Function to get the first song of a playlist
function getFirstSong() {
  let song_name = document.querySelector(".song-detail").children[0].innerText;
  let artist_name =
    document.querySelector(".song-detail").children[1].innerText;
  let fullsongName = song_name + "-" + artist_name + ".mp3";
  return fullsongName;
}

// Function to add click event listeners to each song in the library
function addEventListenerToEachLibrarySongs(songs, current_song, currFolder) {
  Array.from(document.querySelectorAll(".song-list")).forEach((element) => {
    element.addEventListener("click", () => {
      let song_name =
        element.querySelector(".song-detail").children[0].innerText;
      let artist_name =
        element.querySelector(".song-detail").children[1].innerText;
      let fullsongName = song_name + "-" + artist_name + ".mp3";
      console.log("songs ke ander ka current folder" + currFolder);
      currFolder = currFolder.replaceAll(" ", "%20");
      let first =
        songs[0].split(`/songs/${currFolder}/`)[1].replaceAll("%20", " ") ==
        fullsongName;
      let last =
        songs[songs.length - 1]
          .split(`/songs/${currFolder}/`)[1]
          .replaceAll("%20", " ") == fullsongName;

      if (first || last) {
        first
          ? diableButton(0, pervious, songs.length)
          : diableButton(songs.length - 1, next, songs.length);
      }
      if (songs.length > 2) {
        if (first) {
          enableButton(1, next, songs.length);
        } else if (last) {
          enableButton(1, pervious, songs.length);
        } else {
          enableButton(1, next, songs.length);
          enableButton(1, pervious, songs.length);
        }
      }
      playSong(fullsongName, current_song, currFolder);
    });
  });
}

// Async function to fetch folders from the server
async function getFolders() {
  let folders_dir = await fetch(`${remote_path}/songs/`, { mode: "cors" });
  let text = await folders_dir.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let a = div.getElementsByTagName("a");
  let folders = [];
  for (let index = 1; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith("/")) {
      let name = element.innerHTML.slice(0, element.innerHTML.length - 1);
      folders.push(name);
    }
  }
  return folders;
}

// Async function to display albums based on the list of folders
async function displayAlbums(folders) {
  let playlistCard = document.querySelector(".playlist-cards");
  for (let index = 0; index < folders.length; index++) {
    let fold = folders[index];
    let info = await fetch(`${remote_path}/songs/${fold}/info.json`, {
      mode: "cors",
    });
    let json = await info.json();
    playlistCard.innerHTML =
      playlistCard.innerHTML +
      `<div class="card p-1 bg-grey m-1 roundend">
              <img class="roundend" src="img/playlist/${json.title}.webp" alt="" />
              <h4>${json.title}</h4>
              <p class="grey">
                ${json.description}
              </p>
              <div class="play-button">
                <img src="img/svg/playlist_play.svg" alt="" />
              </div>
            </div>`;
  }
}

// Main function to initialize the webpage
async function main() {
  let folders = await getFolders();
  let currFolder = folders[0];
  let songs = await getSongs(currFolder);
  let songs_images = await getSongImagesDetails(currFolder);
  let songs_details = await getSongDetails(songs, currFolder);
  await displayAlbums(folders);
  await displaySongDetails(songs_images, songs_details);

  let current_song = new Audio();

  // setting default music
  if (localStorage.getItem("last_played_song") != "null") {
    playSong(
      localStorage.getItem("last_played_song"),
      current_song,
      currFolder,
      false
    );
  }

  // // Attach an even listner to each song
  addEventListenerToEachLibrarySongs(songs, current_song, currFolder);

  // adding click evne listner to the controllers
  play.addEventListener("click", () => {
    if (current_song.paused) {
      current_song.play();
      play.src = "img/svg/pause.svg";
    } else {
      current_song.pause();
      play.src = "img/svg/play.svg";
    }
  });

  // updating time for the current song
  current_song.addEventListener("timeupdate", () => {
    document.querySelector(".timeline").innerHTML = `
    ${secondsToMinutesAndSeconds(
      current_song.currentTime
    )}/${secondsToMinutesAndSeconds(current_song.duration)}`;
    document.querySelector(".circle").style.left =
      (current_song.currentTime / current_song.duration) * 100 + "%";
  });

  // Add event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current_song.currentTime = (current_song.duration * percent) / 100;
  });

  // for Hambruger
  hamburger.addEventListener("click", () => {
    document.querySelector("#hamburger-background").style.display = "block";
    document.querySelector(".sidebar").style.left = "0%";
    // document.querySelector("body").style.zindex="4";
  });
  document
    .querySelector("#hamburger-background")
    .addEventListener("click", () => {
      document.querySelector(".sidebar").style.left = "-100%";
      document.querySelector("#hamburger-background").style.display = "none";
    });

  // for pervious button

  pervious.addEventListener("click", () => {
    console.log("pervious");
    current_song.pause();
    let index = songs.indexOf(current_song.src);
    currFolder = currFolder.replaceAll(" ", "%20");
    if (index - 1 >= 0) {
      let song_name = songs[index - 1].split(`/songs/${currFolder}/`)[1];
      playSong(decodeURI(song_name), current_song, currFolder);
      enableButton(index - 1, next, songs.length);
    }
    diableButton(index - 1, pervious, songs.length);
  });

  // for next button
  next.addEventListener("click", () => {
    console.log("next");
    current_song.pause();
    let index = songs.indexOf(current_song.src);
    currFolder = currFolder.replaceAll(" ", "%20");
    if (index + 1 < songs.length) {
      let song_name = songs[index + 1].split(`/songs/${currFolder}/`)[1];
      playSong(decodeURI(song_name), current_song, currFolder);
      enableButton(index + 1, pervious, songs.length);
    }
    diableButton(index + 1, next, songs.length);
  });

  // for volume icon
  document.querySelector(".volume img").addEventListener("click", (e) => {
    let arr = e.target.src.split("/");
    let target = arr[arr.length - 1];
    if (target == "mute.svg") {
      document.querySelector(".volume").querySelector("img").src =
        "img/svg/volume.svg";
      current_song.volume = 0.5;
      volumeRange.value = 50;
    } else {
      document.querySelector(".volume").querySelector("img").src =
        "img/svg/mute.svg";
      current_song.volume = 0 / 100;
      volumeRange.value = 0;
    }
  });

  // Setting volume
  volumeRange.addEventListener("change", (e) => {
    console.log("setting volume  " + e.target.value);
    current_song.volume = parseInt(e.target.value) / 100;
    if (current_song.volume == 0) {
      document.querySelector(".volume").querySelector("img").src =
        "img/svg/mute.svg";
    } else {
      document.querySelector(".volume").querySelector("img").src =
        "img/svg/volume.svg";
    }
  });

  // Adding event listner to the card to display playlist dynamically

  document.querySelectorAll(".card").forEach((element) => {
    element.addEventListener("click", async (element) => {
      currFolder = element.currentTarget.querySelector("h4").innerText;
      songs = await getSongs(currFolder);
      songs_images = await getSongImagesDetails(currFolder);
      songs_details = await getSongDetails(songs, currFolder);
      await displaySongDetails(songs_images, songs_details);
      addEventListenerToEachLibrarySongs(songs, current_song, currFolder);
      let fullsongName = getFirstSong();
      playSong(fullsongName, current_song, currFolder);
    });
  });
}

// Call the main function to start the application
main();
