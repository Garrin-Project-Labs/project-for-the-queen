# PROTOTYPE_NOTES.md - Phaser 3 Board/Combat Visual Spike

Question: how far can we get visually with only Phaser 3, TypeScript, Vite, and generated/free-style 2D assets?

## What this prototype shows

- Isometric-feeling overworld board using Phaser vector drawing only.
- Terrain tiles for town, road, forest, swamp, ruins, mountains, and lava.
- Party tokens with selected-character state and click-to-move tile interaction.
- Event/objective labels: shop, skill check, ambush, boss.
- Side UI for world pressure, party state, inventory, and controls.
- Separate tactical combat screen with compact isometric grid.
- Front/back/support row presentation.
- Hero and enemy unit markers, HP bars, notes, turn order, and action bar.

## Controls

- `SPACE` switches between overworld and combat.
- `B` opens board screen.
- `C` opens combat screen.
- `TAB` changes selected hero.
- Click a board tile to move the selected hero.

## Run command

```bash
npm install
npm run dev
```

Then open the Vite URL, usually `http://localhost:5173/`.

## Early verdict

Phaser 3 + TypeScript + Vite is enough to prototype the board/combat screens quickly. We can fake isometric visuals with 2D diamond tiles, shadows, height offsets, and sorted sprites without needing Three.js. This is likely the right first stack for proving the game loop.

The weak spot is production-quality UI and asset workflow. Phaser can draw and animate the board well, but if menus, inventory, tooltips, and rich layout become large, we may eventually want either:

1. Phaser for the game canvas plus DOM/React overlay for heavy UI, or
2. Pure Phaser UI for simplicity while the prototype is small.

True 3D miniatures are not needed yet. If the game later needs camera rotation, real lighting, or 3D dioramas, then Three.js/Babylon becomes relevant. For now, 2D isometric is much cheaper and proves the important decisions faster.
