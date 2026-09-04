/* ---------------------------------------------------------------------
   Datos de cada vocal.
   `scene` apunta a la imagen ya armada (dibujo + letra + seña LSA) que
   vive en assets/scenes/. Para agregar una letra nueva más adelante
   (escalar al abecedario completo):
     1) Sumar acá una entrada nueva con su color, palabra y pista.
     2) Guardar la imagen 300x300 de esa letra en assets/scenes/.
     3) Agregar el botón correspondiente en el <nav> de index.html.
   No hace falta tocar el resto de la lógica del juego.
--------------------------------------------------------------------- */
const DATA = {
  A: {
    word: "ÁRBOL",
    color: "#3f9142",
    soft: "#e6f4e6",
    hint: "PARA LA A, SE FORMA UN PUÑO CERRADO.",
    scene: "assets/scenes/A.png"
  },
  E: {
    word: "ELEFANTE",
    color: "#2d6fae",
    soft: "#e4eef8",
    hint: "PARA LA E, TAMBIEN SE CIERRA LA MANO EN UN PUÑO, CON EL PULGAR APOYADO ADELANTE.",
    scene: "assets/scenes/E.png"
  },
  I: {
    word: "ISLA",
    color: "#d98a1e",
    soft: "#faf0de",
    hint: "PARA LA I, SE LEVANTA EL DEDO MEÑIQUE CON EL RESTO DE LA MANO CERRADA.",
    scene: "assets/scenes/I.png"
  },
  O: {
    word: "OSO",
    color: "#d1483f",
    soft: "#fbe7e4",
    hint: "PARA LA O, LOS DEDOS FORMAN UN CÍRCULO, COMO LA LETRA O.",
    scene: "assets/scenes/O.png"
  },
  U: {
    word: "UVAS",
    color: "#7c4fae",
    soft: "#f0e6f8",
    hint: "PARA LA U, SE LEVANTAN EL ÍNDICE Y EL MAYOR JUNTOS, COMO UNA V CERRADA.",
    scene: "assets/scenes/U.png"
  }
};

/* ---------------------------------------------------------------------
   Estado del rompecabezas: un solo tablero de 3x3 (9 piezas). Todas las
   piezas están siempre visibles y mezcladas sobre el mismo tablero; se
   arma tocando de a dos piezas para intercambiarlas de lugar.
--------------------------------------------------------------------- */
const GRID = 3; // 3x3 = 9 piezas
const CELL = 300 / GRID;

let current = "A";
let arrangement = [];   // arrangement[cellIndex] = homeIndex de la pieza que está ahí
let selectedCell = null;
let sceneUri = "";

const board = document.getElementById("board");
const stage = document.getElementById("stage");
const statusEl = document.getElementById("status");
const reveal = document.getElementById("reveal");
const sceneFull = document.getElementById("sceneFull");
const wordEl = document.getElementById("word");
const hintEl = document.getElementById("hint");

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSolved(arr){
  return arr.every((home, cell) => home === cell);
}

function loadVowel(v){
  current = v;
  selectedCell = null;
  const d = DATA[v];

  stage.style.setProperty("--accent", d.color);
  stage.style.setProperty("--accent-soft", d.soft);
  document.querySelectorAll("nav.vocales button")
    .forEach(b => b.classList.toggle("active", b.dataset.v === v));

  sceneUri = d.scene;
  reveal.style.display = "none";
  statusEl.style.display = "block";
  statusEl.textContent = "TOCÁ UNA PIEZA Y DESPUÉS TOCÁ OTRA PARA CAMBIARLAS DE LUGAR.";

  const total = GRID * GRID;
  do{
    arrangement = shuffle([...Array(total).keys()]);
  } while(isSolved(arrangement));

  renderBoard();
}

function renderBoard(){
  board.innerHTML = "";
  arrangement.forEach((homeIndex, cellIndex) => {
    const row = Math.floor(homeIndex / GRID);
    const col = homeIndex % GRID;

    const cellEl = document.createElement("div");
    cellEl.className = "cell";
    cellEl.style.backgroundImage = `url("${sceneUri}")`;
    cellEl.style.backgroundPosition = `-${col * CELL}px -${row * CELL}px`;
    cellEl.dataset.cell = cellIndex;

    if(homeIndex === cellIndex){
      cellEl.classList.add("locked");
    }

    cellEl.addEventListener("click", onCellTap);
    board.appendChild(cellEl);
  });
}

function onCellTap(e){
  const cellEl = e.currentTarget;
  if(cellEl.classList.contains("locked")) return;

  const cellIndex = Number(cellEl.dataset.cell);

  if(selectedCell === null){
    selectedCell = cellIndex;
    cellEl.classList.add("selected");
    return;
  }

  if(selectedCell === cellIndex){
    cellEl.classList.remove("selected");
    selectedCell = null;
    return;
  }

  // Intercambiamos las dos piezas de lugar
  const tmp = arrangement[selectedCell];
  arrangement[selectedCell] = arrangement[cellIndex];
  arrangement[cellIndex] = tmp;
  selectedCell = null;

  renderBoard();

  const cells = board.children;
  cells[cellIndex].classList.add("pop");
  setTimeout(() => cells[cellIndex] && cells[cellIndex].classList.remove("pop"), 300);

  if(isSolved(arrangement)){
    setTimeout(showReveal, 300);
  }
}

function showReveal(){
  statusEl.style.display = "none";
  reveal.style.display = "flex";

  const d = DATA[current];
  sceneFull.style.setProperty("--scene-bg", `url("${sceneUri}")`);
  wordEl.innerHTML = d.word.replace(current, `<span class="vowel-letter">${current}</span>`);
  hintEl.textContent = d.hint;
}

document.querySelectorAll("nav.vocales button").forEach(btn => {
  btn.addEventListener("click", () => loadVowel(btn.dataset.v));
});
document.getElementById("again").addEventListener("click", () => loadVowel(current));

loadVowel("A");
