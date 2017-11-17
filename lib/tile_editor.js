const Shape = require('./shape.js');
const LevelCreator = require('./levels/level_creator.js');
const Input = require('./input.js');
const input = new Input();

const CreateFile = require('./create_file.js');

var coor = {x: 0, y: 0};
var mouseDown = false;
var mouseHeld = false;
var mouseUp = false;
var mouseDown2 = false;

class TileEditor {
  constructor(canvases) {
    this.canvases = canvases;
    this.ctx = this.canvases.main.getContext('2d');
    this.tool = 'draw';
    this.cursor = new Shape({
      width: 32,
      height: 32,
      color: 'rgba(255,200,200,0.5)',
      pos: {x: 0, y: 0}
    });

    this.madeSelection = false;
    this.selection = {
      start: null,
      end: null,
      startOffset: {x: 0, y: 0},
      endOffset: {x: 0, y: 0},
      tiles: []
    };

    this.req = null;

    this.tiles = [];
    this.keyMap = [
      []
    ];
    this.map = [
      []
    ];

    this.level = new LevelCreator(this.canvases);
    this.previewTile = null;
    this.keys = Object.entries(this.level.getKeys());
    this.currentKeyIdx = 4;
    this.currentKey = this.keys[this.currentKeyIdx];

    this.start();

  }

  //---

  getCoordinates() {
    const topLeft = {x: 0, y: 0};
    const bottomRight = {x: 0, y: 0};

    topLeft.x = Math.min(this.selection.start.x / 32, this.selection.end.x / 32);
    topLeft.y = Math.min(this.selection.start.y / 32, this.selection.end.y / 32);
    bottomRight.x = Math.max(this.selection.start.x / 32, this.selection.end.x / 32);
    bottomRight.y = Math.max(this.selection.start.y / 32, this.selection.end.y / 32);

    return {topLeft, bottomRight};
  }

  startSelection(startPos) {
    this.selection.start = startPos;
  }

  updateSelection() {
    const start = {x: this.selection.start.x, y: this.selection.start.y};
    const end = {x: this.selection.end.x, y: this.selection.end.y};
    this.ctx.fillStyle = 'rgba(100,100,255,0.5)';
    this.ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
  }

  getSelection() {
    const topLeft = this.getCoordinates().topLeft;
    const bottomRight = this.getCoordinates().bottomRight;

    const selection = [];

    for (let i = topLeft.y; i <= bottomRight.y - 1; i++) {
      selection.push([]);
      for (let j = topLeft.x; j <= bottomRight.x - 1; j++) {
        selection[i - topLeft.y].push(this.map[i][j]);
      }
    }

    console.log(selection);
    this.selection.tiles = selection;
    return selection;
  }

  startMoveSelection(startPos) {
    this.editTiles(this.deleteTile.bind(this));
    this.selection.pivot = startPos;
    this.selection.startOffset = {
      x: startPos.x - this.selection.start.x,
      y: startPos.y - this.selection.start.y
    };
    this.selection.endOffset = {
      x: startPos.x - this.selection.end.x,
      y: startPos.y - this.selection.end.y
    };
  }

  moveSelection() {
    const cursorOffset = {
      x: this.cursor.pos.x - this.selection.pivot.x,
      y: this.cursor.pos.y - this.selection.pivot.y
    };
    this.selection.start = {
      x: this.cursor.pos.x - this.selection.startOffset.x,
      y: this.cursor.pos.y - this.selection.startOffset.y
    };
    this.selection.end = {
      x: this.cursor.pos.x - this.selection.endOffset.x,
      y: this.cursor.pos.y - this.selection.endOffset.y
    };

  }

  editTiles(action) {
    const topLeft = this.getCoordinates().topLeft;
    const bottomRight = this.getCoordinates().bottomRight;

    this.selection.tiles.forEach((row, j) => {
      row.forEach((tile, i) => {
        const pos = {
          x: topLeft.x + i,
          y: topLeft.y + j
        };
        action(pos, tile);
      });
    });
  }

  endSelection() {
    this.editTiles(this.createTile.bind(this));
    this.selection = {start: null, end: null};
  }

  //---

  createTile(pos, key) {
    pos = pos || {x: this.cursor.pos.x / 32, y: this.cursor.pos.y / 32};
    key = key || this.currentKey;
    this.populateMap(pos.x, pos.y, key);
  }

  deleteTile(pos) {
    pos = pos || {x: this.cursor.pos.x / 32, y: this.cursor.pos.y / 32};
    this.populateMap(pos.x, pos.y, this.keys[12]);
  }

  getPreviewTile() {
    if (this.currentKey != null && this.currentKey[1] != null) {
      this.previewTile = this.level.createTile(
        this.currentKey[1],
        this.level.sheets.ground,
        1.5,
        .5,
        {x: 0, y: 0},
        this.ctx
      );
    } else {
      this.previewTile = null;
    }
  }

  createArt(key, pos) {
    const newTile = this.level.createTile(
      key[1],
      this.level.sheets.ground,
      pos.x,
      pos.y,
      {x: .5, y: .5},
      this.ctx
    );
    this.tiles.push(newTile);
  }


  drawTiles() {
    this.map.forEach((row, j) => {
      row.forEach((key, i) => {
        if (key[1] !== null) {
          this.createArt(key, {x: i, y: j});
        }
      });
    });
    this.tiles.forEach((tile) => {
      tile.update(this.ctx);
    });

    this.tiles = [];
  }

  //---

  populateMap(x, y, key) {
    while(y + 1 > this.map.length) {
      this.map.push([]);
    }
    this.map.forEach((row) => {
      while(x + 1 > row.length) {
        row.push(this.keys[12]);
      }
    });

    this.map[y][x] = key;
  }

  showMap() {
    this.ctx.font = '12px Courier';
    this.ctx.fillText(this.currentKey[0], 16, 16);
    this.ctx.font = '12px Courier';
    this.ctx.fillText(this.tool, 64, 16);

    this.keyMap = [];

    this.ctx.font = '8px Courier';
    this.map.forEach((row, i) => {
      const text = [];
      row.forEach((tile) => {
        text.push(tile[0]);
      });
      this.ctx.fillText(text, 32, 16 * (i + 2));
      this.keyMap.push(`\n\t\t\t\t[${text}]`);
    });
  }

  //---

  handleInput() {
    switch (this.tool) {
      case 'draw':
        if (mouseDown) {
          this.createTile();
        }
        if (mouseDown2) {
          this.deleteTile();
        }
        break;
      case 'select':
        if (mouseDown) {
          if (this.selection.start) {
            this.startMoveSelection({x: this.cursor.pos.x, y: this.cursor.pos.y});
          } else {
            this.startSelection({x: this.cursor.pos.x, y: this.cursor.pos.y});
          }
          mouseDown = false;
        }
        if (mouseHeld) {
          if (this.madeSelection) {
            this.moveSelection();
          } else {
            this.selection.end = this.cursor.pos;
          }
        }
        if (this.selection.start) {
          this.updateSelection();
        }
        if (mouseDown2) {
          this.madeSelection = false;
          this.endSelection();
          mouseDown2 = false;
        }
        if (mouseUp && !this.madeSelection) {
          this.getSelection();
          this.madeSelection = true;
          mouseUp = false;
        }
        break;
      default:

    }
  }

  resetInput() {
    mouseUp = false;
  }

  changeCurrentKey() {
    if (input.inputs.leftHeld) {
      if (this.currentKeyIdx > 0) {
        this.currentKeyIdx -= 1;
      }
      this.currentKey = this.keys[this.currentKeyIdx];
      this.getPreviewTile();
      input.inputs.leftHeld = false;
    }
    if (input.inputs.rightHeld) {
      if (this.currentKeyIdx < this.keys.length - 1) {
        this.currentKeyIdx += 1;
      }
      this.currentKey = this.keys[this.currentKeyIdx];
      this.getPreviewTile();
      input.inputs.rightHeld = false;
    }
  }

  changeCurrentTool() {
    if (input.inputs.downHeld) {
      this.tool = (this.tool === 'draw') ? 'select' : 'draw';
      input.inputs.downHeld = false;
    }
  }

  getCursorPos() {
    this.cursor.update(this.ctx);
    this.cursor.pos = {
      x: Math.ceil((coor.x - 32) / 32) * 32,
      y: Math.ceil((coor.y - 32) / 32) * 32
    };
  }

  //---

  writeFile() {
    let contents = [
`const LevelCreator = require('./level_creator');

class LevelX extends LevelCreator {
  constructor(ctx) {
    super(ctx);
    this.createLevel(this.mapLevel());
  }

  mapLevel() {
    let { pl, en, ki, tl, to, tr, ml, mi,
          mr, bl, bo, br, __, ww, we, wl,
          wr, ch, bt, bm, ft, fm, tt, go,
          gg, ib, co, tw, wt, td, tu
        } = this.getKeys();

    const map = {
      chunk: [${this.keyMap}
      ]
    };

    return map;
  }
}

module.exports = LevelX;`
    ];
    // contents.push(this.keyMap);
    return contents;
  }

  //---

  start() {
    const animate = () => {
      //change this
      this.ctx.clearRect(0, 0, 5000, 5000);

      this.ctx.fillStyle = 'rgba(100,100,100,0.25)';
      this.ctx.fillRect(0, 0, this.map[0].length * 32, this.map.length * 32);

      this.drawTiles();

      if (this.previewTile) {
        this.previewTile.update(this.ctx);
      }

      this.getCursorPos();
      this.changeCurrentKey();
      this.changeCurrentTool();
      this.handleInput();

      this.showMap();
      CreateFile(this.writeFile());

      this.resetInput();

      this.req = requestAnimationFrame(animate);
    };

    this.req = animate();
  }
}
//---

function getMouseCoor(e) {
  coor = handleMouseMove(document.getElementById("main-canvas"), e);
}
function getMouseDown(e) {
  if (e.button === 0) {
    mouseHeld = true;
    mouseDown = true;
  }
  if (e.button === 2) {
    mouseDown2 = true;
  }
}

function getMouseUp(e) {
  if (e.button === 0) {
    mouseUp = true;
    mouseHeld = false;
    mouseDown = false;
  }
  if (e.button === 2) {
    mouseDown2 = false;
  }
}


window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
}, false);
window.addEventListener('mousemove', getMouseCoor, false);
window.addEventListener('mousedown', getMouseDown, false);
window.addEventListener('mouseup', getMouseUp, false);

function handleMouseMove(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  let pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return pos;
}

//---

module.exports = TileEditor;