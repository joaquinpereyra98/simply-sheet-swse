export async function prepareTemplates(){
    return loadTemplates([
        "modules/simply-sheet-swse/template/parts/summary-tab.hbs",
        "modules/simply-sheet-swse/template/parts/sheet-header.hbs"
    ])
}