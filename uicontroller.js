window.PageJS = window.PageJS || {};

if (!PageJS.UIController) {
    PageJS.UIController = class {
        static currentPage = null;
        static stack = [];
        static baseID = "pageJSElement-";
        static originalThemeColor = null;
        static activityIndicatorContainer = null;
        static _activeFetches = 0;

        static async openPage(pageModel){
            const container = document.getElementById("PageJS-main-content");
            const onTransitionEnd = async (event) => {
                if (event.target !== container) return;

                container.removeEventListener("transitionend", onTransitionEnd);
                container.innerHTML = "";
                await pageModel.initialize(container);
                container.classList.remove("pageJS-hidden-page");
                this.currentPage = pageModel;
            };
            container.addEventListener("transitionend", onTransitionEnd);
            container.classList.add("pageJS-hidden-page");
        }
        static async pushPageViewToStack(pageModel){
            if(this.stack.length < 1){
                const pageDiv = this.createPageDiv();
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
                pageDiv.classList.remove('pageJS-hidden-page');
            }
            const container = this.createContainerDiv(pageModel);
            this.stack[0].container.append(container);
            await pageModel.initialize(container.childNodes[1]);
            container.classList.remove("pageJS-hidden-modal");
            pageModel.container = container;
            if(this.stack.length > 1){
                this.stack[this.stack.length - 1].container.classList.add("pageJS-partially-hidden");
            }
            this.stack.push(pageModel);
            
        }
        static async pushConfirmViewToStack(ConfirmView){
            if(this.stack.length < 1){
                const pageDiv = this.createPageDiv();
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
                pageDiv.classList.remove('pageJS-hidden-page');
            }
            const container = this.createConfirmContainerDiv(ConfirmView);
            this.stack[0].container.append(container);
            await ConfirmView.initialize(container.childNodes[1]);
            container.classList.remove("pageJS-hidden-modal");
            ConfirmView.container = container;
            if(this.stack.length > 1){
                this.stack[this.stack.length - 1].container.classList.add("pageJS-partially-hidden");
            }
            this.stack.push(ConfirmView);
            
        }
        static popView(reInitialize = true){
            const element = (this.stack.pop()).container;
            const onTransitionEnd = async (event) => {
                if (event.target !== element) return;
                element.removeEventListener("transitionend", onTransitionEnd);
                element.remove();
                if(this.stack.length === 1){
                    this.popView();

                    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                    if (metaThemeColor && this.originalThemeColor !== null) {
                        metaThemeColor.setAttribute('content', this.originalThemeColor);
                    }
                    document.documentElement.classList.remove('no-scroll'); 
                    document.body.classList.remove('no-scroll');
                    if(this.currentPage !== null){
                        this.reInitialize(this.currentPage);
                    }
                }
                else{
                    if(this.stack.length > 0){
                        this.stack[this.stack.length - 1].container.classList.remove("pageJS-partially-hidden");
                    }
                }
            };
            element.addEventListener("transitionend", onTransitionEnd);
            element.classList.add("pageJS-hidden-modal");
            if(this.stack.length > 1 && reInitialize){
                this.reInitialize(this.stack[this.stack.length - 1]);
            }
            else if(this.stack.length == 0 && reInitialize){
                if (typeof OnAppearing === 'function') {
                    console.log(`[PageJS] Functie OnAppearing is beschikbaar en wordt uitgevoerd!`);
                    OnAppearing();
                }
            }
        }
        static reInitialize(pageModel){
            // const pageModel = this.stack[this.stack.length - 1];
            pageModel.viewModel = new (Object.getPrototypeOf(pageModel.viewModel).constructor)();
            if(pageModel.rootElement){
                pageModel.rootElement.innerHTML = "";
                pageModel.initialize(pageModel.rootElement);
                console.log('[PageJS] Reinitializing page...');
            }
            else{
                console.warn('[PageJS] pageModel is undefined or empty.');
                console.warn('[PageJS] pageModel:', pageModel);
            }
        }
        
        static createPageDiv(){
            const element = document.createElement('div');
            element.id = "overlay";
            element.classList.add("pageJS-page");
            element.classList.add("pageJS-hidden-page");
            return element;
        }
        static createContainerDiv(pageModel) {
            const container = document.createElement('div');
            container.id = this.baseID + (this.stack.length + 1).toString();
            container.classList.add("pageJS-container", "pageJS-hidden-modal");
        
            const titleBar = document.createElement('div');
            titleBar.classList.add("pageJS-container__title-bar");
            container.append(titleBar);
        
            const title = document.createElement("h4");
            title.classList.add("pageJS-container__title");
            title.innerText = pageModel.title;
            titleBar.append(title);
        
            const closeButton = document.createElement('button');
            closeButton.classList.add("btn", "btn-primary", "text-light", "icon-button", "pageJS-container__close-button");
            closeButton.setAttribute("type", "button");
            if(pageModel.reInitialiseOnClose){
                closeButton.setAttribute("onclick", "PageJS.UIController.popView();");
            }
            else{
                closeButton.setAttribute("onclick", "PageJS.UIController.popView(false);");
            }
            titleBar.append(closeButton);
        
            const content = document.createElement('div');
            content.classList.add("pageJS-container__content");
            container.append(content);
        
            return container;
        }
        static createConfirmContainerDiv(pageModel) {
            const container = document.createElement('div');
            container.id = this.baseID + (this.stack.length + 1).toString();
            container.classList.add("pageJS-container", "pageJS-hidden-modal");
        
            const titleBar = document.createElement('div');
            titleBar.classList.add("pageJS-container__title-bar");
            container.append(titleBar);
        
            const title = document.createElement("h4");
            title.classList.add("pageJS-container__title");
            title.innerText = pageModel.title;
            titleBar.append(title);
        
            const closeButton = document.createElement('button');
            closeButton.classList.add("btn", "btn-primary", "text-light", "icon-button", "pageJS-container__close-button");
            closeButton.setAttribute("type", "button");
            closeButton.setAttribute("onclick", "PageJS.UIController.popView(false);");
            titleBar.append(closeButton);

            const confirmButton = document.createElement('button');
            confirmButton.classList.add("btn", "btn-primary", "text-light", "icon-button", "pageJS-container__confirm-button");
            confirmButton.setAttribute("type", "button");
            if(pageModel.reInitialiseOnClose){
                confirmButton.setAttribute("onclick", "PageJS.UIController.handleConfirmed();");
            }
            else{
                confirmButton.setAttribute("onclick", "PageJS.UIController.handleConfirmed(false);");
            }
            titleBar.append(confirmButton);
        
            const content = document.createElement('div');
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
        static handleConfirmed(){
            this.stack[this.stack.length - 1].callback();
            this.popView(this.stack[this.stack.length - 1].reInitialiseOnClose);
        }
        static toggleActivityIndicator(show = null) {
            const isCurrentlyVisible = !!this.activityIndicatorContainer;
        
            if (show === null) {
                show = !isCurrentlyVisible;
            }
        
            if (show && !isCurrentlyVisible) {
                this.activityIndicatorContainer = document.createElement('div');
                this.activityIndicatorContainer.classList.add("pageJS-loader-container");
                this.activityIndicatorContainer.classList.add("pageJS-hidden-page");
                document.body.append(this.activityIndicatorContainer);
                this.activityIndicatorContainer.style.zIndex = this.getHighestZIndex() + 1;
        
                const activityIndicator = document.createElement('span');
                activityIndicator.classList.add('pageJS-loader');
                this.activityIndicatorContainer.append(activityIndicator);
                this.activityIndicatorContainer.classList.remove("pageJS-hidden-page");
            } else if (!show && isCurrentlyVisible) {
                const onTransitionEnd = async (event) => {
                    if (event.target !== this.activityIndicatorContainer) return;
                    this.activityIndicatorContainer.removeEventListener("transitionend", onTransitionEnd);
                    this.activityIndicatorContainer.remove();
                    this.activityIndicatorContainer = null;
                };
                this.activityIndicatorContainer.addEventListener("transitionend", onTransitionEnd);
                this.activityIndicatorContainer.classList.add("pageJS-hidden-page");
            }
        }
        static toggleElementLoader(elementId, show = true) {
            const el = document.getElementById(elementId);
            if (!el) {
                console.warn(`[PageJS] toggleElementLoader: Element met ID '${elementId}' niet gevonden.`);
                return;
            }
        
            const existing = el.querySelector(".pageJS-element-loader");
        
            if (show) {
                if (existing) return;
        
                const overlay = document.createElement("div");
                overlay.className = "pageJS-element-loader";
                overlay.style.zIndex = this.getHighestZIndex() + 1;
        
                const spinner = document.createElement("span");
                spinner.classList.add("pageJS-loader");
                overlay.appendChild(spinner);
        
                if (getComputedStyle(el).position === "static") {
                    el.style.position = "relative";
                }
        
                el.style.filter = "brightness(0.7) blur(1px)";
                el.style.pointerEvents = "none";
                el.appendChild(overlay);
            } else {
                if (existing) {
                    el.style.filter = "";
                    el.style.pointerEvents = "";
                    existing.remove();
                }
            }
            
        }
        
        static visualizePromise(promise, loadingMessage = "Laden...", position = "bottom-right") {
            const popupId = "pageJS-notification-popup";
            const messageId = "pageJS-notification-message";
            let notification = document.getElementById(popupId);
            let messageBox;

            if (!notification) {
                notification = document.createElement('div');
                notification.id = popupId;
                notification.className = 'pageJS-notification';
                messageBox = document.createElement('div');
                messageBox.id = messageId;
                notification.appendChild(messageBox);
                document.body.appendChild(notification);
            } else {
                messageBox = document.getElementById(messageId);
            }

            let activeFetches = PageJS.UIController._activeFetches ?? 0;
            PageJS.UIController._activeFetches = ++activeFetches;

            document.body.style.cursor = 'progress';
            messageBox.innerHTML = `<span class="pageJS-loader"></span><span style="margin-left: 0.5rem;">${loadingMessage}</span>`;
            notification.style.zIndex = this.getHighestZIndex() + 1;
            notification.classList.forEach(cls => {
                if (cls.startsWith("pageJS-notification--")) {
                    notification.classList.remove(cls);
                }
            });
            notification.classList.add(`pageJS-notification--${position}`);
            notification.classList.add('show');

            const minVisibleTime = 1000;
            const shownAt = Date.now();

            const cleanup = (icon) => {
                const delay = Math.max(0, minVisibleTime - (Date.now() - shownAt));
                setTimeout(() => {
                    messageBox.innerHTML = icon;
                    setTimeout(() => {
                        if (--PageJS.UIController._activeFetches <= 0) {
                            document.body.style.cursor = 'default';
                            notification.classList.remove('show');
                        }
                    }, 1000);
                }, delay);
            };

            return promise
                .then(result => {
                    cleanup("✅");
                    return result;
                })
                .catch(error => {
                    cleanup("❌");
                    throw error;
                });
        }
    }
}