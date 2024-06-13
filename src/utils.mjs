export async function prepareTemplates() {
  return loadTemplates([
    "modules/simply-sheet-swse/template/parts/summary-tab.hbs",
    "modules/simply-sheet-swse/template/parts/sheet-header.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab.hbs",
    "modules/simply-sheet-swse/template/parts/equipment-tab.hbs",
    "modules/simply-sheet-swse/template/parts/mode-tab.hbs",
    "modules/simply-sheet-swse/template/parts/notes-tab.hbs",
    "modules/simply-sheet-swse/template/parts/settings-tab.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/ability-score-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/defence-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/hit-point-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/threshold-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/speed-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/points-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/shields-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/condition-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/gravity-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/skills-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/dark-side-score-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/armor-panel.hbs",
    "modules/simply-sheet-swse/template/parts/summary-tab-parts/attacks-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/class-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/feats-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/talents-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/traits-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/beast-panel.hbs",
    "modules/simply-sheet-swse/template/parts/features-tab-parts/force-panel.hbs",
  ]);
}
export async function createAttackDialog() {
  const weaponGroup = {
    "Ranged Weapons": ["Heavy Weapons", "Pistols", "Rifles", "Simple Ranged Weapons", "Exotic Ranged Weapons", "Ranged Natural Weapons", 'Weapon Systems'],
    "Melee Weapons": ["Advanced Melee Weapons", "Lightsabers", "Simple Melee Weapons", "Exotic Melee Weapons", "Melee Natural Weapons"]
};
  const contentHtml = await renderTemplate(
      "modules/simply-sheet-swse/template/dialogCreateAttacks.hbs", {weaponGroup}
  );
  return new Promise((resolve, reject) => {
    const dialog = new Dialog({
        title: "Create a New Weapon",
        content: contentHtml,
        buttons: {
            cancel: {
              label: "No",
              icon: `<i class="fas fa-ban"></i>`,
              callback: () => {},
            },
          create: {
            label: "Create Attack",
            icon: `<i class="fas fa-circle-plus"></i>`,
            callback: (html) => {
                const formData = new FormDataExtended(html[0].querySelector("form"), { disabled: true }).object;
                
                try {
                    const requiredFields = { name: "New Weapon", type: null, subtype: null };
                    
                    for (const [field, defaultValue] of Object.entries(requiredFields)) {
                        if (!formData?.[field]) {
                            formData[field] = defaultValue || formData[field];
                            if (!formData[field]) {
                                throw new Error(`${field.capitalize()} is required`);
                            }
                        }
                    }
                    
                    const changes = [];
                    if (formData.damage) changes.push({ key: "damage", mode: 2, value: formData.damage });
                    if (formData.damageType) changes.push({ key: "damageType", mode: 2, value: formData.damageType });
                    
                    resolve({
                        name: formData.name,
                        type: formData.type,
                        data: {
                            subtype: formData.subtype,
                            equipped: "equipped",
                            changes
                        }
                    });
                } catch (error) {
                    ui.notifications.error(error.message);
                    reject(error);
                }
            }
            ,
          },
        },
        close: () => {},
        default: "create",
      });
      dialog.render(true);
  })
  
}
