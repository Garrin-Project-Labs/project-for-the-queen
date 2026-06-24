import Phaser from 'phaser';
import './style.css';

type Screen = 'menu' | 'heroes' | 'board' | 'encounter' | 'combat' | 'summary';
type Terrain = 'road' | 'forest' | 'swamp' | 'mountain' | 'ruin' | 'town' | 'lava';
type StatKey = 'might' | 'awareness' | 'intellect' | 'vitality' | 'speed' | 'luck';
type EncounterKind = 'none' | 'shop' | 'ambush' | 'skill' | 'boss' | 'shrine';

type HeroClass = {
  id: string;
  name: string;
  archetype: string;
  role: string;
  quote: string;
  color: number;
  accent: number;
  hp: number;
  armor: number;
  focus: number;
  weapon: string;
  passive: string;
  stats: Record<StatKey, number>;
};

type PlayerHero = HeroClass & {
  currentHp: number;
  maxHp: number;
  guarded: boolean;
  x: number;
  y: number;
};

type BoardTile = {
  q: number;
  r: number;
  terrain: Terrain;
  label?: string;
  encounter: EncounterKind;
  resolved?: boolean;
};

type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  armor: number;
  damage: number;
  color: number;
  note: string;
  rewardGold: number;
};

type RunState = {
  day: number;
  turn: number;
  movesLeft: number;
  pressure: number;
  gold: number;
  herbs: number;
  score: number;
  log: string[];
};

const WIDTH = 1280;
const HEIGHT = 760;
const TILE_W = 146;
const TILE_H = 74;
const BOARD_ORIGIN = { x: 610, y: 162 };
const COMBAT_ORIGIN = { x: 555, y: 268 };
const START = { x: 0, y: 0 };

const theme = {
  bg: 0x07090f,
  panel: 0x111623,
  panel2: 0x171d2e,
  panel3: 0x222a3f,
  ink: '#f7efd9',
  muted: '#aab3c8',
  dim: '#68728b',
  gold: 0xd6ad55,
  brightGold: 0xf2d58a,
  red: 0xb94b4b,
  green: 0x74c97a,
  blue: 0x6da3e8,
};

const heroClasses: HeroClass[] = [
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    archetype: 'Iron Vanguard',
    role: 'Front-line shield, armor, reliable melee damage',
    quote: 'Turns bad odds into survivable odds.',
    color: 0xd9903d,
    accent: 0xffd08a,
    hp: 36,
    armor: 4,
    focus: 2,
    weapon: 'War hammer + tower shield',
    passive: 'Guard reduces the next enemy hit by an extra 4 damage.',
    stats: { might: 82, awareness: 42, intellect: 35, vitality: 88, speed: 38, luck: 46 },
  },
  {
    id: 'hunter',
    name: 'Hunter',
    archetype: 'Ranged Scout',
    role: 'High awareness, turn tempo, back-row pressure',
    quote: 'Finds the path before the path finds you.',
    color: 0x64c36b,
    accent: 0xbaf0a5,
    hp: 25,
    armor: 1,
    focus: 3,
    weapon: 'Longbow + skinning knife',
    passive: 'Ambushes start with the enemy slightly wounded.',
    stats: { might: 50, awareness: 86, intellect: 45, vitality: 55, speed: 78, luck: 61 },
  },
  {
    id: 'scholar',
    name: 'Scholar',
    archetype: 'Arcane Support',
    role: 'Magic damage, focus economy, support checks',
    quote: 'A brittle answer to impossible problems.',
    color: 0x6fa0ff,
    accent: 0xc1d6ff,
    hp: 22,
    armor: 0,
    focus: 5,
    weapon: 'Storm tome + mend charm',
    passive: 'Skill checks can spend focus for a large bonus.',
    stats: { might: 32, awareness: 58, intellect: 90, vitality: 40, speed: 52, luck: 55 },
  },
  {
    id: 'herbalist',
    name: 'Herbalist',
    archetype: 'Field Medic',
    role: 'Healing, poison control, survival support',
    quote: 'The run continues because someone packed correctly.',
    color: 0x4fb88f,
    accent: 0xb4ffe3,
    hp: 26,
    armor: 1,
    focus: 4,
    weapon: 'Oak staff + poultice satchel',
    passive: 'Starts with +1 herb and heals 2 extra from herbs.',
    stats: { might: 40, awareness: 62, intellect: 76, vitality: 66, speed: 54, luck: 59 },
  },
  {
    id: 'minstrel',
    name: 'Minstrel',
    archetype: 'Risk Bard',
    role: 'Buffs, economy, luck manipulation',
    quote: 'Makes terrible plans just good enough to try.',
    color: 0xc97adf,
    accent: 0xf0c2ff,
    hp: 24,
    armor: 1,
    focus: 4,
    weapon: 'Lute blade + charm dice',
    passive: 'Starts with extra gold and better flee odds.',
    stats: { might: 44, awareness: 56, intellect: 68, vitality: 48, speed: 64, luck: 84 },
  },
  {
    id: 'woodcutter',
    name: 'Woodcutter',
    archetype: 'Heavy Striker',
    role: 'Big melee hits, armor break, low finesse',
    quote: 'If the door has stats, they are about to be tested.',
    color: 0xc65f45,
    accent: 0xffb29f,
    hp: 33,
    armor: 2,
    focus: 2,
    weapon: 'Great axe + throwing hatchet',
    passive: 'Hits hard, but has swingy accuracy.',
    stats: { might: 91, awareness: 48, intellect: 30, vitality: 76, speed: 44, luck: 43 },
  },
];

const terrainPalette: Record<Terrain, { top: number; side: number; stroke: number; icon: string; moveCost: number }> = {
  road: { top: 0xb18a4e, side: 0x6f5433, stroke: 0x2e2319, icon: '·', moveCost: 1 },
  forest: { top: 0x2f7448, side: 0x1f4b31, stroke: 0x12291b, icon: '♣', moveCost: 1 },
  swamp: { top: 0x4a6258, side: 0x2d3e38, stroke: 0x14211e, icon: '≈', moveCost: 2 },
  mountain: { top: 0x777a80, side: 0x4a4c52, stroke: 0x24262d, icon: '▲', moveCost: 2 },
  ruin: { top: 0x82725b, side: 0x574a39, stroke: 0x2b241c, icon: '⌂', moveCost: 1 },
  town: { top: 0xcaa75c, side: 0x87633b, stroke: 0x3d2a18, icon: '◆', moveCost: 1 },
  lava: { top: 0xaa3c2c, side: 0x682019, stroke: 0x2f0f0c, icon: '!', moveCost: 2 },
};

const initialTiles: BoardTile[] = [
  { q: 0, r: 0, terrain: 'town', label: 'Haven', encounter: 'none' },
  { q: 1, r: 0, terrain: 'road', encounter: 'none' },
  { q: 2, r: 0, terrain: 'forest', label: 'Snarewood', encounter: 'ambush' },
  { q: 3, r: 0, terrain: 'ruin', label: 'Watchtower', encounter: 'skill' },
  { q: 4, r: 0, terrain: 'mountain', encounter: 'none' },
  { q: 0, r: 1, terrain: 'forest', encounter: 'shrine' },
  { q: 1, r: 1, terrain: 'road', encounter: 'none' },
  { q: 2, r: 1, terrain: 'swamp', label: 'Rot Fen', encounter: 'skill' },
  { q: 3, r: 1, terrain: 'forest', encounter: 'ambush' },
  { q: 4, r: 1, terrain: 'ruin', encounter: 'none' },
  { q: 0, r: 2, terrain: 'swamp', encounter: 'none' },
  { q: 1, r: 2, terrain: 'road', label: 'Merchant', encounter: 'shop' },
  { q: 2, r: 2, terrain: 'road', encounter: 'none' },
  { q: 3, r: 2, terrain: 'lava', label: 'Ash Pit', encounter: 'ambush' },
  { q: 4, r: 2, terrain: 'mountain', label: 'Mine Gate', encounter: 'skill' },
  { q: 0, r: 3, terrain: 'forest', encounter: 'none' },
  { q: 1, r: 3, terrain: 'ruin', encounter: 'ambush' },
  { q: 2, r: 3, terrain: 'road', encounter: 'none' },
  { q: 3, r: 3, terrain: 'mountain', encounter: 'none' },
  { q: 4, r: 3, terrain: 'lava', label: 'Tyrant Captain', encounter: 'boss' },
];

class GameScene extends Phaser.Scene {
  private screen: Screen = 'menu';
  private layer!: Phaser.GameObjects.Container;
  private selectedHeroId = 'hunter';
  private hero?: PlayerHero;
  private tiles: BoardTile[] = [];
  private run?: RunState;
  private activeTile?: BoardTile;
  private enemy?: Enemy;
  private combatLog: string[] = [];
  private lastRoll = '';
  private boardNotice = 'Reachable tiles glow gold. Click a neighboring tile to spend movement.';
  private isMoving = false;
  private heroToken?: Phaser.GameObjects.Container;

  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#07090f');
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => {
      this.screen = this.screen === 'menu' ? 'menu' : 'menu';
      this.render();
    });
    this.input.keyboard?.on('keydown-E', () => {
      if (this.screen === 'board') this.endTurn();
    });
    this.render();
  }

  private render() {
    this.heroToken = undefined;
    this.layer.removeAll(true);
    this.drawBackground();
    if (this.screen === 'menu') this.drawMainMenu();
    if (this.screen === 'heroes') this.drawHeroSelect();
    if (this.screen === 'board') this.drawBoardScreen();
    if (this.screen === 'encounter') this.drawEncounterScreen();
    if (this.screen === 'combat') this.drawCombatScreen();
    if (this.screen === 'summary') this.drawSummaryScreen();
  }

  private drawBackground() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillGradientStyle(0x07090f, 0x07090f, 0x16111d, 0x0b0f18, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 36; i++) {
      const x = 40 + ((i * 137) % 1190);
      const y = 36 + ((i * 71) % 680);
      g.fillStyle(i % 4 === 0 ? theme.gold : 0x303852, i % 4 === 0 ? 0.16 : 0.1).fillCircle(x, y, i % 4 === 0 ? 2.2 : 1.4);
    }
    g.fillStyle(0x090c13, 0.84).fillRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
    g.lineStyle(2, theme.gold, 0.45).strokeRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
    g.lineStyle(1, 0x2d3448, 0.8).strokeRoundedRect(28, 28, WIDTH - 56, HEIGHT - 56, 14);
  }

  private drawMainMenu() {
    this.drawOrnament(640, 88, 540);
    this.layer.add(text(this, 640, 104, 'FOR THE QUEEN', 58, theme.ink, 'Georgia, serif').setOrigin(0.5));
    this.layer.add(text(this, 640, 158, 'single-hero tabletop tactics run', 18, '#b9a370').setOrigin(0.5));
    this.drawMiniBoardPreview(142, 224);
    this.drawPanel(708, 218, 394, 286, 'Current Playable Loop');
    ['Pick and control one hero', 'Create a fresh run', 'Spend movement points on the board', 'Trigger shops, shrines, skill checks, ambushes', 'Resolve turn-based combat', 'Win by defeating the Tyrant Captain'].forEach((item, i) => {
      this.layer.add(text(this, 742, 270 + i * 32, `✦ ${item}`, 15, i === 0 ? '#f2d58a' : theme.muted));
    });
    this.drawButton(498, 532, 284, 58, 'New Run', () => {
      this.screen = 'heroes';
      this.render();
    }, true);
    this.drawButton(498, 606, 284, 46, 'Quick Start Hunter', () => {
      this.selectedHeroId = 'hunter';
      this.createRun();
    });
    this.layer.add(text(this, 640, 716, 'Dark UI with gold accents · E ends turn · ESC returns to menu', 13, theme.dim).setOrigin(0.5));
  }

  private drawHeroSelect() {
    this.layer.add(text(this, 52, 44, 'Choose One Hero', 38, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 54, 90, 'Players control one hero. Party mechanics may come later as AI allies or multiplayer roles.', 15, theme.muted));
    heroClasses.forEach((hero, index) => this.drawHeroCard(hero, 54 + (index % 3) * 278, 142 + Math.floor(index / 3) * 214));
    const selected = this.heroClass(this.selectedHeroId);
    this.drawPanel(914, 128, 292, 420, 'Selected Hero');
    this.layer.add(text(this, 940, 190, selected.name, 28, theme.ink, 'Georgia, serif'));
    this.layer.add(text(this, 940, 226, selected.archetype, 14, '#d5c185'));
    this.layer.add(text(this, 940, 262, selected.role, 13, theme.muted).setWordWrapWidth(230));
    this.layer.add(text(this, 940, 320, `HP ${selected.hp} · Armor ${selected.armor} · Focus ${selected.focus}`, 14, '#f2d58a'));
    this.layer.add(text(this, 940, 354, selected.weapon, 13, theme.muted).setWordWrapWidth(230));
    this.layer.add(text(this, 940, 402, selected.passive, 12, '#96a3c0').setWordWrapWidth(230));
    this.drawButton(914, 578, 292, 54, 'Create Run', () => this.createRun(), true);
    this.drawButton(914, 644, 292, 42, 'Back to Main Menu', () => {
      this.screen = 'menu';
      this.render();
    });
  }

  private drawHeroCard(hero: HeroClass, x: number, y: number) {
    const selected = this.selectedHeroId === hero.id;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(selected ? 0x252034 : theme.panel, 1).fillRoundedRect(x, y, 250, 184, 14);
    g.lineStyle(selected ? 3 : 1, selected ? theme.brightGold : 0x3a4258, 1).strokeRoundedRect(x, y, 250, 184, 14);
    g.fillStyle(hero.color, 1).fillCircle(x + 34, y + 38, 19);
    g.lineStyle(2, hero.accent, 1).strokeCircle(x + 34, y + 38, 19);
    this.layer.add(text(this, x + 66, y + 20, hero.name, 19, selected ? '#f7efd9' : '#dfe5f4', 'Georgia, serif'));
    this.layer.add(text(this, x + 66, y + 45, hero.archetype, 12, '#bca66e'));
    this.layer.add(text(this, x + 24, y + 76, hero.role, 12, theme.muted).setWordWrapWidth(202));
    this.drawTinyStats(hero, x + 24, y + 116);
    const zone = this.add.zone(x, y, 250, 184).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      this.selectedHeroId = hero.id;
      this.render();
    });
    this.layer.add(zone);
  }

  private drawBoardScreen() {
    if (!this.hero || !this.run) this.createRun(false);
    this.drawBoardMap(34, 82);
    this.drawBoardHeader();
    this.drawRunPanel(920, 104);
    this.drawBoardLegend(44, 626);
    this.drawButton(920, 624, 146, 40, 'End Turn (E)', () => this.endTurn());
    this.drawButton(1080, 624, 146, 40, 'Menu', () => {
      this.screen = 'menu';
      this.render();
    });
  }

  private drawEncounterScreen() {
    if (!this.activeTile || !this.hero || !this.run) return;
    const tile = this.activeTile;
    this.layer.add(text(this, 52, 44, 'Encounter', 38, '#f2d58a', 'Georgia, serif'));
    this.drawPanel(190, 136, 900, 470, tile.label ?? this.encounterTitle(tile.encounter));
    const body = this.drawEncounterBody(tile);
    this.layer.add(text(this, 238, 212, body, 17, theme.ink).setWordWrapWidth(790));
    this.layer.add(text(this, 238, 330, this.lastRoll || 'Choose how to resolve this stop.', 14, '#cbb783').setWordWrapWidth(760));

    if (tile.encounter === 'shop') {
      this.drawButton(252, 452, 220, 54, 'Buy Herb - 12g', () => this.buyHerb(), true, this.run.gold < 12);
      this.drawButton(500, 452, 220, 54, 'Leave Shop', () => this.resolveEncounter('You leave the merchant camp.'));
    } else if (tile.encounter === 'shrine') {
      this.drawButton(252, 452, 220, 54, 'Rest at Shrine', () => this.restShrine(), true);
      this.drawButton(500, 452, 220, 54, 'Move On', () => this.resolveEncounter('You leave the shrine untouched.'));
    } else if (tile.encounter === 'skill') {
      this.drawButton(252, 452, 220, 54, 'Attempt Check', () => this.skillCheck(), true);
      this.drawButton(500, 452, 220, 54, 'Spend 1 Focus', () => this.skillCheck(true), false, this.hero.focus <= 0);
    } else {
      this.drawButton(252, 452, 220, 54, 'Fight', () => this.startCombat(tile), true);
      this.drawButton(500, 452, 220, 54, 'Try to Sneak Past', () => this.trySneak());
    }
    this.drawCompactHeroPanel(770, 440);
  }

  private drawCombatScreen() {
    if (!this.hero || !this.run || !this.enemy) return;
    this.layer.add(text(this, 52, 44, 'Combat Resolution', 36, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 54, 88, 'Resolve attacks turn by turn. This is basic but already playable: attack, guard, heal, flee.', 14, theme.muted));
    this.drawCombatGrid();
    this.drawCombatSidePanel(914, 86);
    this.drawActionBar(78, 598);
  }

  private drawSummaryScreen() {
    const won = !!this.hero && this.hero.currentHp > 0 && this.activeTile?.encounter === 'boss' && this.activeTile.resolved;
    this.layer.add(text(this, 640, 128, won ? 'Run Complete' : 'Run Over', 54, won ? '#f2d58a' : '#e08778', 'Georgia, serif').setOrigin(0.5));
    this.drawPanel(340, 218, 600, 300, won ? 'The Tyrant Captain Falls' : 'The Road Claims Another Hero');
    this.layer.add(text(this, 386, 292, won ? 'You cleared the first playable objective. The next layer should add deeper loot, level-ups, and more encounter chains.' : 'You were defeated. The next layer should add meta progression and restart bonuses.', 17, theme.ink).setWordWrapWidth(510));
    this.layer.add(text(this, 386, 378, `Score: ${this.run?.score ?? 0} · Gold: ${this.run?.gold ?? 0} · Day: ${this.run?.day ?? 1}`, 18, '#f2d58a'));
    this.drawButton(498, 570, 284, 56, 'New Run', () => {
      this.screen = 'heroes';
      this.render();
    }, true);
  }

  private drawBoardMap(x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x0d131f, 0.98).fillRoundedRect(x, y, 1212, 614, 20);
    g.lineStyle(1, theme.gold, 0.42).strokeRoundedRect(x, y, 1212, 614, 20);
    g.fillStyle(0x05070d, 0.48).fillEllipse(622, 494, 940, 250);
    g.fillStyle(0x111b2b, 0.48).fillEllipse(610, 358, 760, 230);
    this.drawBoardPath();
    this.tiles.forEach((tile) => this.drawIsoTile(tile));
    this.drawBoardEvents();
    if (this.hero) this.drawHeroToken(this.hero);
  }

  private drawIsoTile(tile: BoardTile) {
    const p = boardPoint(tile.q, tile.r);
    const palette = terrainPalette[tile.terrain];
    const g = this.add.graphics();
    this.layer.add(g);
    const points = diamond(p.x, p.y);
    const reachable = this.hero ? this.isReachable(tile) : false;
    const occupied = !!this.hero && tile.q === this.hero.x && tile.r === this.hero.y;
    const dim = !reachable && !occupied && this.run?.movesLeft === 0;
    g.fillStyle(palette.side, dim ? 0.55 : 1).fillPoints([
      new Phaser.Math.Vector2(points[1].x, points[1].y),
      new Phaser.Math.Vector2(points[2].x, points[2].y),
      new Phaser.Math.Vector2(points[2].x, points[2].y + 24),
      new Phaser.Math.Vector2(points[1].x, points[1].y + 24),
    ], true);
    g.fillStyle(palette.top, tile.resolved ? 0.58 : dim ? 0.5 : 1).fillPoints(points, true);
    g.lineStyle(reachable ? 4 : occupied ? 3 : 2, reachable ? theme.brightGold : occupied ? 0xffffff : palette.stroke, reachable || occupied ? 1 : 0.82).strokePoints(points, true);
    if (reachable) {
      g.fillStyle(theme.brightGold, 0.16).fillPoints(points, true);
      g.fillStyle(theme.brightGold, 1).fillCircle(p.x, p.y + 7, 4);
    }
    this.layer.add(text(this, p.x - 8, p.y - 25, palette.icon, 24, '#10131a'));
    if (tile.label) this.drawLocationLabel(tile, p.x, p.y + 46);
    const hit = this.add.zone(p.x, p.y, TILE_W, TILE_H).setOrigin(0.5).setInteractive({ useHandCursor: reachable });
    hit.on('pointerdown', () => this.moveTo(tile));
    this.layer.add(hit);
  }

  private drawBoardPath() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(5, theme.gold, 0.3);
    const route = [boardPoint(0, 0), boardPoint(1, 1), boardPoint(2, 2), boardPoint(3, 3), boardPoint(4, 3)];
    for (let i = 0; i < route.length - 1; i++) g.lineBetween(route[i].x, route[i].y, route[i + 1].x, route[i + 1].y);
  }

  private drawBoardEvents() {
    this.tiles.filter((tile) => tile.encounter !== 'none' && !tile.resolved).forEach((tile) => {
      const p = boardPoint(tile.q, tile.r);
      this.drawPoiMarker(tile, p.x, p.y);
    });
  }

  private drawHeroToken(hero: PlayerHero) {
    const p = boardPoint(hero.x, hero.y);
    const token = this.add.container(p.x, p.y);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45).fillEllipse(0, -2, 48, 16);
    g.fillStyle(hero.color, 1).fillCircle(0, -44, 22);
    g.lineStyle(4, theme.brightGold, 1).strokeCircle(0, -44, 22);
    g.lineStyle(1, 0xffffff, 0.75).strokeCircle(0, -44, 15);
    const label = text(this, -36, -88, hero.name, 12, '#f9f3df').setShadow(1, 1, '#000', 2);
    token.add([g, label]);
    this.heroToken = token;
    this.layer.add(token);
  }

  private drawRunPanel(x: number, y: number) {
    if (!this.hero || !this.run) return;
    this.drawPanel(x, y, 306, 214, 'Run State');
    this.layer.add(text(this, x + 24, y + 62, `Day ${this.run.day} · Turn ${this.run.turn} · Moves ${this.run.movesLeft}`, 15, theme.ink));
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x06080d, 1).fillRoundedRect(x + 24, y + 96, 250, 16, 8);
    g.fillStyle(theme.red, 1).fillRoundedRect(x + 24, y + 96, Math.min(250, this.run.pressure * 25), 16, 8);
    this.layer.add(text(this, x + 24, y + 120, `Pressure ${this.run.pressure}/10`, 11, theme.muted));
    this.layer.add(text(this, x + 24, y + 148, `${this.hero.name} · HP ${this.hero.currentHp}/${this.hero.maxHp} · AR ${this.hero.armor}`, 13, '#d5c185'));
    this.layer.add(text(this, x + 24, y + 174, `Gold ${this.run.gold} · Herbs ${this.run.herbs} · Score ${this.run.score}`, 12, theme.muted));
  }

  private drawBoardHeader() {
    if (!this.run) return;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x080b12, 0.78).fillRoundedRect(44, 38, 1182, 46, 14);
    g.lineStyle(1, theme.gold, 0.28).strokeRoundedRect(44, 38, 1182, 46, 14);
    this.layer.add(text(this, 66, 47, 'Expedition Board', 28, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 330, 55, this.boardNotice, 14, theme.muted).setWordWrapWidth(560));
  }

  private drawBoardLegend(x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x080b12, 0.82).fillRoundedRect(x, y, 832, 58, 14);
    g.lineStyle(1, theme.gold, 0.28).strokeRoundedRect(x, y, 832, 58, 14);
    const items: [EncounterKind, string][] = [['shop', 'Shop'], ['shrine', 'Shrine'], ['skill', 'Check'], ['ambush', 'Ambush'], ['boss', 'Boss']];
    items.forEach(([kind, label], i) => {
      const xx = x + 22 + i * 112;
      this.drawPoiGlyph(kind, xx, y + 30, 0.8);
      this.layer.add(text(this, xx + 20, y + 22, label, 12, theme.muted));
    });
    this.layer.add(text(this, x + 598, y + 14, 'Gold outlines = reachable now. Terrain costs 1-2 movement.', 12, '#cbb783').setWordWrapWidth(206));
  }

  private drawLocationLabel(tile: BoardTile, x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    const label = tile.label ?? '';
    const w = Math.max(54, label.length * 7 + 18);
    g.fillStyle(0x06080d, 0.72).fillRoundedRect(x - w / 2, y, w, 20, 8);
    g.lineStyle(1, 0x2c3347, 0.9).strokeRoundedRect(x - w / 2, y, w, 20, 8);
    this.layer.add(text(this, x, y + 4, label, 11, '#f5e7c0').setOrigin(0.5, 0));
  }

  private drawPoiMarker(tile: BoardTile, x: number, y: number) {
    const offset = this.poiOffset(tile);
    const px = x + offset.x;
    const py = y + offset.y;
    const color = this.poiColor(tile.encounter);
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(2, color, 0.5).lineBetween(x, y - 30, px, py + 18);
    const label = this.poiLabel(tile.encounter);
    const w = tile.encounter === 'boss' ? 112 : 92;
    g.fillStyle(0x05070d, 0.96).fillRoundedRect(px - w / 2, py - 20, w, 40, 12);
    g.lineStyle(2, color, 1).strokeRoundedRect(px - w / 2, py - 20, w, 40, 12);
    g.fillStyle(color, 0.18).fillRoundedRect(px - w / 2 + 3, py - 17, w - 6, 34, 10);
    this.drawPoiGlyph(tile.encounter, px - w / 2 + 18, py + 2, 0.95);
    this.layer.add(text(this, px - w / 2 + 34, py - 8, label, 12, '#f7efd9').setShadow(1, 1, '#000', 2));
    if (tile.label && tile.encounter === 'boss') this.layer.add(text(this, px - w / 2 + 34, py + 6, tile.label, 9, '#cbb783').setShadow(1, 1, '#000', 2));
  }

  private drawPoiGlyph(kind: EncounterKind, x: number, y: number, scale: number) {
    const color = this.poiColor(kind);
    const glyph = kind === 'shop' ? '$' : kind === 'shrine' ? '+' : kind === 'skill' ? '?' : kind === 'boss' ? 'X' : '!';
    this.layer.add(text(this, x, y - 9 * scale, glyph, Math.round(18 * scale), numberToHex(color)).setOrigin(0.5));
  }

  private poiOffset(tile: BoardTile) {
    if (tile.encounter === 'shop') return { x: -92, y: -92 };
    if (tile.encounter === 'shrine') return { x: -96, y: -86 };
    if (tile.encounter === 'boss') return { x: 118, y: -92 };
    if (tile.encounter === 'skill') {
      if (tile.q === 3 && tile.r === 0) return { x: 108, y: -96 };
      if (tile.q === 4 && tile.r === 2) return { x: 116, y: -54 };
      return { x: 4, y: -112 };
    }
    if (tile.q <= 2) return { x: -112, y: -72 };
    if (tile.r >= 2) return { x: -112, y: -70 };
    return { x: 108, y: -78 };
  }

  private poiLabel(kind: EncounterKind) {
    return kind === 'shop' ? 'SHOP' : kind === 'shrine' ? 'SHRINE' : kind === 'skill' ? 'CHECK' : kind === 'boss' ? 'BOSS' : 'AMBUSH';
  }

  private poiColor(kind: EncounterKind) {
    return kind === 'shop' ? theme.blue : kind === 'shrine' ? theme.green : kind === 'skill' ? theme.gold : theme.red;
  }

  private drawEncounterBody(tile: BoardTile) {
    if (tile.encounter === 'shop') return 'A lantern-lit merchant wagon blocks the road. The prices are bad, but the road ahead is worse.';
    if (tile.encounter === 'shrine') return 'A cracked shrine hums with old warmth. Resting here can restore health without spending supplies.';
    if (tile.encounter === 'skill') return 'The path is blocked by a hazard. Roll against your best relevant stat to claim the reward without paying in blood.';
    if (tile.encounter === 'boss') return 'The Tyrant Captain waits at the mine gate. Defeat this enemy to complete the first playable run.';
    return 'An enemy patrol springs from the terrain. Fight, or gamble on slipping away before steel comes out.';
  }

  private drawCompactHeroPanel(x: number, y: number) {
    if (!this.hero || !this.run) return;
    this.layer.add(text(this, x, y, `${this.hero.name}: HP ${this.hero.currentHp}/${this.hero.maxHp}`, 15, theme.ink));
    this.layer.add(text(this, x, y + 30, `Gold ${this.run.gold} · Herbs ${this.run.herbs} · Focus ${this.hero.focus}`, 13, theme.muted));
  }

  private drawCombatGrid() {
    if (!this.hero || !this.enemy) return;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x101521, 0.96).fillRoundedRect(48, 118, 800, 456, 18);
    g.lineStyle(1, theme.gold, 0.38).strokeRoundedRect(48, 118, 800, 456, 18);
    g.fillStyle(0x000000, 0.44).fillEllipse(445, 374, 710, 230);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) this.drawCombatTile(row, col);
    this.drawCombatUnit({ name: this.hero.name, kind: 'hero', hp: this.hero.currentHp, maxHp: this.hero.maxHp, row: 1, col: 0, color: this.hero.color, note: this.hero.weapon });
    this.drawCombatUnit({ ...this.enemy, kind: 'enemy', row: 1, col: 4 } as Enemy & { kind: 'enemy'; row: number; col: number });
  }

  private drawCombatTile(row: number, col: number) {
    const p = combatIso(row, col);
    const heroSide = col < 2;
    const g = this.add.graphics();
    this.layer.add(g);
    const points = diamond(p.x, p.y, 104, 52);
    g.fillStyle(heroSide ? 0x263149 : 0x3a2630, 1).fillPoints(points, true);
    g.lineStyle(2, heroSide ? 0x64728f : 0x7d4d5b, 0.9).strokePoints(points, true);
    if (col === 2) g.lineStyle(3, theme.gold, 0.35).strokePoints(points, true);
  }

  private drawCombatUnit(unit: { name: string; kind: 'hero' | 'enemy'; hp: number; maxHp: number; row: number; col: number; color: number; note: string }) {
    const p = combatIso(unit.row, unit.col);
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x000000, 0.4).fillEllipse(p.x, p.y + 25, 46, 14);
    g.fillStyle(unit.color, 1).fillRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.lineStyle(2, unit.kind === 'hero' ? theme.brightGold : 0xff8c7a, 1).strokeRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.fillStyle(0x171923, 1).fillRect(p.x - 10, p.y - 31, 6, 6);
    g.fillRect(p.x + 5, p.y - 31, 6, 6);
    g.fillStyle(0x10131d, 1).fillRoundedRect(p.x - 42, p.y + 8, 84, 9, 5);
    g.fillStyle(unit.kind === 'hero' ? theme.green : theme.red, 1).fillRoundedRect(p.x - 42, p.y + 8, 84 * Math.max(0, unit.hp / unit.maxHp), 9, 5);
    this.layer.add(text(this, p.x - 48, p.y + 24, unit.name, 12, '#f4f0df').setShadow(1, 1, '#000', 2));
    this.layer.add(text(this, p.x - 42, p.y + 42, `${unit.hp}/${unit.maxHp} · ${unit.note}`, 10, '#acb8d6').setShadow(1, 1, '#000', 2));
  }

  private drawCombatSidePanel(x: number, y: number) {
    if (!this.hero || !this.enemy || !this.run) return;
    this.drawPanel(x, y, 292, 518, 'Combat State');
    this.layer.add(text(this, x + 24, y + 64, `${this.hero.name} vs ${this.enemy.name}`, 16, theme.ink));
    this.layer.add(text(this, x + 24, y + 96, `Enemy: HP ${this.enemy.hp}/${this.enemy.maxHp} · AR ${this.enemy.armor}`, 13, '#e6a49b'));
    this.layer.add(text(this, x + 24, y + 126, `Hero: HP ${this.hero.currentHp}/${this.hero.maxHp} · AR ${this.hero.armor}`, 13, '#bde5bf'));
    this.layer.add(text(this, x + 24, y + 172, 'Combat Log', 12, '#d5c185'));
    this.combatLog.slice(-8).forEach((line, i) => this.layer.add(text(this, x + 24, y + 202 + i * 30, `• ${line}`, 11, '#aab3c8').setWordWrapWidth(238)));
  }

  private drawActionBar(x: number, y: number) {
    this.drawButton(x, y, 150, 48, 'Attack', () => this.playerAttack(), true);
    this.drawButton(x + 168, y, 150, 48, 'Guard', () => this.playerGuard());
    this.drawButton(x + 336, y, 150, 48, 'Use Herb', () => this.useHerb(), false, !this.run || this.run.herbs <= 0);
    this.drawButton(x + 504, y, 150, 48, 'Flee', () => this.fleeCombat());
  }

  private createRun(render = true) {
    const base = this.heroClass(this.selectedHeroId);
    this.hero = { ...base, maxHp: base.hp, currentHp: base.hp, guarded: false, x: START.x, y: START.y };
    this.tiles = initialTiles.map((tile) => ({ ...tile, resolved: tile.encounter === 'none' }));
    this.run = {
      day: 1,
      turn: 1,
      movesLeft: 3,
      pressure: 0,
      gold: base.id === 'minstrel' ? 30 : 18,
      herbs: base.id === 'herbalist' ? 3 : 2,
      score: 0,
      log: [`${base.name} leaves Haven alone.`],
    };
    this.activeTile = undefined;
    this.enemy = undefined;
    this.combatLog = [];
    this.lastRoll = '';
    this.screen = 'board';
    if (render) this.render();
  }

  private moveTo(tile: BoardTile) {
    if (!this.hero || !this.run || this.isMoving) return;
    const cost = terrainPalette[tile.terrain].moveCost;
    if (!this.isReachable(tile)) {
      this.boardNotice = tile.q === this.hero.x && tile.r === this.hero.y ? 'You are already standing here.' : this.run.movesLeft <= 0 ? 'No movement left. End the turn to refresh movement.' : 'That tile is out of reach this turn. Gold outlines show valid moves.';
      this.render();
      return;
    }

    const from = boardPoint(this.hero.x, this.hero.y);
    const to = boardPoint(tile.q, tile.r);
    this.run.movesLeft -= cost;
    this.boardNotice = `Travelling to ${tile.label ?? tile.terrain}...`;
    this.addLog(`Moved to ${tile.label ?? tile.terrain} (-${cost} move).`);
    this.isMoving = true;
    this.screen = 'board';
    this.render();
    this.drawMovementTrail(from, to);

    const token = this.heroToken;
    if (!token) {
      this.finishMove(tile);
      return;
    }
    this.tweens.add({
      targets: token,
      x: to.x,
      y: to.y,
      duration: 420,
      ease: 'Sine.easeInOut',
      onComplete: () => this.finishMove(tile),
    });
  }

  private drawMovementTrail(from: { x: number; y: number }, to: { x: number; y: number }) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(5, 0xffffff, 0.75).lineBetween(from.x, from.y - 44, to.x, to.y - 44);
    g.lineStyle(2, theme.brightGold, 0.95).lineBetween(from.x, from.y - 44, to.x, to.y - 44);
    this.tweens.add({ targets: g, alpha: 0, duration: 520, ease: 'Sine.easeOut', onComplete: () => g.destroy() });
  }

  private finishMove(tile: BoardTile) {
    if (!this.hero || !this.run) return;
    this.hero.x = tile.q;
    this.hero.y = tile.r;
    this.isMoving = false;
    this.boardNotice = `Arrived at ${tile.label ?? tile.terrain}. ${this.run.movesLeft} movement remaining.`;
    if (tile.encounter !== 'none' && !tile.resolved) {
      this.activeTile = tile;
      this.lastRoll = '';
      this.screen = 'encounter';
    }
    this.render();
  }

  private isReachable(tile: BoardTile) {
    if (!this.hero || !this.run) return false;
    if (tile.q === this.hero.x && tile.r === this.hero.y) return false;
    const adjacent = Math.abs(tile.q - this.hero.x) <= 1 && Math.abs(tile.r - this.hero.y) <= 1 && Math.abs((tile.q - tile.r) - (this.hero.x - this.hero.y)) <= 2;
    return adjacent && terrainPalette[tile.terrain].moveCost <= this.run.movesLeft;
  }

  private endTurn() {
    if (!this.run || !this.hero) return;
    this.run.turn += 1;
    if (this.run.turn % 3 === 1) this.run.day += 1;
    this.run.movesLeft = 3 + (this.hero.stats.speed >= 75 ? 1 : 0);
    this.run.pressure = Math.min(10, this.run.pressure + 1);
    this.boardNotice = 'New turn. Movement refreshed; pressure rises.';
    if (this.run.pressure >= 10) {
      const damage = 3;
      this.hero.currentHp -= damage;
      this.addLog(`Pressure bites: ${damage} damage from spreading patrols.`);
      if (this.hero.currentHp <= 0) {
        this.screen = 'summary';
        this.render();
        return;
      }
    } else {
      this.addLog('Turn ended. Movement refreshed; pressure rises.');
    }
    this.screen = 'board';
    this.render();
  }

  private buyHerb() {
    if (!this.run) return;
    if (this.run.gold < 12) return;
    this.run.gold -= 12;
    this.run.herbs += 1;
    this.resolveEncounter('Bought one herb.');
  }

  private restShrine() {
    if (!this.hero) return;
    const heal = 8;
    this.hero.currentHp = Math.min(this.hero.maxHp, this.hero.currentHp + heal);
    this.resolveEncounter(`The shrine restores ${heal} HP.`);
  }

  private skillCheck(spendFocus = false) {
    if (!this.hero || !this.run || !this.activeTile) return;
    const stat = Math.max(this.hero.stats.awareness, this.hero.stats.intellect, this.hero.stats.luck);
    const bonus = spendFocus && this.hero.focus > 0 ? 20 : 0;
    if (spendFocus) this.hero.focus -= 1;
    const roll = Phaser.Math.Between(1, 100);
    const target = Math.min(95, stat + bonus - this.run.pressure * 2);
    const success = roll <= target;
    this.lastRoll = `Rolled ${roll} vs ${target}${spendFocus ? ' after spending focus' : ''}.`;
    if (success) {
      this.run.gold += 10;
      this.run.score += 15;
      this.resolveEncounter(`${this.lastRoll} Success: gained 10 gold and reduced pressure.`);
      this.run.pressure = Math.max(0, this.run.pressure - 1);
    } else {
      const damage = 5;
      this.hero.currentHp -= damage;
      this.resolveEncounter(`${this.lastRoll} Failure: took ${damage} damage.`);
      if (this.hero.currentHp <= 0) this.screen = 'summary';
    }
  }

  private trySneak() {
    if (!this.hero || !this.run || !this.activeTile) return;
    const roll = Phaser.Math.Between(1, 100);
    const target = Math.min(85, this.hero.stats.awareness * 0.55 + this.hero.stats.luck * 0.35 + (this.hero.id === 'minstrel' ? 10 : 0));
    if (roll <= target) {
      this.resolveEncounter(`Sneak succeeded (${roll} vs ${Math.round(target)}). Encounter bypassed.`);
      this.run.score += 8;
    } else {
      this.lastRoll = `Sneak failed (${roll} vs ${Math.round(target)}).`;
      this.startCombat(this.activeTile);
    }
  }

  private startCombat(tile: BoardTile) {
    if (!this.hero || !this.run) return;
    this.activeTile = tile;
    this.enemy = this.enemyFor(tile);
    if (this.hero.id === 'hunter' && tile.encounter === 'ambush') this.enemy.hp = Math.max(1, this.enemy.hp - 3);
    this.combatLog = [`${this.enemy.name} engages ${this.hero.name}.`];
    this.screen = 'combat';
    this.render();
  }

  private playerAttack() {
    if (!this.hero || !this.enemy) return;
    const roll = Phaser.Math.Between(1, 100);
    const accuracy = this.hero.id === 'woodcutter' ? 68 : 78;
    if (roll <= accuracy) {
      const base = Math.round(this.hero.stats.might / 12 + (this.hero.stats.intellect > 80 ? 3 : 0));
      const damage = Math.max(1, base + Phaser.Math.Between(0, 4) - this.enemy.armor);
      this.enemy.hp -= damage;
      this.combatLog.push(`Hit for ${damage} damage (${roll} vs ${accuracy}).`);
      if (this.enemy.hp <= 0) {
        this.winCombat();
        return;
      }
    } else {
      this.combatLog.push(`Missed (${roll} vs ${accuracy}).`);
    }
    this.enemyTurn();
  }

  private playerGuard() {
    if (!this.hero) return;
    this.hero.guarded = true;
    this.combatLog.push('Guarded: next hit reduced.');
    this.enemyTurn();
  }

  private useHerb() {
    if (!this.hero || !this.run || this.run.herbs <= 0) return;
    const heal = this.hero.id === 'herbalist' ? 11 : 9;
    this.run.herbs -= 1;
    this.hero.currentHp = Math.min(this.hero.maxHp, this.hero.currentHp + heal);
    this.combatLog.push(`Used herb: healed ${heal} HP.`);
    this.enemyTurn();
  }

  private fleeCombat() {
    if (!this.hero || !this.run || !this.enemy) return;
    const roll = Phaser.Math.Between(1, 100);
    const target = this.hero.id === 'minstrel' ? 68 : 48;
    if (roll <= target) {
      this.combatLog.push(`Fled successfully (${roll} vs ${target}).`);
      this.addLog(`Fled from ${this.enemy.name}.`);
      this.screen = 'board';
      this.enemy = undefined;
      this.render();
    } else {
      this.combatLog.push(`Failed to flee (${roll} vs ${target}).`);
      this.enemyTurn();
    }
  }

  private enemyTurn() {
    if (!this.hero || !this.enemy || !this.run) return;
    let damage = Math.max(1, this.enemy.damage - this.hero.armor);
    if (this.hero.guarded) {
      damage = Math.max(0, damage - (this.hero.id === 'blacksmith' ? 6 : 3));
      this.hero.guarded = false;
    }
    this.hero.currentHp -= damage;
    this.combatLog.push(`${this.enemy.name} hits for ${damage}.`);
    if (this.hero.currentHp <= 0) {
      this.hero.currentHp = 0;
      this.addLog(`${this.hero.name} was defeated by ${this.enemy.name}.`);
      this.screen = 'summary';
    }
    this.render();
  }

  private winCombat() {
    if (!this.enemy || !this.run || !this.activeTile) return;
    this.run.gold += this.enemy.rewardGold;
    this.run.score += this.activeTile.encounter === 'boss' ? 100 : 25;
    this.activeTile.resolved = true;
    this.addLog(`Defeated ${this.enemy.name}; gained ${this.enemy.rewardGold} gold.`);
    const bossWon = this.activeTile.encounter === 'boss';
    this.enemy = undefined;
    this.screen = bossWon ? 'summary' : 'board';
    this.render();
  }

  private resolveEncounter(message: string) {
    if (this.activeTile) this.activeTile.resolved = true;
    this.addLog(message);
    this.screen = 'board';
    this.render();
  }

  private enemyFor(tile: BoardTile): Enemy {
    if (tile.encounter === 'boss') return { id: 'captain', name: 'Tyrant Captain', hp: 34, maxHp: 34, armor: 3, damage: 9, color: 0xc94c3f, note: 'Boss', rewardGold: 35 };
    if (tile.terrain === 'lava') return { id: 'ashling', name: 'Ashling Brute', hp: 24, maxHp: 24, armor: 2, damage: 8, color: 0xd97145, note: 'Burning', rewardGold: 18 };
    if (tile.terrain === 'ruin') return { id: 'bone', name: 'Bone Archer', hp: 16, maxHp: 16, armor: 1, damage: 6, color: 0xe4e0ca, note: 'Ranged', rewardGold: 12 };
    return { id: 'goblin', name: 'Goblin Guard', hp: 18, maxHp: 18, armor: 1, damage: 6, color: 0xb7d567, note: 'Patrol', rewardGold: 10 };
  }

  private addLog(line: string) {
    if (!this.run) return;
    this.run.log.push(line);
  }

  private heroClass(id: string) {
    return heroClasses.find((hero) => hero.id === id) ?? heroClasses[0];
  }

  private encounterTitle(kind: EncounterKind) {
    return kind === 'shop' ? 'Roadside Merchant' : kind === 'skill' ? 'Hazard Check' : kind === 'boss' ? 'Boss Encounter' : kind === 'shrine' ? 'Old Shrine' : 'Ambush';
  }

  private drawTinyStats(hero: HeroClass, x: number, y: number) {
    const entries: [StatKey, string][] = [['might', 'MGT'], ['awareness', 'AWR'], ['intellect', 'INT'], ['vitality', 'VIT'], ['speed', 'SPD'], ['luck', 'LCK']];
    entries.forEach(([key, label], index) => {
      const yy = y + index * 10;
      const value = hero.stats[key];
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x070a11, 0.7).fillRoundedRect(x + 42, yy + 1, 120, 5, 3);
      g.fillStyle(value >= 80 ? theme.gold : 0x617095, 0.95).fillRoundedRect(x + 42, yy + 1, Math.round(value * 1.2), 5, 3);
      this.layer.add(text(this, x, yy - 3, label, 8, '#8994ac'));
    });
  }

  private drawPanel(x: number, y: number, w: number, h: number, title: string) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(theme.panel, 0.96).fillRoundedRect(x, y, w, h, 14);
    g.lineStyle(1, theme.gold, 0.5).strokeRoundedRect(x, y, w, h, 14);
    g.fillStyle(0x0b0e16, 0.5).fillRoundedRect(x + 12, y + 12, w - 24, 36, 10);
    this.layer.add(text(this, x + 24, y + 20, title, 20, '#f2d58a', 'Georgia, serif'));
  }

  private drawButton(x: number, y: number, w: number, h: number, label: string, onClick: () => void, primary = false, disabled = false) {
    const g = this.add.graphics();
    this.layer.add(g);
    const fill = disabled ? 0x121723 : primary ? 0x5b421f : 0x171d2e;
    const stroke = disabled ? 0x31384a : primary ? theme.brightGold : theme.gold;
    g.fillStyle(fill, disabled ? 0.62 : 1).fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(primary ? 2 : 1, stroke, disabled ? 0.35 : 0.9).strokeRoundedRect(x, y, w, h, 12);
    this.layer.add(text(this, x + w / 2, y + h / 2 - 8, label, primary ? 18 : 14, disabled ? '#667087' : primary ? '#fff0bf' : '#f7efd9').setOrigin(0.5, 0));
    const zone = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: !disabled });
    if (!disabled) zone.on('pointerdown', onClick);
    this.layer.add(zone);
  }

  private drawOrnament(cx: number, y: number, width: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(1, theme.gold, 0.65).lineBetween(cx - width / 2, y, cx - 70, y);
    g.lineBetween(cx + 70, y, cx + width / 2, y);
    g.fillStyle(theme.gold, 1).fillCircle(cx, y, 4);
    g.lineStyle(1, theme.gold, 0.8).strokeCircle(cx, y, 14);
  }

  private drawMiniBoardPreview(x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x101521, 0.95).fillRoundedRect(x, y, 440, 244, 18);
    g.lineStyle(1, theme.gold, 0.38).strokeRoundedRect(x, y, 440, 244, 18);
    const ox = x + 220;
    const oy = y + 84;
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) {
      const p = iso(q, r, ox, oy);
      const palette = terrainPalette[(q + r) % 5 === 0 ? 'town' : (q + r) % 3 === 0 ? 'forest' : (q + r) % 4 === 0 ? 'ruin' : 'road'];
      g.fillStyle(palette.top, 1).fillPoints(diamond(p.x, p.y, 70, 35), true);
      g.lineStyle(1, palette.stroke, 0.8).strokePoints(diamond(p.x, p.y, 70, 35), true);
    }
    this.layer.add(text(this, x + 32, y + 28, 'Playable vertical slice', 25, theme.ink, 'Georgia, serif'));
    this.layer.add(text(this, x + 34, y + 68, 'One hero. One small board. Real turns, movement points, encounters, combat, rewards, failure, and a boss objective.', 14, theme.muted).setWordWrapWidth(360));
  }
}

function iso(q: number, r: number, ox: number, oy: number) {
  return { x: ox + (q - r) * (TILE_W / 2), y: oy + (q + r) * (TILE_H / 2) };
}

function boardPoint(q: number, r: number) {
  return iso(q, r, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52);
}

function combatIso(row: number, col: number) {
  return { x: COMBAT_ORIGIN.x + (col - row) * 54, y: COMBAT_ORIGIN.y + (col + row) * 28 };
}

function diamond(x: number, y: number, w = TILE_W, h = TILE_H) {
  return [new Phaser.Math.Vector2(x, y - h / 2), new Phaser.Math.Vector2(x + w / 2, y), new Phaser.Math.Vector2(x, y + h / 2), new Phaser.Math.Vector2(x - w / 2, y)];
}

function numberToHex(value: number) {
  return `#${value.toString(16).padStart(6, '0')}`;
}

function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, family = 'Inter, system-ui, sans-serif') {
  return scene.add.text(x, y, value, { fontFamily: family, fontSize: `${size}px`, color, lineSpacing: 5 });
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: false,
  roundPixels: false,
  scene: GameScene,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
