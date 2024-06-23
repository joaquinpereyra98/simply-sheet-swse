import { SWSEActor } from "../../../../systems/swse/module/actor/actor.mjs";
export class SimplySWSEActor extends SWSEActor {
  _prepareCharacterData(system) {
    super._prepareCharacterData(system);
    system.defense.fortitude = this.prepareFortitude();
    system.defense.will = this.prepareWill();
    system.defense.reflex = this.prepareReflex();
  }
  prepareFortitude() {
    const {armorBonus, classBonus, miscBonus, override} = this.system.defense.fortitude;
    const attributeBonus = this.getFlag('simply-sheet-swse', 'fortitudeAttribute') || "con";
    const total = 10 + armorBonus + classBonus + miscBonus + this.system.attributes[attributeBonus]?.mod;
    return {
      ...this.system.defense.fortitude,
      total: (override || total) + this.system.levelSummary,
      attributeBonus: attributeBonus,
   }
  }

  prepareWill() {
    const {armorBonus, classBonus, miscBonus, override} = this.system.defense.will;
    const attributeBonus = this.getFlag('simply-sheet-swse', 'willAttribute') || "wis";
    const total = 10 + armorBonus + classBonus + miscBonus + this.system.attributes[attributeBonus]?.mod;
    return {
      ...this.system.defense.will,
      total: (override || total) + this.system.levelSummary,
      attributeBonus: attributeBonus,
   }
  }
  prepareReflex() {
    const { armorBonus, classBonus, miscBonus, override } = this.system.defense.reflex;
    const attributeBonus = this.getFlag('simply-sheet-swse', 'reflexAttribute') || "dex";
    const attrMod = this.system.attributes[attributeBonus]?.mod || 0;

    const bonusArray = this.getEquippedItems()
        .map(item => item.maximumDexterityBonus)
        .filter(bonus => typeof bonus === 'number' && bonus > 0);

    const minAttributeBonus = Math.min(attrMod, ...bonusArray);

    const baseTotal = 10 + armorBonus + classBonus + miscBonus + minAttributeBonus;
    const total = (override || baseTotal) + this.system.levelSummary;

    return {
        ...this.system.defense.reflex,
        total,
        attributeBonus
    };
}

}