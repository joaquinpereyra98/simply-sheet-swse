import { SimplySWSEActorSheet } from "./actor-sheet/actor-sheet.mjs";
import { prepareTemplates } from "./utils.mjs";
import { SimplySWSEActor } from "./actor-sheet/actor.mjs";
Hooks.on("init", function () {
  console.log(CONFIG.Actor.documentClass);
  prepareTemplates();
  Actors.registerSheet("simply-sheet-swase", SimplySWSEActorSheet, {
    makeDefault: true,
    label: "SIMPLY-SHEET-SWASE.SheetLabel",
  });
  CONFIG.Actor.documentClass = SimplySWSEActor;
  console.log(CONFIG.Actor.documentClass);
});
Hooks.on("preCreateActor", (document, data, options, userId) => {
  document.updateSource({ ["system.ignorePrerequisites"]: true });
});
