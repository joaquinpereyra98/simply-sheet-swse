import { SimplySWSEActorSheet } from "./actor-sheet/actor-sheet.mjs";
import { prepareTemplates } from "./utils.mjs";
Hooks.on("init", function() {
  prepareTemplates()
    Actors.registerSheet("simply-sheet-swase", SimplySWSEActorSheet, {
        makeDefault: true,
        label: "SIMPLY-SHEET-SWASE.SheetLabel",
      });
});