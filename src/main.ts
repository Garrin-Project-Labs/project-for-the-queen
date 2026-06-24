import Phaser from 'phaser';
import './style.css';

type Screen = 'menu' | 'heroes' | 'board' | 'combat';
type Terrain = 'road' | 'forest' | 'swamp' | 'mountain' | 'ruin' | 'town' | 'lava';
type StatKey = 'might' | 'awareness' | 'intellect' | 'vitality' | 'speed' | 'luck';

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

type PartyMember = HeroClass & {
  currentHp: number;
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
  kind: 'hero' | 'enemy';
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
const MAX_PARTY = 3;

const theme = {
  bg: 0x07090f,
  panel: 0x111623,
  panel2: 0x171d2e,
  panel3: 0x202840,
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
    passive: 'Guarded allies in the back row take reduced first-hit damage.',
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
    passive: 'First overworld ambush each day has a lower success chance.',
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
    passive: 'Once per combat, convert a failed intellect roll into partial success.',
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
    passive: 'Healing consumables restore a small amount to adjacent allies.',
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
    passive: 'Party gains a small shop discount and improved flee odds.',
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
    passive: 'Critical melee hits apply armor break.',
    stats: { might: 91, awareness: 48, intellect: 30, vitality: 76, speed: 44, luck: 43 },
  },
];

const terrainPalette: Record<Terrain, { top: number; side: number; stroke: number; icon: string }> = {
  road: { top: 0xb18a4e, side: 0x6f5433, stroke: 0x2e2319, icon: '·' },
  forest: { top: 0x2f7448, side: 0x1f4b31, stroke: 0x12291b, icon: '♣' },
  swamp: { top: 0x4a6258, side: 0x2d3e38, stroke: 0x14211e, icon: '≈' },
  mountain: { top: 0x777a80, side: 0x4a4c52, stroke: 0x24262d, icon: '▲' },
  ruin: { top: 0x82725b, side: 0x574a39, stroke: 0x2b241c, icon: '⌂' },
  town: { top: 0xcaa75c, side: 0x87633b, stroke: 0x3d2a18, icon: '◆' },
  lava: { top: 0xaa3c2c, side: 0x682019, stroke: 0x2f0f0c, icon: '!' },
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

class GameScene extends Phaser.Scene {
  private screen: Screen = 'menu';
  private layer!: Phaser.GameObjects.Container;
  private selectedHeroIds = new Set<string>();
  private party: PartyMember[] = [];
  private selectedPartyIndex = 0;
  private notice = 'Choose three heroes to begin.';

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
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.screen === 'board') this.screen = 'combat';
      else if (this.screen === 'combat') this.screen = 'board';
      this.render();
    });
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.party.length > 0) this.selectedPartyIndex = (this.selectedPartyIndex + 1) % this.party.length;
      this.render();
    });
    this.render();
  }

  private render() {
    this.layer.removeAll(true);
    this.drawBackground();
    if (this.screen === 'menu') this.drawMainMenu();
    if (this.screen === 'heroes') this.drawHeroSelect();
    if (this.screen === 'board') this.drawBoardScreen();
    if (this.screen === 'combat') this.drawCombatScreen();
  }

  private drawBackground() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillGradientStyle(0x07090f, 0x07090f, 0x15101a, 0x0b0f18, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < 36; i++) {
      const x = 40 + ((i * 137) % 1190);
      const y = 36 + ((i * 71) % 680);
      g.fillStyle(i % 4 === 0 ? theme.gold : 0x303852, i % 4 === 0 ? 0.16 : 0.1);
      g.fillCircle(x, y, i % 4 === 0 ? 2.2 : 1.4);
    }

    g.fillStyle(0x090c13, 0.84);
    g.fillRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
    g.lineStyle(2, theme.gold, 0.45);
    g.strokeRoundedRect(18, 18, WIDTH - 36, HEIGHT - 36, 18);
    g.lineStyle(1, 0x2d3448, 0.8);
    g.strokeRoundedRect(28, 28, WIDTH - 56, HEIGHT - 56, 14);
  }

  private drawMainMenu() {
    this.drawOrnament(640, 88, 540);
    this.layer.add(text(this, 640, 104, 'FOR THE QUEEN', 58, theme.ink, 'Georgia, serif').setOrigin(0.5));
    this.layer.add(text(this, 640, 158, 'a dark tabletop tactics adventure', 18, '#b9a370').setOrigin(0.5));

    this.drawMiniBoardPreview(142, 224);

    this.drawPanel(708, 218, 394, 250, 'Design Direction');
    this.layer.add(text(this, 736, 268, 'Start with the PLAN.md pillars:', 16, theme.ink));
    const bullets = [
      'Party-first adventure',
      'Readable tabletop turns',
      'Risk-driven movement',
      'Chance with mitigation',
      'Compact tactical combat',
      'Meaningful inventory pressure',
    ];
    bullets.forEach((item, i) => {
      this.layer.add(text(this, 748, 304 + i * 26, `✦ ${item}`, 14, i === 0 ? '#f2d58a' : theme.muted));
    });

    this.drawButton(498, 514, 284, 58, 'New Expedition', () => {
      this.screen = 'heroes';
      this.notice = 'Choose three heroes to begin.';
      this.render();
    }, true);
    this.drawButton(498, 588, 284, 46, 'View Current Board', () => {
      this.ensureDefaultParty();
      this.screen = 'board';
      this.render();
    });
    this.drawButton(498, 646, 284, 38, 'Continue Run - not wired yet', () => undefined, false, true);

    this.layer.add(text(this, 640, 716, 'Prototype milestone: main menu + hero selection. ESC returns here. Dark theme with gold accents.', 13, theme.dim).setOrigin(0.5));
  }

  private drawHeroSelect() {
    this.layer.add(text(this, 52, 44, 'Choose Your Party', 38, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 54, 90, 'Select exactly three heroes. Each class changes combat role, overworld checks, and starting equipment.', 15, theme.muted));

    const selectedCount = this.selectedHeroIds.size;
    this.layer.add(text(this, 54, 120, `${selectedCount}/${MAX_PARTY} selected`, 17, selectedCount === MAX_PARTY ? '#87d887' : '#f2d58a'));

    heroClasses.forEach((hero, index) => this.drawHeroCard(hero, 54 + (index % 3) * 278, 158 + Math.floor(index / 3) * 214));

    this.drawSelectedPartyPanel(914, 128);
    this.drawButton(914, 578, 292, 54, 'Start Adventure', () => {
      if (this.selectedHeroIds.size !== MAX_PARTY) {
        this.notice = 'Select three heroes before starting.';
        this.render();
        return;
      }
      this.createPartyFromSelection();
      this.screen = 'board';
      this.render();
    }, selectedCount === MAX_PARTY, selectedCount !== MAX_PARTY);
    this.drawButton(914, 644, 292, 42, 'Back to Main Menu', () => {
      this.screen = 'menu';
      this.render();
    });
    this.layer.add(text(this, 914, 704, this.notice, 13, selectedCount === MAX_PARTY ? '#87d887' : '#cbb783'));
  }

  private drawHeroCard(hero: HeroClass, x: number, y: number) {
    const selected = this.selectedHeroIds.has(hero.id);
    const disabled = !selected && this.selectedHeroIds.size >= MAX_PARTY;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(selected ? 0x252034 : theme.panel, disabled ? 0.58 : 1);
    g.fillRoundedRect(x, y, 250, 184, 14);
    g.lineStyle(selected ? 3 : 1, selected ? theme.brightGold : 0x3a4258, disabled ? 0.5 : 1);
    g.strokeRoundedRect(x, y, 250, 184, 14);
    g.fillStyle(hero.color, disabled ? 0.4 : 1).fillCircle(x + 34, y + 38, 19);
    g.lineStyle(2, hero.accent, disabled ? 0.45 : 1).strokeCircle(x + 34, y + 38, 19);
    g.fillStyle(0x05070c, 0.55).fillRoundedRect(x + 154, y + 20, 68, 24, 8);

    this.layer.add(text(this, x + 66, y + 20, hero.name, 19, selected ? '#f7efd9' : '#dfe5f4', 'Georgia, serif'));
    this.layer.add(text(this, x + 66, y + 45, hero.archetype, 12, '#bca66e'));
    this.layer.add(text(this, x + 165, y + 26, selected ? 'CHOSEN' : 'CLASS', 10, selected ? '#f2d58a' : '#8690a8'));
    this.layer.add(text(this, x + 24, y + 76, hero.role, 12, theme.muted).setWordWrapWidth(202));

    this.drawTinyStats(hero, x + 24, y + 116, disabled);

    const zone = this.add.zone(x, y, 250, 184).setOrigin(0).setInteractive({ useHandCursor: !disabled });
    zone.on('pointerdown', () => {
      if (selected) this.selectedHeroIds.delete(hero.id);
      else if (this.selectedHeroIds.size < MAX_PARTY) this.selectedHeroIds.add(hero.id);
      this.notice = this.selectedHeroIds.size === MAX_PARTY ? 'Party ready. Start Adventure to enter the board.' : 'Choose three heroes to begin.';
      this.render();
    });
    this.layer.add(zone);
  }

  private drawTinyStats(hero: HeroClass, x: number, y: number, faded: boolean) {
    const entries: [StatKey, string][] = [
      ['might', 'MGT'],
      ['awareness', 'AWR'],
      ['intellect', 'INT'],
      ['vitality', 'VIT'],
      ['speed', 'SPD'],
      ['luck', 'LCK'],
    ];
    entries.forEach(([key, label], index) => {
      const yy = y + index * 10;
      const value = hero.stats[key];
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x070a11, faded ? 0.35 : 0.7).fillRoundedRect(x + 42, yy + 1, 120, 5, 3);
      g.fillStyle(value >= 80 ? theme.gold : 0x617095, faded ? 0.35 : 0.95).fillRoundedRect(x + 42, yy + 1, Math.round(value * 1.2), 5, 3);
      this.layer.add(text(this, x, yy - 3, label, 8, faded ? '#535a6e' : '#8994ac'));
    });
  }

  private drawSelectedPartyPanel(x: number, y: number) {
    this.drawPanel(x, y, 292, 424, 'Party Draft');
    const selectedHeroes = heroClasses.filter((hero) => this.selectedHeroIds.has(hero.id));
    if (selectedHeroes.length === 0) {
      this.layer.add(text(this, x + 24, y + 70, 'No heroes selected yet.', 15, theme.muted));
      this.layer.add(text(this, x + 24, y + 104, 'Pick three complementary roles:\nfront-line, damage, support, scout, or luck economy.', 13, '#778299').setWordWrapWidth(238));
      return;
    }

    selectedHeroes.forEach((hero, index) => {
      const yy = y + 62 + index * 102;
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x0c111b, 1).fillRoundedRect(x + 20, yy, 252, 82, 10);
      g.lineStyle(1, hero.accent, 0.55).strokeRoundedRect(x + 20, yy, 252, 82, 10);
      g.fillStyle(hero.color, 1).fillCircle(x + 48, yy + 28, 14);
      this.layer.add(text(this, x + 72, yy + 12, hero.name, 16, theme.ink, 'Georgia, serif'));
      this.layer.add(text(this, x + 72, yy + 34, `HP ${hero.hp} · Armor ${hero.armor} · Focus ${hero.focus}`, 12, '#d1c08b'));
      this.layer.add(text(this, x + 26, yy + 58, hero.weapon, 11, theme.muted));
    });
  }

  private drawBoardScreen() {
    this.ensureDefaultParty();
    this.layer.add(text(this, 52, 44, 'Expedition Board', 36, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 54, 88, 'Turn-based overworld movement: pathing, terrain risk, towns, encounters, and objectives.', 14, theme.muted));
    this.drawBoardMap(48, 118);
    this.drawRunPanel(914, 86);
    this.drawButton(914, 632, 292, 42, 'Enter Combat Preview', () => {
      this.screen = 'combat';
      this.render();
    });
    this.drawButton(914, 684, 292, 36, 'Back to Hero Select', () => {
      this.screen = 'heroes';
      this.render();
    });
  }

  private drawCombatScreen() {
    this.ensureDefaultParty();
    this.layer.add(text(this, 52, 44, 'Combat Preview', 36, '#f2d58a', 'Georgia, serif'));
    this.layer.add(text(this, 54, 88, 'Compact tactical battle grid: front line, back row, turn order, abilities, and HP pressure.', 14, theme.muted));
    this.drawCombatGrid();
    this.drawRunPanel(914, 86);
    this.drawActionBar(78, 570);
    this.drawButton(914, 632, 292, 42, 'Return to Board', () => {
      this.screen = 'board';
      this.render();
    });
    this.drawButton(914, 684, 292, 36, 'Back to Menu', () => {
      this.screen = 'menu';
      this.render();
    });
  }

  private drawBoardMap(x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x101521, 0.96).fillRoundedRect(x, y, 800, 472, 18);
    g.lineStyle(1, theme.gold, 0.38).strokeRoundedRect(x, y, 800, 472, 18);
    g.fillStyle(0x000000, 0.36).fillEllipse(x + 390, y + 296, 650, 200);

    boardTiles.forEach((tile) => this.drawIsoTile(tile));
    this.drawBoardPath();
    this.drawBoardEvents();
    this.party.forEach((member, index) => this.drawPartyToken(member, index));
  }

  private drawIsoTile(tile: BoardTile) {
    const { x, y } = iso(tile.q, tile.r, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52);
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
    this.layer.add(text(this, x - 6, y - 17, palette.icon, 20, '#10131a'));
    if (tile.label) this.layer.add(text(this, x - 42, y + 22, tile.label, 12, '#f5e7c0').setShadow(1, 1, '#000', 2));

    const hit = this.add.zone(x, y, TILE_W, TILE_H).setOrigin(0.5).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      if (!this.party.length) return;
      this.party[this.selectedPartyIndex].x = tile.q;
      this.party[this.selectedPartyIndex].y = tile.r;
      this.render();
    });
    this.layer.add(hit);
  }

  private drawBoardPath() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.lineStyle(4, theme.gold, 0.42);
    const route = [
      iso(0, 0, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52),
      iso(1, 1, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52),
      iso(2, 2, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52),
      iso(3, 3, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52),
      iso(4, 3, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52),
    ];
    for (let i = 0; i < route.length - 1; i++) g.lineBetween(route[i].x, route[i].y, route[i + 1].x, route[i + 1].y);
  }

  private drawBoardEvents() {
    const nodes = [
      { q: 2, r: 1, text: 'ambush', color: theme.red },
      { q: 3, r: 0, text: 'skill check', color: theme.gold },
      { q: 1, r: 2, text: 'shop', color: theme.blue },
      { q: 4, r: 3, text: 'boss', color: theme.red },
    ];
    nodes.forEach((node) => {
      const p = iso(node.q, node.r, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52);
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(0x07090f, 0.92).fillRoundedRect(p.x - 44, p.y - 60, 88, 22, 9);
      g.lineStyle(1, node.color, 1).strokeRoundedRect(p.x - 44, p.y - 60, 88, 22, 9);
      g.fillStyle(node.color, 1).fillCircle(p.x - 32, p.y - 49, 4);
      this.layer.add(text(this, p.x - 22, p.y - 56, node.text, 11, '#edf2ff'));
    });
  }

  private drawPartyToken(member: PartyMember, index: number) {
    const p = iso(member.x, member.y, BOARD_ORIGIN.x, BOARD_ORIGIN.y + 52);
    const x = p.x + index * 16 - 16;
    const y = p.y - 30 - index * 3;
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x000000, 0.42).fillEllipse(x, y + 23, 30, 10);
    g.fillStyle(member.color, 1).fillCircle(x, y, index === this.selectedPartyIndex ? 15 : 12);
    g.lineStyle(2, index === this.selectedPartyIndex ? theme.brightGold : 0x151515, 1).strokeCircle(x, y, index === this.selectedPartyIndex ? 15 : 12);
    this.layer.add(text(this, x - 26, y - 34, member.name.slice(0, 3), 11, '#f9f3df').setShadow(1, 1, '#000', 2));
  }

  private drawCombatGrid() {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x101521, 0.96).fillRoundedRect(48, 118, 800, 426, 18);
    g.lineStyle(1, theme.gold, 0.38).strokeRoundedRect(48, 118, 800, 426, 18);
    g.fillStyle(0x000000, 0.44).fillEllipse(445, 374, 710, 230);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) this.drawCombatTile(row, col);
    }

    const units = this.combatUnitsFromParty();
    units.forEach((unit) => this.drawCombatUnit(unit));
    this.drawTurnOrder(76, 150, units);
  }

  private drawCombatTile(row: number, col: number) {
    const { x, y } = combatIso(row, col);
    const heroSide = col < 2;
    const g = this.add.graphics();
    this.layer.add(g);
    const points = diamond(x, y, 104, 52);
    g.fillStyle(heroSide ? 0x263149 : 0x3a2630, 1).fillPoints(points, true);
    g.lineStyle(2, heroSide ? 0x64728f : 0x7d4d5b, 0.9).strokePoints(points, true);
    if (col === 2) g.lineStyle(3, theme.gold, 0.35).strokePoints(points, true);
  }

  private drawCombatUnit(unit: CombatUnit) {
    const p = combatIso(unit.row, unit.col);
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x000000, 0.4).fillEllipse(p.x, p.y + 25, 46, 14);
    g.fillStyle(unit.color, 1).fillRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.lineStyle(2, unit.kind === 'hero' ? theme.brightGold : 0xff8c7a, 1).strokeRoundedRect(p.x - 18, p.y - 44, 36, 48, 9);
    g.fillStyle(0x171923, 1).fillRect(p.x - 10, p.y - 31, 6, 6);
    g.fillRect(p.x + 5, p.y - 31, 6, 6);
    g.fillStyle(0x10131d, 1).fillRoundedRect(p.x - 38, p.y + 8, 76, 9, 5);
    g.fillStyle(unit.kind === 'hero' ? theme.green : theme.red, 1).fillRoundedRect(p.x - 38, p.y + 8, 76 * (unit.hp / unit.maxHp), 9, 5);
    this.layer.add(text(this, p.x - 44, p.y + 22, unit.name, 11, '#f4f0df').setShadow(1, 1, '#000', 2));
    this.layer.add(text(this, p.x - 34, p.y + 38, `${unit.hp}/${unit.maxHp} · ${unit.note}`, 10, '#acb8d6').setShadow(1, 1, '#000', 2));
  }

  private drawTurnOrder(x: number, y: number, units: CombatUnit[]) {
    this.layer.add(text(this, x, y, 'Turn Order', 12, '#d5c185'));
    units.slice(0, 6).forEach((unit, index) => {
      const g = this.add.graphics();
      this.layer.add(g);
      const yy = y + 28 + index * 31;
      g.fillStyle(index === 0 ? 0x27334f : 0x0d121d, 0.95).fillRoundedRect(x, yy, 152, 24, 7);
      g.lineStyle(1, index === 0 ? theme.brightGold : 0x2e3852, 0.8).strokeRoundedRect(x, yy, 152, 24, 7);
      this.layer.add(text(this, x + 10, yy + 5, `${index + 1}. ${unit.name}`, 11, '#dce5fb'));
    });
  }

  private drawActionBar(x: number, y: number) {
    this.layer.add(text(this, x, y - 30, 'Selected action preview', 12, '#d9c27d'));
    ['Strike 78%', 'Guard Ally', 'Use Item', 'Move Row', 'Flee 38%'].forEach((action, index) => {
      const xx = x + index * 148;
      const g = this.add.graphics();
      this.layer.add(g);
      g.fillStyle(index === 0 ? 0x3c3220 : 0x151c2b, 1).fillRoundedRect(xx, y, 132, 46, 10);
      g.lineStyle(1, index === 0 ? theme.brightGold : 0x35445f, 1).strokeRoundedRect(xx, y, 132, 46, 10);
      this.layer.add(text(this, xx + 11, y + 14, action, 12, '#f1f5ff'));
    });
  }

  private drawRunPanel(x: number, y: number) {
    this.drawPanel(x, y, 292, 518, 'Run State');
    this.layer.add(text(this, x + 24, y + 62, 'World Pressure', 12, '#d5c185'));
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x06080d, 1).fillRoundedRect(x + 24, y + 88, 244, 18, 9);
    g.fillStyle(theme.red, 1).fillRoundedRect(x + 24, y + 88, 154, 18, 9);
    this.layer.add(text(this, x + 24, y + 116, 'Dawn III · patrols spread after 2 turns', 12, theme.muted));

    this.layer.add(text(this, x + 24, y + 158, 'Party', 12, '#d5c185'));
    this.party.forEach((member, index) => {
      const yy = y + 188 + index * 72;
      g.fillStyle(index === this.selectedPartyIndex ? 0x252034 : 0x0d121d, 1).fillRoundedRect(x + 20, yy, 252, 56, 10);
      g.lineStyle(1, index === this.selectedPartyIndex ? theme.brightGold : 0x303a55, 0.9).strokeRoundedRect(x + 20, yy, 252, 56, 10);
      g.fillStyle(member.color, 1).fillCircle(x + 44, yy + 28, 12);
      this.layer.add(text(this, x + 66, yy + 10, member.name, 15, theme.ink, 'Georgia, serif'));
      this.layer.add(text(this, x + 66, yy + 31, `HP ${member.currentHp}/${member.hp} · AR ${member.armor} · ${member.weapon}`, 11, theme.muted));
    });

    this.layer.add(text(this, x + 24, y + 428, 'Controls', 12, '#d5c185'));
    this.layer.add(text(this, x + 24, y + 454, 'TAB select hero · click board tile to move\nSPACE toggles board/combat · ESC menu', 12, theme.muted));
  }

  private drawMiniBoardPreview(x: number, y: number) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x101521, 0.95).fillRoundedRect(x, y, 440, 244, 18);
    g.lineStyle(1, theme.gold, 0.38).strokeRoundedRect(x, y, 440, 244, 18);
    const ox = x + 220;
    const oy = y + 84;
    for (let r = 0; r < 3; r++) {
      for (let q = 0; q < 4; q++) {
        const p = iso(q, r, ox, oy);
        const points = diamond(p.x, p.y, 70, 35);
        const palette = terrainPalette[(q + r) % 5 === 0 ? 'town' : (q + r) % 3 === 0 ? 'forest' : (q + r) % 4 === 0 ? 'ruin' : 'road'];
        g.fillStyle(palette.top, 1).fillPoints(points, true);
        g.lineStyle(1, palette.stroke, 0.8).strokePoints(points, true);
      }
    }
    this.layer.add(text(this, x + 32, y + 28, 'From demo to playable loop', 25, theme.ink, 'Georgia, serif'));
    this.layer.add(text(this, x + 34, y + 68, 'First real screens: main menu and hero selection.\nNext: run creation, movement turns, encounters, combat resolution.', 14, theme.muted).setWordWrapWidth(360));
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

  private createPartyFromSelection() {
    const selectedHeroes = heroClasses.filter((hero) => this.selectedHeroIds.has(hero.id));
    this.party = selectedHeroes.map((hero, index) => ({
      ...hero,
      currentHp: hero.hp,
      x: index === 0 ? 0 : index === 1 ? 1 : 0,
      y: index === 2 ? 1 : 0,
    }));
    this.selectedPartyIndex = 0;
  }

  private ensureDefaultParty() {
    if (this.party.length) return;
    this.selectedHeroIds = new Set(['blacksmith', 'hunter', 'scholar']);
    this.createPartyFromSelection();
  }

  private combatUnitsFromParty(): CombatUnit[] {
    const heroes = this.party.map((member, index) => ({
      name: member.name,
      kind: 'hero' as const,
      hp: member.currentHp,
      maxHp: member.hp,
      row: index,
      col: index === 0 ? 0 : 1,
      color: member.color,
      note: member.role.split(',')[0],
    }));
    return [
      ...heroes,
      { name: 'Goblin Guard', kind: 'enemy', hp: 18, maxHp: 18, row: 1, col: 3, color: 0xb7d567, note: 'Armor 2' },
      { name: 'Hex Witch', kind: 'enemy', hp: 14, maxHp: 14, row: 0, col: 4, color: 0xc576d9, note: 'Curse' },
      { name: 'Bone Archer', kind: 'enemy', hp: 12, maxHp: 12, row: 2, col: 4, color: 0xe4e0ca, note: 'Back row' },
    ];
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

function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, family = 'Inter, system-ui, sans-serif') {
  return scene.add.text(x, y, value, {
    fontFamily: family,
    fontSize: `${size}px`,
    color,
    lineSpacing: 5,
  });
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: false,
  roundPixels: false,
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
