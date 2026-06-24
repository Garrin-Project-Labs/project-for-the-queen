# PLAN.md - Gameplay Summary for a For the King II-Inspired Project

This document focuses on the gameplay structure of *For the King II* rather than its lore. The goal is to capture the major loops, mechanics, and player-facing systems that make the game work: party setup, map movement, encounters, combat, inventory, progression, failure, and replayability.

## 1. Core Game Shape

At a high level, the game is a turn-based tabletop RPG played on a digital map.

The player controls a small party of adventurers moving across a dangerous world. Each run or adventure asks the party to complete objectives while surviving hostile terrain, random encounters, resource pressure, and tactical battles.

The game is built around three connected layers:

1. **Overworld exploration** - moving across the map, discovering locations, managing time and risk.
2. **Encounter resolution** - handling events, skill checks, shops, quests, hazards, and choices.
3. **Tactical combat** - fighting enemies in turn-based battles with positioning, equipment, abilities, and dice-like uncertainty.

The key feeling is not pure power fantasy. It is controlled risk. Players are constantly deciding whether to push forward, heal, retreat, spend resources, split up, gamble on a roll, or take one more fight before resting.

## 2. Party Creation and Setup

The game begins with party selection.

Players choose a group of characters, usually from different classes or archetypes. Each character brings different strengths, stats, equipment preferences, and battlefield roles.

Important design elements:

- The party matters more than any single hero.
- Characters should cover different needs: damage, durability, healing, support, speed, magic, ranged attacks, utility, and survivability.
- Starting equipment influences early strategy.
- Class choice affects both combat and overworld decisions.
- In co-op, each player may control one or more party members.
- In solo play, one player controls the full party.

A good version of this system should make players ask:

- Who is our front-line protector?
- Who deals reliable damage?
- Who handles magic or special effects?
- Who is fast enough to act early?
- Who can survive bad luck?
- Are we building a balanced party or gambling on a specialized strategy?

## 3. Character Stats and Skill Identity

Characters are defined by stats that affect both combat and non-combat actions.

The exact stat names can vary, but the important idea is that different activities test different character strengths. A strong physical character might be better at melee attacks or force-based challenges. A clever or magical character might perform better with spells, devices, lore checks, or special weapons. A fast character might move earlier, evade attacks, or handle ranged weapons.

Stats should connect directly to gameplay.

Possible stat roles:

- **Strength / physical power** - melee damage, heavy weapons, brute-force checks.
- **Awareness / perception** - bows, traps, scouting, ambush detection.
- **Intelligence / talent** - magic, devices, puzzle-like encounters.
- **Vitality / endurance** - health, resistance, survival checks.
- **Speed / initiative** - turn order, evasion, map mobility.
- **Luck** - rare outcomes, risky events, loot moments, clutch rolls.

The important thing is that stats create identity. A character should not simply be a bundle of hit points and damage numbers. They should be better at some kinds of problems and worse at others.

## 4. The Overworld Map

The overworld is the main board-game layer.

Players move characters across a map made of connected spaces, regions, or hexes. The map contains towns, enemies, dungeons, quest locations, hazards, merchants, random events, and hidden discoveries.

Movement is turn-based. Each character gets movement opportunities, usually influenced by stats, conditions, terrain, or randomness.

Important overworld mechanics:

- Characters move across a visible map rather than selecting missions from a menu.
- Terrain matters. Forests, swamps, seas, mountains, roads, and wastelands can change movement cost or risk.
- Distance matters. Being far from town or allies creates danger.
- Time matters. The world should pressure the party to act rather than grind forever.
- Map generation or variation supports replayability.
- The party may travel together or split up, creating strategic trade-offs.

Good map gameplay creates questions like:

- Do we stay together for safety or split up to cover more ground?
- Can this injured character reach town before another fight?
- Is it worth taking a detour for loot?
- Do we clear nearby enemies now or rush the objective?
- Can we afford to spend another turn preparing?

## 5. Movement Loop

The movement loop is one of the most important parts of the game.

A simple version looks like this:

1. A character starts their turn on the overworld.
2. The game determines how far they can move.
3. The player chooses a route or destination.
4. Terrain, enemies, events, or hidden checks may interrupt or alter the plan.
5. The character ends their move and may interact with the destination.
6. The world state advances.

Movement should never feel like empty walking. Every move should carry some level of opportunity, cost, or risk.

Movement creates tension when:

- The party is low on health.
- An objective is far away.
- Enemies block the safest route.
- A valuable location appears off the main path.
- A character is isolated.
- A time pressure is advancing.
- Bad terrain slows the party down.

Movement also creates collaboration in co-op. Players need to coordinate routes, decide who gets help, and avoid leaving someone behind.

## 6. Time Pressure and World Threat

The game works best when the player cannot prepare forever.

A world-threat system pushes the party forward. This could be represented through chaos, corruption, enemy escalation, a countdown, spreading danger, worsening weather, or story pressure.

The purpose is to prevent passive grinding and force meaningful decisions.

Good time pressure should:

- Advance predictably enough that players can plan around it.
- Be threatening enough that ignoring it has consequences.
- Allow mitigation through quests, objectives, items, or risky choices.
- Create trade-offs between preparation and progress.

Example player decisions:

- We need better weapons, but the threat meter is almost full.
- We can clear this side objective to reduce danger, but it costs time.
- We can rest now, but the world will get worse.
- We are under-equipped, but delaying may be worse.

## 7. Encounters and Events

Encounters are the connective tissue between movement and combat.

When characters move across the map, enter locations, investigate objects, or trigger story beats, they can face events. These events may involve choices, tests, rewards, penalties, combat, traps, merchants, shrines, treasure, or narrative flavor.

Encounter types:

- Enemy ambushes.
- Treasure caches.
- Skill checks.
- Hazardous terrain.
- Traveling merchants.
- Shrines or healing points.
- Caves, camps, ruins, or mini-dungeons.
- NPC requests.
- Random world events.
- Objective locations.

Encounters should be short but meaningful. They are not long dialogue scenes. They are quick pressure points that ask the player to make decisions or accept risk.

A strong encounter system gives the world texture. The map stops being empty space and becomes a chain of small stories, dangers, and opportunities.

## 8. Skill Checks and Dice-Like Uncertainty

A major part of the game is chance.

Actions often resolve through dice-like checks based on a character stat. The better the relevant stat, the better the odds, but success is not always guaranteed.

This creates the tabletop feeling: players make informed choices, but the game can still surprise them.

Useful principles:

- The player should understand roughly why their odds are good or bad.
- Higher stats should feel meaningfully better.
- Failure should hurt but not always end the run immediately.
- Some items, abilities, or conditions should improve odds.
- Great successes and terrible failures should create memorable moments.

Skill checks can apply to:

- Attacks.
- Evasion.
- Trap disarming.
- Lockpicking.
- Persuasion or bargaining.
- Magic use.
- Searching.
- Movement hazards.
- Escaping ambushes.
- Special event choices.

The key is that uncertainty should create stories, not just frustration.

## 9. Combat Overview

Combat is turn-based and tactical.

When the party fights enemies, the game shifts from overworld movement to a battle scene. Characters and enemies take turns based on initiative, speed, or other timing rules. Each participant uses weapons, abilities, items, movement, or defensive actions to survive and defeat the opposing side.

Combat is built around:

- Party roles.
- Turn order.
- Positioning.
- Weapon abilities.
- Chance-based attacks.
- Armor and resistance.
- Status effects.
- Resource use.
- Target priority.

Combat should be readable and dangerous. The player should usually understand what went wrong, even when bad luck contributed.

## 10. Battle Grid and Positioning

For the King II adds a stronger tactical layer through a battle grid.

Instead of characters simply standing in a flat line, combat uses rows or positions. Front-line characters can protect back-line characters. Some attacks may only hit certain positions. Some abilities may move characters, hit rows, or punish clustered enemies.

Positioning creates decisions such as:

- Who stands in front?
- Who needs protection?
- Can this enemy reach our weak character?
- Should we move, defend, attack, or use an item?
- Can we push or control an enemy into a bad position?
- Is this character safe enough to use a slow or risky ability?

Important tactical roles:

- **Tank / protector** - absorbs hits, blocks access to weaker allies, uses shields.
- **Damage dealer** - focuses enemies down quickly.
- **Support** - heals, buffs, removes status effects, improves odds.
- **Controller** - slows, stuns, pushes, debuffs, or disrupts enemies.
- **Ranged attacker** - attacks from safer positions but may be fragile.
- **Mage / special attacker** - uses elemental or magical effects, often with trade-offs.

A small grid is enough. The goal is not huge tactical complexity. The goal is meaningful positioning that players can understand quickly.

## 11. Attacks, Abilities, and Weapons

Weapons define many of a character's combat options.

Rather than every class having a fixed ability bar, equipment can provide attacks and special moves. A sword, bow, staff, musket, wand, shield, or instrument may each come with different abilities.

Weapon design should consider:

- Accuracy.
- Damage.
- Damage type.
- Targeting rules.
- Splash or area effects.
- Status effects.
- Defensive value.
- Stat scaling.
- Special risks or setup requirements.

A basic weapon might offer reliable damage. A rarer weapon might offer lower accuracy but powerful effects. A support item might heal, buff, cleanse, or manipulate turn order.

This makes loot exciting because a new item can change how a character plays, not just increase a number.

## 12. Damage, Armor, and Resistance

Combat needs defensive systems so that characters and enemies feel different.

Common defensive concepts:

- **Health** - how much damage a character can take before falling.
- **Armor** - reduces physical damage.
- **Resistance** - reduces magical or elemental damage.
- **Evasion** - chance to avoid or reduce attacks.
- **Guarding** - temporary defensive action.
- **Shields** - equipment that supports front-line protection.

The purpose of armor and resistance is to make target choice matter. A heavily armored enemy may be weak to magic. A magical enemy may be vulnerable to physical burst damage. A fragile enemy may need to be killed before it can apply dangerous effects.

## 13. Status Effects

Status effects add variety and tactical pressure.

They give players more to think about than raw damage.

Possible status effects:

- Poison.
- Burning.
- Bleeding.
- Stun.
- Slow.
- Shock.
- Freeze.
- Confusion.
- Curse.
- Armor break.
- Resistance break.
- Taunt.
- Protect.
- Regeneration.
- Focus or accuracy boosts.

Status effects should create decisions:

- Do we cleanse this now or keep attacking?
- Can we survive poison until town?
- Should we stun the big enemy or kill the small one?
- Is it worth using a rare item to remove this curse?

## 14. Inventory and Equipment

Inventory is a major strategic system.

The party collects weapons, armor, consumables, gold, quest items, and special tools. These items determine combat strength, survival options, and future planning.

Important inventory categories:

- Weapons.
- Shields.
- Armor.
- Helmets or accessories.
- Consumable healing items.
- Status removal items.
- Buff items.
- Teleport or movement tools.
- Gold or currency.
- Quest items.
- Unlockable or run-start items.

Inventory decisions should be frequent but not exhausting.

Players should ask:

- Who benefits most from this weapon?
- Do we sell this or keep it for a future fight?
- Should we spend gold on healing, armor, or damage?
- Are we carrying enough recovery items?
- Should the fragile character get better defense, or should the tank get stronger?
- Is this item worth using now, or should we save it for the boss?

In co-op, inventory also creates social gameplay: who gets the good loot, who needs the healing item, who is hoarding gold, and who is responsible for support items.

## 15. Economy, Shops, and Towns

Towns are safe or safer points on the map where the party can recover and prepare.

Common town functions:

- Buy weapons.
- Buy armor.
- Buy consumables.
- Heal characters.
- Remove status effects.
- Revive fallen allies.
- Accept quests.
- Gather information.
- Upgrade or manage loadouts.

The economy should force trade-offs. Gold should be useful enough that players rarely have enough for everything they want.

Good shop decisions:

- Buy a powerful weapon or several healing items?
- Heal now or risk one more fight?
- Upgrade one character heavily or improve everyone a little?
- Spend money before a dungeon or save it for later?

Towns also act as route-planning anchors. The distance between danger and safety is part of the map strategy.

## 16. Quests and Objectives

The game is structured around objectives that pull the party across the map.

Objectives can be main-path requirements, optional side tasks, bounty-style fights, dungeon clears, rescue missions, delivery tasks, or threat-reduction goals.

Good objective design should:

- Give the party a clear destination or target.
- Create pressure through distance, danger, or time.
- Reward useful resources.
- Sometimes reduce world threat.
- Encourage exploration without making the player feel lost.

Objectives should chain together into an adventure. The player should usually know what they are trying to do next, but still have freedom in how they prepare and route toward it.

## 17. Dungeons and Multi-Fight Challenges

Dungeons are concentrated risk zones.

Instead of one isolated fight, a dungeon may ask the party to survive multiple encounters in sequence. Resources carry forward, so early mistakes matter.

Dungeon gameplay can include:

- Multiple combat rooms.
- Skill checks.
- Traps.
- Treasure choices.
- Mini-bosses.
- Final bosses.
- Limited healing.
- Party-wide rewards.

The key dungeon question is endurance: can the party survive the whole sequence with the resources they brought?

Good dungeon tension:

- Do we enter now or prepare more?
- Do we use our best consumables early?
- Can we survive another room?
- Is the reward worth the risk?

## 18. Death, Revives, and Failure

Failure is part of the design.

Characters can fall in combat. The party may have limited lives, revive options, or recovery methods. If the party fully collapses, the run or adventure may end.

This creates stakes. Battles matter because losing health and lives affects the rest of the journey.

A good failure system should:

- Make death scary but not always instantly final.
- Give players some recovery tools.
- Make repeated mistakes dangerous.
- Preserve learning or unlock progress between runs.
- Encourage another attempt rather than pure frustration.

The important emotional loop is:

1. The party fails.
2. The players understand why.
3. They unlock or learn something.
4. They want to try again with a better plan.

## 19. Roguelite Progression and Unlocks

The game uses roguelite progression to make repeated attempts meaningful.

Even when a run fails, players can earn points, currency, knowledge, or unlocks that affect future runs. This can include new classes, items, encounters, cosmetics, locations, or starting loadout options.

Good roguelite progression should avoid making early runs feel pointless. The player should gain something even from a messy failure.

Unlocks can include:

- New character classes.
- New starting gear.
- New weapons in the loot pool.
- New events.
- New cosmetics.
- New difficulty options.
- New campaign chapters.

The balance challenge is important: unlocks should help and add variety, but the game should still reward skill, planning, and adaptation.

## 20. Co-op Gameplay

Co-op is central to the feel of the game.

With multiple players, the game becomes a shared strategy conversation. Players coordinate movement, divide loot, rescue each other, argue over risks, and experience bad luck together.

Co-op creates gameplay moments like:

- One player rushing ahead and triggering danger.
- The party deciding who gets the expensive upgrade.
- A support player saving someone at the last second.
- A greedy loot choice causing trouble later.
- Players splitting up to cover map objectives faster.
- A failed roll becoming a group joke.

Good co-op design should support communication without requiring perfect coordination. The game should be playable casually but reward planning.

Important co-op needs:

- Clear turn information.
- Clear ownership of characters.
- Easy loot-sharing or trade rules.
- Readable map pings or planning tools.
- Combat roles that make each player feel useful.
- Enough downtime reduction that players stay engaged.

## 21. Solo Gameplay

Solo play should feel like controlling a full party in a board game.

The solo player needs enough control to make strategic plans without being overwhelmed by micromanagement.

Solo strengths:

- Full control over party composition.
- Full control over loot distribution.
- Easier coordination.
- More strategic planning.

Solo risks:

- More mental load.
- Less social fun from bad luck.
- Slower decision-making if systems are too complex.

A strong design should make solo play feel complete, not like a lesser version of co-op.

## 22. Difficulty and Customization

The game benefits from customizable difficulty because randomness and permadeath can be harsh.

Difficulty can adjust:

- Enemy health and damage.
- World threat speed.
- Starting resources.
- Revive limits.
- Loot generosity.
- Encounter danger.
- Economy prices.
- Failure penalties.

The goal is to support different player types:

- Casual co-op groups who want a fun adventure.
- Strategy players who want hard decisions.
- Roguelite players who want punishing runs.
- New players learning the systems.

Difficulty should not only be bigger numbers. The best difficulty tuning changes pressure, recovery, and tolerance for mistakes.

## 23. Replayability

Replayability comes from variation.

The game remains interesting when each attempt changes enough to create new problems.

Replayability sources:

- Procedural or varied maps.
- Different party compositions.
- Random encounters.
- Random loot.
- Multiple objectives or routes.
- Unlockable classes and items.
- Different enemy combinations.
- Difficulty modifiers.
- Optional challenge modes.

The ideal replay loop:

1. Start with a new party or strategy.
2. Explore a changed map.
3. Adapt to available loot and events.
4. Survive unexpected problems.
5. Win or fail dramatically.
6. Unlock something or learn something.
7. Try again differently.

## 24. Challenge / Infinite Modes

Beyond the campaign, a challenge mode can focus purely on survival and combat mastery.

For the King II has a Dark Carnival-style mode: an infinite or extended dungeon where players push as far as possible before dying.

A mode like this emphasizes:

- Build quality.
- Resource management.
- Combat endurance.
- Risk/reward path choices.
- Score chasing.
- Replayable challenge.

This type of mode is useful because it gives players something to do after campaign progress or when they want a shorter, more mechanical session.

## 25. The Main Gameplay Loop

The central loop can be summarized like this:

1. Choose a party.
2. Enter a generated or semi-generated adventure map.
3. Receive a main objective.
4. Move across the overworld.
5. Discover encounters, enemies, towns, hazards, and rewards.
6. Make skill checks and risk/reward decisions.
7. Fight tactical turn-based battles.
8. Collect loot and gold.
9. Upgrade equipment and manage inventory.
10. Heal, recover, or revive when possible.
11. Push toward objectives while world pressure increases.
12. Enter dungeons or boss encounters.
13. Win the adventure or fail.
14. Carry forward unlocks, knowledge, or progression.
15. Start again with a better plan.

## 26. Core Design Pillars to Preserve

If this project is inspired by For the King II, these are the most important gameplay pillars to preserve:

- **Party-first adventure** - the group is the main unit of play.
- **Readable tabletop structure** - players should understand turns, spaces, rolls, and consequences.
- **Risk-driven movement** - travel should create decisions, not filler.
- **Chance with mitigation** - luck matters, but preparation and stats improve outcomes.
- **Tactical but compact combat** - positioning, roles, and abilities matter without overwhelming the player.
- **Meaningful inventory** - loot changes strategy, not just numbers.
- **Resource pressure** - health, gold, items, time, and revives are limited.
- **Co-op stories** - the game should produce funny, tense, shared moments.
- **Failure as progress** - losing should teach, unlock, or motivate another run.
- **Replayable variation** - maps, loot, encounters, and party builds should change the experience.

## 27. Practical Takeaway

A game in this style is not mainly about deep lore or cinematic storytelling. It is about a party trying to survive a hostile board-game world where every trip across the map can become a problem.

The fun comes from layered decisions:

- where to move,
- when to fight,
- who gets the loot,
- whether to risk a roll,
- when to spend resources,
- how to position in combat,
- how long to delay the main objective,
- and how to recover when the plan falls apart.

The best version of this design should make players feel like they are telling a story through mechanics. Not because the game writes every dramatic moment, but because movement, combat, inventory, randomness, and failure combine into memorable situations.
