# Pokémon Magenta — Build Plan

## Goal
GBA FireRed-style Pokémon game in vanilla HTML/CSS/JS (canvas world + DOM UI), responsive
with keyboard (desktop) and touch controls (mobile). Gen-1 Pokémon only.

## Plan
- [x] Plan + architecture
- [x] `index.html` — GBA shell, screen layers, touch controls
- [x] `css/style.css` — pixel aesthetic, responsive layout, battle/menu styling
- [x] `js/data.js` — gen-1 type chart, ~70 moves, 50 species (stats/learnsets/evolutions), encounter tables, items
- [x] `js/tiles.js` — procedural 16px tileset, character/creature sprites
- [x] `js/maps.js` — 60x60 overworld (town, route, forest maze, lake, north field, mountain), cave, 3 interiors, NPCs, warps, hidden areas
- [x] `js/ui.js` — input stack (keys + touch), dialog/typewriter, choices, fades, SFX
- [x] `js/battle.js` — full battle engine: turns, gen-1 damage/types, status, catching, exp/levels/evolution, trainer battle (rival)
- [x] `js/game.js` — world engine, camera, collisions, encounters, START menu, party/bag/dex, save/load
- [x] `js/main.js` — boot, title screen, new game intro
- [x] Verify: syntax check + run in browser preview, desktop + mobile sizes

## Hidden rare Pokémon (challenge content)
- MEW lv50 — secret 1-tile corridor hugging the far-west forest wall → hidden clearing
- MEWTWO lv70 — deepest chamber of the cave maze (NE mountain)
- ARTICUNO lv50 — lake island, reachable only via invisible walkable water path (subtle shimmer)
- SNORLAX lv30 — blocks a shortcut gap; interact to battle
- Rare grass spawns: Scyther/Pinsir/Chansey (north field), Dratini/Lapras (lakeside), Pikachu (forest), Abra (route)
- NPC hints scattered so discovery is fair

## Review
Verified in browser preview (npx http-server, `.claude/launch.json` → "magenta"):
- Title → NEW GAME → home intro → town render matches the FRLG reference screenshot.
- Starter selection at lab ball table works; rival auto-battle follows (fixed: scripted
  rival loss no longer triggers an overworld whiteout — OAK heals in place).
- Wild encounter in Route 1 grass triggered; Poké Ball throw, break-out, and successful
  catch (Rattata joined party, dex updated) all observed.
- MEW static encounter engaged at lv50; ran away cleanly.
- Programmatic connectivity check passed for: hidden water path (11 tiles), Mew corridor,
  forest entry, full cave path to Mewtwo, Snorlax gap (blocked → open after flag),
  town gate, route gaps, all 5 warps.
- START menu: Pokédex (seen/caught), SAVE to localStorage, CONTINUE from save all work.
- Mobile preset (375x812): shell scales, D-pad/A/B/START controls display (pointer:coarse
  media query + JS `ontouchstart` fallback adding `body.touch`).
- No console errors/warnings. Test save cleared.
