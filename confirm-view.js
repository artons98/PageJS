class ConfirmView{
    constructor(title, viewModel, htmlPath, callback, container = null, reInitialiseOnClose = true) {
        this.title = title;
        this.viewModel = viewModel;
        this.htmlPath = htmlPath;
        this.callback = callback;
        this.container = container;
        this.rootElement = null;
        this.reInitialiseOnClose = reInitialiseOnClose;
    }
    async initialize(rootElement = this.rootElement){
        UIController.toggleActivityIndicator(true);
        this.rootElement = rootElement;
        if (!this.rootElement.hasChildNodes()) {
            await this.addHTML(this.rootElement);
        }
        await this.onAppearing();
        UIController.toggleActivityIndicator(false);
        return;
    }
    async onAppearing() {
        if (this.rootElement) {
            if (ko.dataFor(this.rootElement)) {
                ko.cleanNode(this.rootElement);
            }
            if (this.viewModel) {
                ko.applyBindings(this.viewModel, this.rootElement);
            } else {
                console.error('Geen viewModel beschikbaar voor binding.');
            }
        }
    }
    async addHTML(rootElement) {
        const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const basePath = window.location.origin + path;
        const url = new URL(`${basePath}${this.htmlPath}`, window.location.origin);
    
        const response = await fetch(url);
        const html = await response.text();
    
        // Maak een tijdelijke DOM-container om de opgehaalde HTML te parsen
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
    
        // Bepaal de gewenste div op basis van de bestandsnaam zonder extensie
        const fileName = this.htmlPath.split('/').pop().split('.')[0];
        const targetDiv = tempDiv.querySelector(`#${fileName}`);
    
        // Controleer of de gewenste div bestaat
        if (targetDiv) {
            rootElement.innerHTML = "";
            rootElement.append(targetDiv);
        } else {
            console.warn(`Div met id "${fileName}" niet gevonden in het HTML-bestand.`);
        }
    
        return;
    }

}