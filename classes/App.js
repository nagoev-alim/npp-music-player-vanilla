import feather from 'feather-icons';
import musics from '../data/mock.js';
import { addZero } from '../modules/addZero.js';

export default class App {
  constructor(root) {
    // 🚀 Props
    this.root = root;
    this.musicIndex = Math.floor((Math.random() * musics.length) + 1);

    // 🚀 Render Skeleton
    this.root.innerHTML = `
      <div class='top-line'>
        ${feather.icons['chevron-down'].toSvg()}
        <span class='h6'>Now Playing</span>
        ${feather.icons['more-horizontal'].toSvg()}
      </div>

      <div class='cover'>
        <img data-cover='' src='#' alt='Cover'>
      </div>

      <div class='details'>
        <p class='h5' data-name=''></p>
        <p data-artist=''></p>
      </div>

      <div class='progress' data-progress=''>
        <div class='progress__bar'>
          <audio data-audio='' src=''></audio>
        </div>
        <div class='timer'>
          <span data-time=''>0:00</span>
          <span data-duration=''>0:00</span>
        </div>
      </div>

      <div class='controls'>
        <button data-repeat='repeat' title='Playlist looped'>${feather.icons.repeat.toSvg()}</button>
        <button data-back=''>${feather.icons['skip-back'].toSvg()}</button>
        <button data-play=''>${feather.icons.play.toSvg()}</button>
        <button data-forward=''>${feather.icons['skip-forward'].toSvg()}</button>
        <button data-list=''>${feather.icons.list.toSvg()}</button>
      </div>

      <div class='list' data-playlist=''>
        <div class='header'>
          ${feather.icons.music.toSvg()}
          <span>Music list</span>
          <button data-close=''>${feather.icons.x.toSvg()}</button>
        </div>
        <ul data-music-list=''></ul>
      </div>
    `;

    // 🚀 Query Selectors
    this.DOM = {
      cover: document.querySelector('[data-cover]'),
      details: {
        name: document.querySelector('[data-name]'),
        artist: document.querySelector('[data-artist]'),
      },
      audio: {
        main: document.querySelector('[data-audio]'),
      },
      progress: document.querySelector('[data-progress]'),
      timer: {
        time: document.querySelector('[data-time]'),
        duration: document.querySelector('[data-duration]'),
      },
      controls: {
        repeat: document.querySelector('[data-repeat]'),
        back: document.querySelector('[data-back]'),
        play: document.querySelector('[data-play]'),
        forward: document.querySelector('[data-forward]'),
        list: document.querySelector('[data-list]'),
      },
      playlist: {
        self: document.querySelector('[data-playlist]'),
        close: document.querySelector('[data-close]'),
      },
      musicList: document.querySelector('[data-music-list]'),
    };

    // 🚀 Events Listeners
    window.addEventListener('load', this.initApp);
    this.DOM.controls.play.addEventListener('click', this.onPlayClick);
    this.DOM.controls.forward.addEventListener('click', this.nextMusic);
    this.DOM.controls.back.addEventListener('click', this.prevMusic);
    this.DOM.controls.repeat.addEventListener('click', this.onRepeat);
    this.DOM.controls.list.addEventListener('click', this.onSongsList);
    this.DOM.playlist.close.addEventListener('click', this.onSongsList);
    this.DOM.progress.addEventListener('click', this.onProgressClick);
    this.DOM.audio.main.addEventListener('timeupdate', this.onMainAudio);
    this.DOM.audio.main.addEventListener('ended', this.onMainAudioEnd);
  }

  //===============================================
  // 🚀 Methods
  //===============================================
  /**
   * @function initApp - App initialize
   */
  initApp = () => {
    this.renderMusics();
    this.loadMusic(this.musicIndex);
    this.playingSong();
  };
  //===============================================
  /**
   * @function renderMusics - Render musics list
   */
  renderMusics = () => {
    for (const [index, value] of musics.entries()) {
      const li = document.createElement('li');
      li.setAttribute('data-index', index + 1);
      li.innerHTML = `
        <div>
          <p class='h6'>${value.name}</p>
          <p>${value.artist}</p>
        </div>
        <span data-duration='${value.src}' data-total-duration=''>3:36</span>
        <audio data-song='${value.src}' class='visually-hidden' src='${value.src}'></audio>
      `;

      this.DOM.musicList.append(li);

      const duration = li.querySelector('[data-duration]');
      const song = li.querySelector('[data-song]');

      song.addEventListener('loadeddata', () => {
        const durationText = `${Math.floor(song.duration / 60)}:${addZero(Math.floor(song.duration % 60))}`;
        duration.textContent = `${Math.floor(song.duration / 60)}:${addZero(Math.floor(song.duration % 60))}`;
        duration.setAttribute('data-total-duration', durationText)
      });
    }
  };

  //===============================================
  /**
   * @function loadMusic - Load random music
   * @param idx
   */
  loadMusic = (idx) => {
    this.DOM.details.name.textContent = musics[idx - 1].name;
    this.DOM.details.artist.textContent = musics[idx - 1].artist;
    this.DOM.cover.src = musics[idx - 1].img;
    this.DOM.audio.main.src = musics[idx - 1].src;
  };

  //===============================================
  /**
   * @function playingSong -
   */
  playingSong = () => {
    this.DOM.musicList.querySelectorAll('li')
      .forEach((song, idx) => {
        const durationTag = song.querySelector('[data-duration]');

        if (song.classList.contains('playing')) {
          song.classList.remove('playing');
          durationTag.innerText = durationTag.dataset.totalDuration;
        }

        if (parseInt(song.dataset.index) === this.musicIndex) {
          song.classList.add('playing');
          durationTag.innerText = 'Playing';
        }

        song.addEventListener('click', ({ target }) => {
          this.musicIndex = parseInt(target.dataset.index);
          this.loadMusic(this.musicIndex);
          this.playMusic();
          this.playingSong();
        });
      });
  };

  //===============================================
  /**
   * @function playMusic
   */
  playMusic = async () => {
    this.root.classList.add('paused');
    this.DOM.controls.play.innerHTML = feather.icons.pause.toSvg();

    let promise = this.DOM.audio.main.play();

    if (promise !== undefined) {
      promise.then(_ => {
      }).catch(error => {
      });
    }
  };

  //===============================================
  /**
   * @function onPlay - Play song
   */
  onPlayClick = () => {
    this.root.classList.contains('paused') ? this.pauseMusic() : this.playMusic();
    this.playingSong();
  };

  //===============================================
  /**
   * @function pauseMusic - Paused song
   */
  pauseMusic = () => {
    this.root.classList.remove('paused');
    this.DOM.controls.play.innerHTML = feather.icons.play.toSvg();
    this.DOM.audio.main.pause();
  };

  //===============================================
  /**
   * @function prevMusic - Play previously song
   */
  prevMusic = () => {
    this.musicIndex--;
    this.musicIndex = this.musicIndex < 1 ? musics.length : this.musicIndex;
    this.loadMusic(this.musicIndex);
    this.playMusic();
    this.playingSong();
  };

  //===============================================
  /**
   * @function prevMusic - Play next song
   */
  nextMusic = () => {
    this.musicIndex++;
    this.musicIndex = this.musicIndex > musics.length ? 1 : this.musicIndex;
    this.loadMusic(this.musicIndex);
    this.playMusic();
    this.playingSong();
  };

  //===============================================
  /**
   * @function onProgressClick -
   * @param offsetX
   */
  onProgressClick = ({ offsetX }) => {
    // let progressWidth = this.DOM.progress.clientWidth;
    // let clickedOffsetX = ;
    // let songDuration = this.DOM.audio.main.duration;

    this.DOM.audio.main.currentTime = (offsetX / this.DOM.progress.clientWidth) * this.DOM.audio.main.duration;
    this.playMusic();
    this.playingSong();
  };

  //===============================================
  /**
   * @function onMainAudio
   * @param currentTime
   * @param duration
   */
  onMainAudio = ({ target: { currentTime, duration } }) => {
    this.DOM.progress.querySelector('.progress__bar').style.width = `${(currentTime / duration) * 100}%`;
    this.DOM.audio.main.addEventListener('loadeddata', () => this.DOM.timer.duration.innerText = `${Math.floor(this.DOM.audio.main.duration / 60)}:${addZero(Math.floor(this.DOM.audio.main.duration % 60))}`);
    this.DOM.timer.time.innerText = `${Math.floor(currentTime / 60)}:${addZero(Math.floor(currentTime % 60))}`;
  };

  //===============================================
  /**
   * @function onRepeat - Change repeat/shuffle/looped button
   * @param target
   */
  onRepeat = ({ target }) => {
    let type = target.dataset.repeat;
    switch (type) {
      case 'repeat':
        target.innerHTML = feather.icons['rotate-cw'].toSvg();
        target.setAttribute('title', 'Song looped');
        target.setAttribute('data-repeat', 'repeat_one');
        break;
      case 'repeat_one':
        target.innerHTML = feather.icons.shuffle.toSvg();
        target.setAttribute('title', 'Playback shuffled');
        target.setAttribute('data-repeat', 'shuffle');
        break;
      case 'shuffle':
        target.innerHTML = feather.icons.repeat.toSvg();
        target.setAttribute('title', 'Playlist looped');
        target.setAttribute('data-repeat', 'repeat');
        break;
      default:
        break;
    }
  };

  //===============================================
  /**
   * @function
   */
  onMainAudioEnd = () => {
    let type = this.DOM.controls.repeat.dataset.repeat;
    switch (type) {
      case 'repeat':
        this.nextMusic();
        break;
      case 'repeat_one':
        this.DOM.audio.main.currentTime = 0;
        this.loadMusic(this.musicIndex);
        this.playMusic();
        break;
      case 'shuffle':
        let rndIdx = Math.floor((Math.random() * musics.length) + 1);
        do {
          rndIdx = Math.floor((Math.random() * musics.length) + 1);
        } while (this.musicIndex === rndIdx);

        this.musicIndex = rndIdx;
        this.loadMusic(this.musicIndex);
        this.playMusic();
        this.playingSong();
        break;
    }
  };
  //===============================================
  /**
   * @function
   */
  onSongsList = () => {
    this.DOM.playlist.self.classList.toggle('open');
  };
}
