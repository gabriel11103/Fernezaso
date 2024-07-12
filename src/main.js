import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { GameWin } from './scenes/GameWin';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { RulesScene } from './scenes/RuleScene';  // Importa la nueva escena de Reglas

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, RulesScene, Game, GameOver, GameWin],  // Agrega RulesScene aquí
};

export default new Phaser.Game(config);


const songs = [
  { title: "Song 1", src: "./src/sounds/La Mona Jimenez - Ramito De Violetas.mp3" },
  { title: "Song 2", src: "./src/sounds/La Mona Jimenez -El enamorado.mp3" },
  { title: "Song 3", src: "./src/sounds/La Mona Jimenez - Te Vas A Casar.mp3" },
  { title: "Song 4", src: "./src/sounds/La Mona - Lo Que Ha Pasado Anoche.mp3" },
  { title: "Song 5", src: "./src/sounds/La Mona - Amor de compra y venta.mp3" },
  { title: "Song 6", src: "./src/sounds/Q' Lokura - Claro Absurdo.mp3" },
  { title: "Song 7", src: "./src/sounds/Q' Lokura - Buscate un hombre que te quiera - Poli amor.mp3" },
  { title: "Song 8", src: "./src/sounds/Q' Lokura - No Pachanga Naninga.mp3" },
  { title: "Song 9", src: "./src/sounds/Q' Lokura Ft Euge Quevedo - Amigos.mp3" },
  { title: "Song 10", src: "./src/sounds/WALTER OLMOS ENGANCHADOS.mp3" },
  { title: "Song 11", src: "./src/sounds/LBC - Que se io.mp3" },
  { title: "Song 12", src: "./src/sounds/LBC - Olvidarte De Mi Jamas Podras.mp3" },
  { title: "Song 13", src: "./src/sounds/MONADA - MI HABITACION.mp3" },
  { title: "Song 14", src: "./src/sounds/Monada - La gaita de la caña.mp3" },
  { title: "Song 15", src: "./src/sounds/Monada - enganchados.mp3" },
  { title: "Song 16", src: "./src/sounds/LA FIESTA - ESE LOBO.MP3" },
  { title: "Song 17", src: "./src/sounds/Enganchados Damian Cordoba.mp3" },
  { title: "Song 18", src: "./src/sounds/Ulises Bueno - Ahora Mirame.mp3" },
  { title: "Song 18", src: "./src/sounds/Ulises Bueno - Ya No Volvera.mp3" },
  { title: "Song 18", src: "./src/sounds/Ulises Bueno - Loco.mp3" }
];

let currentSongIndex = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource = null;
let audioBuffer = null;
let isPlaying = false;
let playlist = [];

const playPauseButton = document.getElementById("play-pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

// Función para mezclar el array de canciones 
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Cargar y reproducir la canción actual
async function loadAndPlaySong(index) {
  try {
    const response = await fetch(playlist[index].src);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    if (audioSource) {
      audioSource.disconnect();
    }

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start();

    // Cambiar ícono según el estado de reproducción
    playPauseButton.innerHTML = '<i class="material-icons">pause</i>';
    isPlaying = true;
  } catch (error) {
    console.error("Error al cargar y reproducir la canción:", error);
  }
}

// Reproducir o pausar la canción
function playPauseSong() {
  if (isPlaying) {
    audioContext.suspend().then(() => {
      playPauseButton.innerHTML = '<i class="material-icons">play_arrow</i>';
      isPlaying = false;
    });
  } else {
    audioContext.resume().then(() => {
      playPauseButton.innerHTML = '<i class="material-icons">pause</i>';
      isPlaying = true;
    });
  }
}

// Cambiar a la canción anterior
function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadAndPlaySong(currentSongIndex);
}

// Cambiar a la siguiente canción
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadAndPlaySong(currentSongIndex);
}

// Manejar el cambio del estado de la canción
audioContext.addEventListener("statechange", () => {
  if (audioContext.state === "suspended" && isPlaying) {
    nextSong();
  }
});

// Event listeners para los botones
playPauseButton.addEventListener("click", playPauseSong);
prevButton.addEventListener("click", prevSong);
nextButton.addEventListener("click", nextSong);

// Iniciar la reproducción cuando la ventana se carga
async function startPlayback() {
  try {
    // Asegurarse de que el contexto está en estado 'running'
    await audioContext.resume();

    // Mezclar las canciones restantes, excluyendo la primera
    const remainingSongs = songs.slice(1);
    shuffleArray(remainingSongs);

    // La primera canción es fija, el resto es aleatorio
    playlist = [songs[0], ...remainingSongs]; 

    // Cargar y reproducir la primera canción
    await loadAndPlaySong(currentSongIndex);

    // Asegurarse de que el contexto no esté en estado 'suspended'
    if (audioContext.state === 'suspended') {
      await new Promise(resolve => {
        document.body.addEventListener('click', () => {
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => resolve());
          } else {
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error("Error al iniciar la reproducción automática:", error);
  }
}

// Asegurarse de que la música comienza automáticamente cuando la página se carga
window.addEventListener("load", startPlayback);
