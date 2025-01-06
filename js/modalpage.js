class Page{
    constructor(title, viewModel) {
        this.title = title;
        this.viewModel = viewModel;
    }
    initialize(){
        const rootElement = document.querySelector('body'); // Of ander root-element

        if (!ko.dataFor(rootElement)) {
            ko.applyBindings(this.viewModel, rootElement);
        }
    }
    
}