import Phaser from 'phaser';
import './style.css';

type Mode = 'board' | 'combat';
type Terrain = 'road' | 'forest' | 'swamp' | 'mountain' | 'ruin' | 'town' | 'lava';
type UnitKind = 'hero' | 'enemy';

type PartyMember = {
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  armor: number;
  focus: number;
  color: number;
  x: number;
  y: number;
};

type BoardTile = {
  q: number;
  r: number;
  terrain: Terrain;
  label?: string;
};

type CombatUnit = {
  name: string;
  kind: UnitKind;
  hp: number;
  maxHp: number;
  row: number;
  col: number;
  color: number;
  note: string;
};

const WIDTH = 1280;
const HEIGHT = 760;
const TILE_W = 92;
const TILE_H = 46;
const BOARD_ORIGIN = { x: 255, y: 145 };
const COMBAT_ORIGIN = { x: 560, y: 248 };

const terrainPalette: Record<Terrain, { top: number; side: number; stroke: number; icon: string }> = {
  road: { top: 0xc9a96a, side: 0x8d6f3f, stroke: 0x3e2f1f, icon: '·' },
  forest: { top: 0x3e8f56, side: 0x255c38, stroke: 0x153922, icon: '♣' },
  swamp: { top: 0x536f5b, side: 0x30463a, stroke: 0x16241d, icon: '≈' },
  mountain: { top: 0x8e8b83, side: 0x5b5854, stroke: 0x2d2d2d, icon: '▲' },
  ruin: { top: 0x9b8f76, side: 0x665c49, stroke: 0x312b23, icon: '⌂' },
  town: { top: 0xd6bd7d, side: 0x9c7749, stroke: 0x49331d, icon: '◆' },
  lava: { top: 0xb94730, side: 0x74271f, stroke: 0x35120e, icon: '!' },
};

const boardTiles: BoardTile[] = [
  { q: 0, r: 0, terrain: 'town', label: 'Haven' },
  { q: 1, r: 0, terrain: 'road' },
  { q: 2, r: 0, terrain: 'forest' },
  { q: 3, r: 0, terrain: 'ruin', label: 'Watchtower' },
  { q: 4, r: 0, terrain: 'mountain' },
  { q: 0, r: 1, terrain: 'forest' },
  { q: 1, r: 1, terrain: 'road' },
  { q: 2, r: 1, terrain: 'swamp' },
  { q: 3, r: 1, terrain: 'forest' },
  { q: 4, r: 1, terrain: 'ruin' },
  { q: 0, r: 2, terrain: 'swamp' },
  { q: 1, r: 2, terrain: 'road', label: 'Merchant' },
  { q: 2, r: 2, terrain: 'road' },
  { q: 3, r: 2, terrain: 'lava' },
  { q: 4, r: 2, terrain: 'mountain', label: 'Mine Gate' },
  { q: 0, r: 3, terrain: 'forest' },
  { q: 1, r: 3, terrain: 'ruin' },
  { q: 2, r: 3, terrain: 'road' },
  { q: 3, r: 3, terrain: 'mountain' },
  { q: 4, r: 3, terrain: 'lava', label: 'Boss' },
];

const party: PartyMember[] = [
  { name: 'Blacksmith', role: 'front-line shield', hp: 31, maxHp: 36, armor: 4, focus: 2, color: 0xe9a64a, x: 0, y: 0 },
  { name: 'Hunter', role: 'ranged scout', hp: 22, maxHp: 25, armor: 1, focus: 3, color: 0x6fd36f, x: 1, y: 0 },
  { name: 'Scholar', role: 'magic support', hp: 17, maxHp: 22, armor: 0, focus: 5, color: 0x71a7ff, x: 0, y: 1 },
];

const combatUnits: CombatUnit[] = [
  { name: 'Blacksmith', kind: 'hero', hp: 31, maxHp: 36, row: 1, col: 0, color: 0xe9a64a, note: 'Guard / Bash' },
  { name: 'Hunter', kind: 'hero', hp: 22, maxHp: 25, row: 0, col: 0, color: 0x6fd36f, note: 'Pierce / Mark' },
  { name: 'Scholar', kind: 'hero', hp: 17, maxHp: 22, row: 2, col: 0, color: 0x71a7ff, note: 'Shock / Mend' },
  { name: 'Goblin Guard', kind: 'enemy', hp: 18, maxHp: 18, row: 1, col: 3, color: 0xb7d567, note: 'Armor 2' },
  { name: 'Hex Witch', kind: 'enemy', hp: 14, maxHp: 14, row: 0, col: 4, color: 0xc576d9, note: 'Curse' },
  { name: 'Bone Archer', kind: 'enemy', hp: 12, maxHp: 12, row: 2, col: 4, color: 0xe4e0ca, note: 'Back row' },
];

class PrototypeScene extends Phaser.Scene {
  private mode: Mode = 'board';
  private selected = 0;
  private info!: Phaser.GameObjects.Text;
  private modeLabel!: Phaser.GameObjects.Text;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('PrototypeScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#10131d');
    this.drawShell();
    this.layer = this.add.container(0, 0);
    this.info = this.add.text(28, 612, '', {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '15px',
      color: '#dce7ff',
      lineSpacing: 6,
      wordWrap: { width: 812 },
    });
    this.modeLabel = this.add.text(28, 24, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      color: '#f5d38a',
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.switchMode());
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.selected = (this.selected + 1) % party.length;
      this.render();
    });
    this.input.keyboard?.on('keydown-C', () => this.switchMode('combat'));
    this.input.keyboard?.on('keydown-B', () => this.switchMode('board'));
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));

    this.render();
  }

  private switchMode(force?: Mode) {
    this.mode = force ?? (this.mode === 'board' ? 'combat' : 'board');
    this.render();
  }

  private render() {
    this.layer.removeAll(true);
    this.drawShellChrome();
    if (this.mode === 'board') {
      this.modeLabel.setText('Overworld Board Prototype');
      this.drawBoard();
      this.info.setText(
        'Board loop shown: turn-based party movement across isometric tiles, terrain risk, town/shop anchors, objective pathing, enemy/event nodes, and world-pressure clock.\n' +
          'Click any tile to move the selected hero marker. TAB changes selected hero. SPACE or C switches to combat.'
      );
    } else {
      this.modeLabel.setText('Tactical Combat Prototype');
      this.drawCombat();
      this.info.setText(
        'Combat loop shown: compact isometric battle grid, protected back row, front-line enemies, readable turn order, weapon actions, health/armor/status UI, and loot preview.\n' +
          'SPACE or B returns to the board. This is all Phaser-drawn vector art: no asset pipeline yet, but the style can later swap to sprite sheets.'
      );
    }
  }

  private drawShell() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x151928, 0x151928, 0x090b12, 0x090b12, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle(0x0b0f18, 0.72);
    g.fillRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
    g.lineStyle(2, 0x3c4867, 0.9);
    g.strokeRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
  }

  private drawShellChrome() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x182033, 0.92);
    g.fillRoundedRect(890, 72, 350, 610, 14);
    g.lineStyle(1, 0x4e608a, 0.8);
    g.strokeRoundedRect(890, 72, 350, 610, 14);

    this.layer.add(this.add.text(914, 96, 'Run State', panelTitleStyle()));
    this.drawThreatMeter(914, 142);
    this.drawPartyPanel(914, 214);
    this.drawInventoryPanel(914, 430);
    this.drawControls(914, 638);
  }

  private drawThreatMeter(x: number, y: number) {
    this.layer.add(this.add.text(x, y, 'World Pressure', smallCapsStyle()));
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x0b0d14, 1).fillRoundedRect(x, y + 24, 292, 18, 9);
    g.fillStyle(0xc74d3f, 1).fillRoundedRect(x, y + 24, 188, 18, 9);
    g.fillStyle(0xf0c05d, 1).fillCircle(x + 228, y + 33, 6);
    this.layer.add(this.add.text(x, y + 52, 'Dawn III: enemy patrols spread after 2 turns', bodyStyle('#aeb9d6', '13px')));
  }

  private drawPartyPanel(x: number, y: number) {
    this.layer.add(this.add.text(x, y, 'Party', smallCapsStyle()));
    party.forEach((member, index) => {
      const rowY = y + 28 + index * 58;
      const g = this.add.graphics();
      this.layer.add(g);
      const isSelected = index === this.selected;
      g.fillStyle(isSelected ? 0x253454 : 0x121827, 1).fillRoundedRect(x, rowY, 292, 46, 10);
      g.lineStyle(1, isSelected ? 0xf5d38a : 0x2b3652, 1).strokeRoundedRect(x, rowY, 292, 46, 10);
      g.fillStyle(member.color, 1).fillCircle(x + 22, rowY + 23, 11);
      this.layer.add(this.add.text(x + 42, rowY + 7, member.name, bodyStyle('#f4f0dd', '14px')));
      this.layer.add(this.add.text(x + 42, rowY + 25, `${member.role} · HP ${member.hp}/${member.maxHp} · AR ${member.armor}`, bodyStyle('#98a6c8', '12px')));
    });
  }

  private drawInventoryPanel(x: number, y: number) {
    this.layer.add(this.add.text(x, y, 'Shared Inventory', smallCapsStyle()));
    const items = ['2x Godsbeard', 'Rusty Tower Shield', '80 gold', 'Torch', 'Curse Cure'];
    items.forEach((item, index) => {
      const yy = y + 30 + index * 30;
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x101521, 1).fillRoundedRect(x, yy, 292, 23, 7);
      g.lineStyle(1, 0x2a334e, 0.7).strokeRoundedRect(x, yy, 292, 23, 7);
      this.layer.add(this.add.text(x + 12, yy + 4, item, bodyStyle('#cad5f1', '12px')));
    });
  }

  private drawControls(x: number, y: number) {
    this.layer.add(this.add.text(x, y, 'Controls', smallCapsStyle()));
    this.layer.add(this.add.text(x, y + 25, 'SPACE switch screens · TAB select hero\nB board · C combat · click board tile to move', bodyStyle('#9aa8ca', '12px')));
  }

  private drawBoard() {
    this.drawMapBackdrop();
    boardTiles.forEach((tile) => this.drawIsoTile(tile));
    this.drawBoardPath();
    this.drawBoardEvents();
    party.forEach((member, index) => this.drawPartyToken(member, index));
  }

  private drawMapBackdrop() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x162136, 1).fillRoundedRect(46, 80, 800, 510, 18);
    g.lineStyle(1, 0x32415f, 1).strokeRoundedRect(46, 80, 800, 510, 18);
    g.fillStyle(0x0b101b, 0.55).fillEllipse(426, 388, 650, 210);
    this.layer.add(this.add.text(64, 96, 'semi-generated isometric overworld', smallCapsStyle('#8998bd')));
  }

  private drawIsoTile(tile: BoardTile) {
    const { x, y } = iso(tile.q, tile.r, BOARD_ORIGIN.x, BOARD_ORIGIN.y);
    const palette = terrainPalette[tile.terrain];
    const g = this.add.graphics();
    this.layer.add(g);
    const points = diamond(x, y);
    g.fillStyle(palette.side, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(points[1].x, points[1].y),
      new Phaser.Math.Vector2(points[2].x, points[2].y),
      new Phaser.Math.Vector2(points[2].x, points[2].y + 18),
      new Phaser.Math.Vector2(points[1].x, points[1].y + 18),
    ], true);
    g.fillStyle(palette.top, 1).fillPoints(points, true);
    g.lineStyle(2, palette.stroke, 0.9).strokePoints(points, true);
    g.lineStyle(1, 0xffffff, 0.08).lineBetween(points[0].x, points[0].y, points[2].x, points[2].y);

    const hit = this.add.zone(x, y, TILE_W, TILE_H).setOrigin(0.5);
    hit.setData('tile', tile);
    hit.setInteractive({ useHandCursor: true });
    this.layer.add(hit);

    this.layer.add(this.add.text(x - 6, y - 17, palette.icon, bodyStyle('#111827', '20px')));
    if (tile.label) {
      this.layer.add(this.add.text(x - 42, y + 22, tile.label, bodyStyle('#f5e7c0', '12px')).setShadow(1, 1, '#000', 2));
    }
  }

  private drawBoardPath() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(4, 0xf2d36b, 0.48);
    const route = [
      iso(0, 0, BOARD_ORIGIN.x, BOARD_ORIGIN.y),
      iso(1, 1, BOARD_ORIGIN.x, BOARD_ORIGIN.y),
      iso(2, 2, BOARD_ORIGIN.x, BOARD_ORIGIN.y),
      iso(3, 3, BOARD_ORIGIN.x, BOARD_ORIGIN.y),
      iso(4, 3, BOARD_ORIGIN.x, BOARD_ORIGIN.y),
    ];
    for (let i = 0; i < route.length - 1; i++) g.lineBetween(route[i].x, route[i].y, route[i + 1].x, route[i + 1].y);
  }

  private drawBoardEvents() {
    const nodes = [
      { q: 2, r: 1, text: 'ambush', color: 0xc95d4c },
      { q: 3, r: 0, text: 'skill check', color: 0xd8bc62 },
      { q: 1, r: 2, text: 'shop', color: 0x74b6e8 },
      { q: 4, r: 3, text: 'boss', color: 0xe05656 },
    ];
    nodes.forEach((node) => {
      const p = iso(node.q, node.r, BOARD_ORIGIN.x, BOARD_ORIGIN.y);
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x111827, 0.92).fillRoundedRect(p.x - 44, p.y - 60, 88, 22, 9);
      g.lineStyle(1, node.color, 1).strokeRoundedRect(p.x - 44, p.y - 60, 88, 22, 9);
      g.fillStyle(node.color, 1).fillCircle(p.x - 32, p.y - 49, 4);
      this.layer.add(this.add.text(p.x - 22, p.y - 56, node.text, bodyStyle('#edf2ff', '11px')));
    });
  }

  private drawPartyToken(member: PartyMember, index: number) {
    const p = iso(member.x, member.y, BOARD_ORIGIN.x, BOARD_ORIGIN.y);
    const x = p.x + index * 16 - 16;
    const y = p.y - 30 - index * 3;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x000000, 0.35).fillEllipse(x, y + 23, 28, 10);
    g.fillStyle(member.color, 1).fillCircle(x, y, index === this.selected ? 15 : 12);
    g.lineStyle(2, index === this.selected ? 0xffefb0 : 0x121212, 1).strokeCircle(x, y, index === this.selected ? 15 : 12);
    g.fillStyle(0xfff4da, 1).fillCircle(x - 4, y - 3, 2);
    this.layer.add(this.add.text(x - 26, y - 34, member.name.slice(0, 3), bodyStyle('#f9f3df', '11px')).setShadow(1, 1, '#000', 2));
  }

  private drawCombat() {
    this.drawCombatBackdrop();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        this.drawCombatTile(row, col);
      }
    }
    this.drawRowsLabels();
    combatUnits.forEach((unit) => this.drawCombatUnit(unit));
    this.drawActionBar();
    this.drawTurnOrder();
  }

  private drawCombatBackdrop() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x171624, 1).fillRoundedRect(46, 80, 800, 510, 18);
    g.lineStyle(1, 0x3d365e, 1).strokeRoundedRect(46, 80, 800, 510, 18);
    g.fillStyle(0x0a0b10, 0.65).fillEllipse(445, 380, 710, 240);
    this.layer.add(this.add.text(64, 96, 'compact isometric tactical grid', smallCapsStyle('#9c96c6')));
  }

  private drawCombatTile(row: number, col: number) {
    const { x, y } = combatIso(row, col);
    const heroSide = col < 2;
    const g = this.add.graphics();
    this.layer.add(g);
    const points = diamond(x, y, 104, 52);
    g.fillStyle(heroSide ? 0x263b59 : 0x4b2d36, 1).fillPoints(points, true);
    g.lineStyle(2, heroSide ? 0x55739e : 0x85505d, 0.9).strokePoints(points, true);
    if (col === 2) {
      g.lineStyle(3, 0xf2d36b, 0.35).strokePoints(points, true);
    }
  }

  private drawRowsLabels() {
    ['back row', 'front row', 'support row'].forEach((label, index) => {
      const p = combatIso(index, 0);
      this.layer.add(this.add.text(p.x - 148, p.y - 8, label, bodyStyle('#8fa2ca', '12px')));
    });
  }

  private drawCombatUnit(unit: CombatUnit) {
    const p = combatIso(unit.row, unit.col);
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x000000, 0.36).fillEllipse(p.x, p.y + 25, 46, 14);
    g.fillStyle(unit.color, 1).fillRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.lineStyle(2, unit.kind === 'hero' ? 0xffefb0 : 0xff8c7a, 1).strokeRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.fillStyle(0x171923, 1).fillRect(p.x - 10, p.y - 31, 6, 6);
    g.fillRect(p.x + 5, p.y - 31, 6, 6);
    g.fillStyle(0x10131d, 1).fillRoundedRect(p.x - 38, p.y + 8, 76, 9, 5);
    g.fillStyle(unit.kind === 'hero' ? 0x5ad37a : 0xe35b52, 1).fillRoundedRect(p.x - 38, p.y + 8, 76 * (unit.hp / unit.maxHp), 9, 5);
    this.layer.add(this.add.text(p.x - 44, p.y + 22, unit.name, bodyStyle('#f4f0df', '11px')).setShadow(1, 1, '#000', 2));
    this.layer.add(this.add.text(p.x - 34, p.y + 38, `${unit.hp}/${unit.maxHp} · ${unit.note}`, bodyStyle('#acb8d6', '10px')).setShadow(1, 1, '#000', 2));
  }

  private drawActionBar() {
    const x = 80;
    const y = 502;
    this.layer.add(this.add.text(x, y - 30, 'Selected action preview: Hunter turn', smallCapsStyle('#d9c27d')));
    const actions = ['Piercing Shot 74%', 'Mark Target', 'Use Godsbeard', 'Move Row', 'Flee 38%'];
    actions.forEach((action, index) => {
      const xx = x + index * 148;
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(index === 0 ? 0x314d37 : 0x151c2b, 1).fillRoundedRect(xx, y, 132, 46, 10);
      g.lineStyle(1, index === 0 ? 0x8bd77f : 0x35445f, 1).strokeRoundedRect(xx, y, 132, 46, 10);
      this.layer.add(this.add.text(xx + 11, y + 14, action, bodyStyle('#f1f5ff', '12px')));
    });
  }

  private drawTurnOrder() {
    const x = 78;
    const y = 146;
    this.layer.add(this.add.text(x, y, 'Turn Order', smallCapsStyle('#aebbd8')));
    ['Hunter', 'Goblin Guard', 'Scholar', 'Hex Witch', 'Blacksmith', 'Bone Archer'].forEach((name, index) => {
      const g = this.add.graphics();
      this.layer.add(g);
      const yy = y + 28 + index * 31;
      g.fillStyle(index === 0 ? 0x273e5a : 0x111827, 0.95).fillRoundedRect(x, yy, 142, 24, 7);
      g.lineStyle(1, index === 0 ? 0xf5d38a : 0x2e3852, 0.8).strokeRoundedRect(x, yy, 142, 24, 7);
      this.layer.add(this.add.text(x + 10, yy + 5, `${index + 1}. ${name}`, bodyStyle('#dce5fb', '11px')));
    });
  }

  private handlePointer(pointer: Phaser.Input.Pointer) {
    if (this.mode !== 'board') return;
    const objects = this.input.hitTestPointer(pointer);
    const zone = objects.find((object) => object instanceof Phaser.GameObjects.Zone) as Phaser.GameObjects.Zone | undefined;
    const tile = zone?.getData('tile') as BoardTile | undefined;
    if (!tile) return;
    party[this.selected].x = tile.q;
    party[this.selected].y = tile.r;
    this.render();
  }
}

function iso(q: number, r: number, ox: number, oy: number) {
  return { x: ox + (q - r) * (TILE_W / 2), y: oy + (q + r) * (TILE_H / 2) };
}

function combatIso(row: number, col: number) {
  return { x: COMBAT_ORIGIN.x + (col - row) * 54, y: COMBAT_ORIGIN.y + (col + row) * 28 };
}

function diamond(x: number, y: number, w = TILE_W, h = TILE_H) {
  return [
    new Phaser.Math.Vector2(x, y - h / 2),
    new Phaser.Math.Vector2(x + w / 2, y),
    new Phaser.Math.Vector2(x, y + h / 2),
    new Phaser.Math.Vector2(x - w / 2, y),
  ];
}

function panelTitleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: 'Georgia, serif', fontSize: '24px', color: '#f5d38a' };
}

function smallCapsStyle(color = '#b7c3df'): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px', color, fontStyle: 'bold' };
}

function bodyStyle(color = '#dce7ff', fontSize = '14px'): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: 'Inter, system-ui, sans-serif', fontSize, color };
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: false,
  roundPixels: false,
  scene: PrototypeScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
