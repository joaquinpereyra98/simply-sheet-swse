import { SWSEActorSheet } from "../../../../systems/swse/module/actor/actor-sheet.mjs";
import { onToggle } from "../../../../systems/swse/module/common/listeners.mjs";
import { createAttackDialog } from "../utils.mjs";
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
    this.prepareBeastComponent(context);
    this.prepareForcePowers(context);
    this.prepareEquipment(context);

    return context;
  }
  /**
   * Prepare the attributes for the actor based on the system attributes.
   * @param {Object} context - The context object containing actor information.
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
  prepareBeastComponent(context) {
    const { naturalWeapons, specialSenses, speciesTypes, specialQualities } =
      this.actor;

    context.beastComp = {
      naturalWeapons,
      specialSenses,
      speciesTypes,
      specialQualities,
    };
    context.beastCompLabels = Object.fromEntries(
      Object.keys(context.beastComp).map((k) => {
        return [k, k.replace(/([A-Z])/g, " $1").capitalize()];
      })
    );
  }
  prepareForcePowers(context) {
    const { powers, secrets, techniques, regimens } = this.actor;
    
    const powersFinal = foundry.utils.deepClone(powers).map( i => {
      const useTracker = this.actor.getFlag("simply-sheet-swse", "useTracker") || {};
      i.useTracker = useTracker[i.id]
      return i
    })

    context.forcePowers = {
      forcePower: powersFinal,
      forceSecret: secrets,
      forceTechnique: techniques,
      forceRegimen: regimens,
    };
    context.forcePowersLabels = {
      forceSecret: "Force Secrets",
      forceTechnique: "Force Techniques",
      forceRegimen: "Force Regimens",
      forcePower: "Force Powers",
    };
  }
  prepareEquipment(context) {
    context.equipment = {
      weapons: {
        label: "Weapons",
        items: this.actor.weapons,
        compendium: "swse.weapons",
        itemType: "weapon",
      },
      armors: {
        label: "Armors",
        items: this.actor.armors,
        compendium: "swse.armor",
        itemType: "armor",
      },
      equipment: {
        label: "Equipments",
        items: this.actor.inventory,
        compendium: "swse.equipament",
        itemType: "equipment",
      },
    };
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".dark-score-btn").click((ev) => {
      const actual = this.actor.darkSideScore;
      const value = $(ev.currentTarget).data("value");
      this.actor.darkSideScore = actual >= value ? value - 1 : value;
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
    html
      .find(".item-control[data-action=equip-toggle]")
      .on("click", this._onEquipToggle.bind(this));
    html.find(".select-skill-attribute").on("change", (ev) => {
      const selector = ev.currentTarget;
      const id = selector.dataset.id;
      const val = $(selector).val();
      this.actor.update({ [`system.skills.${id}.attribute`]: val });
    });
    html
      .find("[data-action=create-attack]")
      .on("click", this._onCreateAttack.bind(this));
    html.find(".uses-force-checkbox").on("change", this._onToggleForceUse.bind(this))
    html.find("[data-action=increase-uses]").on("click", this._onIncreaseForceUses.bind(this))
    html.find("[data-action=decrease-uses]").on("click", this._onDecreaseForceUses.bind(this))
  }
  _onIncreaseItemQuantity(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if (item.system.quantity === undefined || item.system.quantity === null) {
      item.update({ "system.quantity": 1 });
    } else {
      item.update({ "system.quantity": item.system.quantity + 1 });
    }
    
  }
  _onEquipToggle(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if (!item.system.equipped) {
      item.equip("equipped");
    } else {
      item.unequip();
    }
  }
  async _onCreateAttack(event) {
    event.preventDefault();
    const itemData = await createAttackDialog();
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  _onIncreaseForceUses(event) {
    event.preventDefault();
    const id = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    let useTracker = this.actor.getFlag("simply-sheet-swse", "useTracker") || {};

    if (!useTracker[item.id]) {
        useTracker[item.id] = [false];
    } else {
        useTracker[item.id].push(false);
    }

    this.actor.setFlag("simply-sheet-swse", "useTracker", useTracker);
}

  _onDecreaseForceUses(event) {
    event.preventDefault();
    const id = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    const useTracker = this.actor.getFlag("simply-sheet-swse", "useTracker") || {};
    
    if (useTracker[item.id]) {
        useTracker[item.id].pop();
    }
    
    this.actor.setFlag("simply-sheet-swse", "useTracker", useTracker);
}

_onToggleForceUse(event) {
  event.preventDefault();
  const li = event.currentTarget.closest(".item");
  const item = this.actor.items.get(li.dataset.itemId);
  const key = event.currentTarget.dataset.key;
  let useTracker = this.actor.getFlag("simply-sheet-swse", "useTracker");

  if (useTracker && useTracker[item.id]) {
      useTracker[item.id][key] = !useTracker[item.id][key];
      this.actor.setFlag("simply-sheet-swse", "useTracker", useTracker);
  }
}

}
