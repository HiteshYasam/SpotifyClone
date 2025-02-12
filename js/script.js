console.log("JS will load shortly")
var currFolder;
var currSong = new Audio();
let songs = [];

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`https://raw.githubusercontent.com/HiteshYasam/SpotifyClone/main/songs/${folder}`);
    // let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML+`<li>
                <img class="invert" src="imgsSPotify/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Hitesh</div>
                </div>
                <div class="playNow">
                  <span>playnow</span>
                  <img class="invert" src="imgsSPotify/play.svg" alt="">
                </div>
              </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e)=>{
      e.addEventListener("click", ()=>{
        palyMusic(e.querySelector(".info").firstElementChild.innerHTML);
      });
    });

    
    return songs
}

const palyMusic = (track, pause = false)=>{
  currSong.src = `/${currFolder}/`+track;
  if(!pause){
    document.getElementById("play").src = "imgsSPotify/pause.svg";
    currSong.play();
  }
  document.querySelector(".songInfo").innerHTML = track.split(".mp3")[0].replaceAll("%20", " ");
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
} 

async function displayAlbums(){
  let a = await fetch("http://127.0.0.1:5500/songs");
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let aTags = div.getElementsByTagName("a");
  let array = Array.from(aTags)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("/songs") && !e.href.endsWith("/songs")){
      let folder = e.href.split('/').slice(-1)[0]
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      document.querySelector(".cardContainer").innerHTML += `<div data-folder=${folder} class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#008000"/>
                <polygon points="16,12 28,20 16,28" fill="#000000" stroke="#000000" stroke-width="1.5" stroke-linejoin="miter"/>
              </svg> 
            </div>
            <img src="http://127.0.0.1:5500/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
    }
    
  }
  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
     palyMusic(songs[0])
    })
   })
}

async function main(){

    await getSongs("songs/Animal");
    // console.log(songs[0], true);
    palyMusic(songs[0], true);
    
    //https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     // console.log(duration);
    // });

    //Dynamic update of all albums in page
    displayAlbums()

    //Now we will attach an event lister to each song
 
    document.getElementById("play").addEventListener("click", ()=>{
      if(currSong.paused){
        currSong.play();
        document.getElementById("play").src = "imgsSPotify/pause.svg";
      }else{
        currSong.pause();
        document.getElementById("play").src = "imgsSPotify/play.svg";
      }
    })

    previous.addEventListener("click", ()=>{
      let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
      // console.log()
      if(index > 0){
        palyMusic(songs[index-1]);
      }
    })

    next.addEventListener("click", ()=>{
      // console.log(songs[0]);
      // console.log(currSong.src.split("/").slice(-1)[0]);
      let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
      console.log(index)
      if(index+1 < songs.length){
        palyMusic(songs[index+1]);
      }
    })

    currSong.addEventListener("timeupdate", ()=>{
      // console.log(currSong.currentTime, currSong.duration)
      document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutes(currSong.currentTime)}/${convertSecondsToMinutes(currSong.duration)}`;
      document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration)*100 + '%';
    })

    document.querySelector(".seekBar").addEventListener("click", e=>{
      // console.log(e.offsetX);
      let percent = e.offsetX / e.target.getBoundingClientRect().width;
      //getBoundingClientRect() gives the closet rectangle which enclosed our object including padding margin etc
      //target is often used to know from where the event occured 
      document.querySelector(".circle").style.left = percent*100+'%';
      currSong.currentTime = currSong.duration * percent;
    })

    document.querySelector(".hamburger").addEventListener("click", ()=>{
      document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".close").addEventListener("click", ()=>{
      document.querySelector(".left").style.left = -120 + '%';
    })

   document.querySelector(".volRange").addEventListener("change", (e)=>{
      currSong.volume = parseInt(e.target.value)/100;
   })

   document.querySelector(".volume > img").addEventListener("click", (e)=>{
      if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currSong.volume = 0;
        document.querySelector(".volRange").value = 0
      }else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currSong.volume = 0.3;
        document.querySelector(".volRange").value = 30
      }
   })

}

main() 


