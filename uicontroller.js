class UIController{
    static currentPage = null;
    static stack = [];
    static baseID = "pageJSElement-";
    static originalThemeColor = null;

    static async openPage(pageModel){
        var container = document.getElementById("PageJS-main-content");
        container.addEventListener('transitionend', async (event) => {
            await pageModel.initialize(container);
            container.classList.remove("pageJS-hidden-page");
            pageModel.container = container;
            this.currentPage = pageModel;
        });
        container.classList.add("pageJS-hidden-page");
    }
    static async pushPageViewToStack(pageModel){
        if(this.stack.length < 1){
            var pageDiv = this.createPageDiv();
            document.body.append(pageDiv);
            pageDiv.style.zIndex = this.getHighestZIndex() + 1;
            this.stack.push(new PageView("", null, "", pageDiv));

            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                this.originalThemeColor = metaThemeColor.getAttribute('content');
                metaThemeColor.setAttribute('content', '#000000');
            }
            
            document.getElementsByTagName('nav')[0].classList.add('hidden');
            document.documentElement.classList.add('no-scroll'); 
            document.body.classList.add('no-scroll');

            history.pushState(null, 'Popup Open', '');
        }
        var container = this.createContainerDiv(pageModel);
        this.stack[0].container.append(container);
        await pageModel.initialize(container.childNodes[1]);
        container.classList.remove("pageJS-hidden-modal");
        pageModel.container = container;
        this.stack.push(pageModel);
        
    }
    static popView(){
        var element = (this.stack.pop()).container;
        element.addEventListener('transitionend', (event) => {
            element.remove();
            if(this.stack.length === 1){
                this.popView();

                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor && this.originalThemeColor !== null) {
                    metaThemeColor.setAttribute('content', this.originalThemeColor);
                }
                document.documentElement.classList.remove('no-scroll'); 
                document.body.classList.remove('no-scroll');
            }
        });
        element.classList.add("pageJS-hidden-modal");
        if(this.stack.length > 1){
            this.reInitialize();
        }
    }
    static reInitialize(){
        const pageModel = this.stack[this.stack.length - 1];
        pageModel.viewModel = new (Object.getPrototypeOf(pageModel.viewModel).constructor)();
        if(pageModel.rootElement){
            pageModel.rootElement.innerHTML = "";
            pageModel.initialize(pageModel.rootElement);
            console.log('Back in view! reinitializing page...');
        }
        else{
            console.log("pageModel was undefined or empty...");
            console.log(pageModel);
        }
    }
    
    static createPageDiv(){
        var element = document.createElement('div');
        element.id = "overlay";
        element.classList.add("pageJS-page");
        return element;
    }
    static createContainerDiv(pageModel) {
        var container = document.createElement('div');
        container.id = this.baseID + (this.stack.length + 1).toString();
        container.classList.add("pageJS-container", "pageJS-hidden-modal");
    
        var titleBar = document.createElement('div');
        titleBar.classList.add("pageJS-container__title-bar");
        container.append(titleBar);
    
        var title = document.createElement("h4");
        title.classList.add("pageJS-container__title");
        title.innerText = pageModel.title;
        titleBar.append(title);
    
        var closeButton = document.createElement('button');
        closeButton.classList.add("btn", "btn-primary", "text-light", "icon-button", "pageJS-container__close-button");
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("onclick", "UIController.popView();");
        titleBar.append(closeButton);
    
        var content = document.createElement('div');
        content.classList.add("pageJS-container__content");
        container.append(content);
    
        return container;
    }
    static getHighestZIndex() {
        let highestZIndex = 0;
    
        document.querySelectorAll('*').forEach((element) => {
          const zIndex = window.getComputedStyle(element).zIndex;
      
          if (!isNaN(zIndex)) {
            highestZIndex = Math.max(highestZIndex, parseInt(zIndex, 10));
          }
        });
      
        return highestZIndex;
      }
    static handlePopState(event) {
        this.popView();
        event.preventDefault();
    }
}