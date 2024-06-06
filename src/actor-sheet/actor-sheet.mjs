import {SWSEActorSheet} from "../../../../systems/swse/module/actor/actor-sheet.mjs";
export class SimplySWSEActorSheet extends SWSEActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["simply-sheet","swse", "sheet", "actor"],
      width: 700,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "summary",
        },
      ],
    });
  }
  /** @override */
  get template() {
    const type = this.actor.type;
    if(type === 'character' || type === 'npc'){
      return 'modules/simply-sheet-swse/template/actor-sheet.hbs';
    }
    return super.template;
  }
  async getData() {
    const context = super.getData();
    console.log(context)
    return context
  }
}
