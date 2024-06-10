import { SWSEActorSheet } from "../../../../systems/swse/module/actor/actor-sheet.mjs";
export class SimplySWSEActorSheet extends SWSEActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["simply-sheet", "swse", "sheet", "actor"],
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
    if (type === "character" || type === "npc") {
      return "modules/simply-sheet-swse/template/actor-sheet.hbs";
    }
    return super.template;
  }
  /** @override */
  async getData() {
    const context = super.getData();
    this.prepareAttributes(context);
    this.prepareSkills(context);
    return context;
  }
  /**
   * Prepare the attributes for the actor based on the system attributes.
   *
   * @param {Object} context - The context object containing actor information.
   *
   */
  prepareAttributes(context) {
    const system = context.actor.system;
    context.abilities = Object.fromEntries(
      Object.entries(system.attributes).filter(
        ([key, value]) => value.skip === false
      )
    );
    context.attrGen = system.finalAttributeGenerationType;
    return context;
  }
  prepareSkills(context) {
    const system = context.actor.system;
    context.skills = Object.fromEntries(
      Object.entries(system.skills).map(([key, value]) => [
        key,
        { ...value, accordionState: this.accordionStates?.[key] },
      ])
    );
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".dark-score-btn").click((ev) => {
      this.actor.darkSideScore = $(ev.currentTarget).data("value");
    });
    html.find(".accordion-skill-button").on("click", (ev) => {
      const btn = ev.currentTarget;
      const skillID = btn.dataset.id;

      const $accordionBody = $(
        html.find(`.accordion-skill-body[data-id="${skillID}"]`)
      );
      const $icon = $($(btn).find("i.fa-solid.fa-angle-down"));

      this.accordionStates = this.accordionStates || {};
      this.accordionStates[skillID] = !this.accordionStates[skillID];
      $icon.css("rotate", this.accordionStates[skillID] ? "180deg" : "0deg");

      $accordionBody.slideToggle();
    });
  }
}
