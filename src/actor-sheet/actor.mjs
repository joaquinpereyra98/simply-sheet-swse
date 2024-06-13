import { SWSEActor } from '../../../../systems/swse/module/actor/actor.mjs'
export class SimplySWSEActor extends SWSEActor {
    _prepareCharacterData(system) {
        super._prepareCharacterData(system);
        const defences = ["fortitude", "will", "reflex"]
        defences.forEach(def => {
            system.defense[def].total += system.levelSummary;
        })
    }
}