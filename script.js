console.log("Welome to console");

// make a button disable
function diableButton(index,id,length) {
  if (index == 0 || index == length-1) {
    id.style.opacity = "0.2";
    id.style.pointerEvents = "none";
  }
}
function enableButton(index,id,length) {
  if (index > 0 && index < length-1) {
    id.style.opacity = "1";
    id.style.pointerEvents = "fill";
  }
}

function secondsToMinutesAndSeconds(seconds) {
  if(isNaN(seconds) || seconds<0){
    return "00:00"
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

async function getSongs(folder) {
    let songs_table = await fetch("http://127.0.0.1:3000/songs/");
    let text = await songs_table.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let a = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href);
        }
        
    }
    return songs;
}

async function getSongImagesDetails(){
    let songs_img = await fetch("http://127.0.0.1:3000/img/songs");
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

async function getSongDetails(songs) {
    let arr = [];
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        arr[index] = element.split("/songs/")[1].replaceAll("%20"," ").split("-");
        // console.log(arr);
    }
    return arr;
}

function displaySongDetails(songs_images, songs_details) {
  let songsLibaray = document
    .querySelector(".songs-libaray")
    .querySelector("ul");
    console.log(songs_images.length,songs_details.length)
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
                <p class="grey">${artist_name.replace(".mp3","")}</p>
              </div>
              <img class="play invert" src="img/svg/play.svg" alt="">
            </li>
        `;
  }
}

function playSong(song_name,current_song,flag=true) {
    localStorage.setItem("last_played_song",song_name);
    current_song.src = "/songs/"+song_name;
    // if(current_song.paused){
    //     console.log("pause")
    //     current_song.play();
    // }
    // console.log(document.querySelector(".cureent-song-details"));
    document.querySelector(".cureent-song-details").innerText = song_name;
    document.querySelector(".timeline").innerText="00:00/00:00";
    if(flag){
        current_song.play();
        play.src = "img/svg/pause.svg";
    }
}




async function main() {
  let songs = await getSongs();
  //    console.log(songs);
  let songs_images = await getSongImagesDetails();
  let songs_details = await getSongDetails(songs);
  displaySongDetails(songs_images, songs_details);

  let current_song = new Audio();

  // setting default music
  if (localStorage.getItem("last_played_song") != "null")
    playSong(localStorage.getItem("last_played_song"), current_song, false);

  // Attach an even listner to each song

  Array.from(document.querySelectorAll(".song-list")).forEach((element) => {
    // console.log(element);
    element.addEventListener("click", () => {
      let song_name =
        element.querySelector(".song-detail").children[0].innerText;
      let artist_name =
        element.querySelector(".song-detail").children[1].innerText;
      let fullsongName = song_name + "-" + artist_name + ".mp3";
      let first = songs[0].split("/songs/")[1].replaceAll("%20"," ") == fullsongName;
      let last = songs[songs.length-1].split("/songs/")[1].replaceAll("%20"," ") == fullsongName;
      
      if(first || last){
        first ? diableButton(0,pervious,songs.length) : diableButton(songs.length-1,next,songs.length);
      }
      if(first){
        enableButton(2, next, songs.length);
      }
      else if(last){
        enableButton(2, pervious, songs.length);
      }
      else{
        enableButton(2, next, songs.length);
        enableButton(2, pervious, songs.length);
      }
      playSong(fullsongName, current_song);
    });
  });

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
    console.log(current_song.currentTime, current_song.duration);
    document.querySelector(".timeline").innerHTML = `
    ${secondsToMinutesAndSeconds(current_song.currentTime)}/${secondsToMinutesAndSeconds(current_song.duration)}`;
    console.log(document.querySelector(".circle"));
    document.querySelector(".circle").style.left =
      (current_song.currentTime / current_song.duration) * 100 + "%";
  });

  // Add event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    console.log(e.offSetX);
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current_song.currentTime = (current_song.duration * percent) / 100;
  });

  // for Hambruger
  hamburger.addEventListener("click",()=>{
    document.querySelector("#hamburger-background").style.display = "block";
    document.querySelector(".sidebar").style.left="0%";
    // document.querySelector("body").style.zindex="4";
  })
  document
    .querySelector("#hamburger-background")
    .addEventListener("click", () => {
      document.querySelector(".sidebar").style.left = "-100%";
      document.querySelector("#hamburger-background").style.display = "none";
    });


    // for pervious button

    pervious.addEventListener("click",()=>{
      console.log('pervious');
       current_song.pause();
       let index = songs.indexOf(current_song.src);
       if (index - 1 >= 0) {
         let song_name = songs[index - 1].split("/songs/")[1];
         playSong(decodeURI(song_name), current_song);
         enableButton(index-1,next,songs.length);
        }
        diableButton(index-1,pervious,songs.length);
      
    })

    // for next button
    next.addEventListener("click",()=>{
      console.log('next');
      current_song.pause();
      let index = songs.indexOf(current_song.src);
      if(index+1 < songs.length){
        let song_name = songs[index+1].split("/songs/")[1];
        playSong(decodeURI(song_name), current_song);
        enableButton(index + 1, pervious,songs.length);
      }
      diableButton(index + 1, next, songs.length);
    })

    // Setting volume
    volumeRange.addEventListener("change", (e) => {
      console.log("setting volume  "+ e.target.value);
      current_song.volume = parseInt(e.target.value)/100;
      if(current_song.volume == 0){
        document.querySelector(".volume").querySelector("img").src="img/svg/mute.svg";
      }
      else{
        document.querySelector(".volume").querySelector("img").src =
          "img/svg/volume.svg";
      }
    });
}



main();
