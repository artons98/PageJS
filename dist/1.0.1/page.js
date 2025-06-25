/*PageJS by APDSoftware*/
/*modalpage.js*/class Page{
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
/*page-view.js*/window.PageJS = window.PageJS || {};

if(!PageJS.PageView){
    PageJS.PageView = class {
    constructor(title, viewModel, htmlPath, container = null, reInitialiseOnClose = true) {
        this.title = title;
        this.viewModel = viewModel;
        this.htmlPath = htmlPath;
        this.container = container;
        this.rootElement = null;
        this.reInitialiseOnClose = reInitialiseOnClose;
    }
    async initialize(rootElement = this.rootElement){
        PageJS.UIController.toggleActivityIndicator(true);
        this.rootElement = rootElement;
        if (!this.rootElement.hasChildNodes()) {
            await this.addHTML(this.rootElement);
        }
        await this.onAppearing();
        PageJS.UIController.toggleActivityIndicator(false);
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
                console.error('[PageJS] Geen viewModel beschikbaar voor binding.');
            }
        }
    }
    async addHTML(rootElement) {
        const url = PageJS.Utils.resolveWithBasePath(this.htmlPath);

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
            console.warn(`[PageJS] Div met id "${fileName}" niet gevonden in het HTML-bestand.`);
        }
    
        return;
    }


    }

}



/*confirm-view.js*/window.PageJS = window.PageJS || {};

if(!PageJS.ConfirmView){
    PageJS.ConfirmView = class {
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
        PageJS.UIController.toggleActivityIndicator(true);
        this.rootElement = rootElement;
        if (!this.rootElement.hasChildNodes()) {
            await this.addHTML(this.rootElement);
        }
        await this.onAppearing();
        PageJS.UIController.toggleActivityIndicator(false);
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
                console.error('[PageJS] Geen viewModel beschikbaar voor binding.');
            }
        }
    }
    async addHTML(rootElement) {
        const url = PageJS.Utils.resolveWithBasePath(this.htmlPath);

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
            console.warn(`[PageJS] Div met id "${fileName}" niet gevonden in het HTML-bestand.`);
        }
    
        return;
    }


    }

}



/*uicontroller.js*/window.PageJS = window.PageJS || {};

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
                this.stack.push(new PageJS.PageView("", null, "", pageDiv));

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
        static async pushConfirmViewToStack(confirmView){
            if(this.stack.length < 1){
                const pageDiv = this.createPageDiv();
                document.body.append(pageDiv);
                pageDiv.style.zIndex = this.getHighestZIndex() + 1;
                this.stack.push(new PageJS.PageView("", null, "", pageDiv));

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
            const container = this.createConfirmContainerDiv(confirmView);
            this.stack[0].container.append(container);
            await confirmView.initialize(container.childNodes[1]);
            container.classList.remove("pageJS-hidden-modal");
            confirmView.container = container;
            if(this.stack.length > 1){
                this.stack[this.stack.length - 1].container.classList.add("pageJS-partially-hidden");
            }
            this.stack.push(confirmView);
            
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
/*startup.js*/window.PageJS = window.PageJS || {};

if(!PageJS.Startup){
  PageJS.Startup = class{
    constructor(){
      PageJS.Utils.waitForFunction("OnStartup", (fn) => {
        fn();
      });
    }
  }
}


/*router.js*/window.PageJS = window.PageJS || {};

if (!PageJS.Router) {
  PageJS.Router = class {
    static async handleRouting({ autoResetUrl = true, delayBetweenSteps = 300, timeout = 5000, basePath } = {}) {
      PageJS.basePath = basePath || PageJS.basePath || "";
      let pathSegments = window.location.pathname
        .split("/")
        .filter(p => p && p.trim());

      if (PageJS.basePath) {
        const baseParts = PageJS.basePath.split("/").filter(p => p && p.trim());
        const maybeBase = pathSegments.slice(0, baseParts.length).join("/");
        if (maybeBase === baseParts.join("/")) {
          pathSegments = pathSegments.slice(baseParts.length);
        }
      }

      if (pathSegments.length === 0) return;

      for (const segment of pathSegments) {
        try {
          const selector = `[data-route="${segment}"]`;
          const el = await PageJS.Utils.waitForElement(selector, timeout);
          el.click();
          await PageJS.Utils.sleep(delayBetweenSteps);
        } catch (err) {
          console.warn(`PageJS.Router: element voor segment "${segment}" niet gevonden.`, err);
          break;
        }
      }

      if (autoResetUrl) {
        window.history.replaceState({}, "", basePath || "/");
      }
    }
  };
}
/*utils.js*/window.PageJS = window.PageJS || {};

if(!PageJS.Utils){
    PageJS.Utils = class{
        static waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
        
                const observer = new MutationObserver(() => {
                    const elNow = document.querySelector(selector);
                    if (elNow) {
                    observer.disconnect();
                    resolve(elNow);
                    }
                });
        
                observer.observe(document.body, { childList: true, subtree: true });
        
                setTimeout(() => {
                    observer.disconnect();
                    reject(`Timeout na ${timeout}ms voor ${selector}`);
                }, timeout);
            });
        }
        static waitForFunction = (name, callback, timeout = 10000) => {
            const interval = 100;
            let waited = 0;
          
            const check = () => {
                if (typeof window[name] === 'function') {
                    console.log(`[PageJS] Functie ${name} is beschikbaar en wordt uitgevoerd!`);
                    clearInterval(timer);
                    callback(window[name]);
                } else if (waited >= timeout) {
                    clearInterval(timer);
                    console.warn(`[PageJS] Timeout: functie ${name} is niet gevonden`);
                }
                waited += interval;
            };
          
            const timer = setInterval(check, interval);
          };
      
        static sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        static async getAppNameFromManifest() {
            try {
                const link = document.querySelector('link[rel="manifest"]');
                if (!link) throw new Error("Manifest link niet gevonden");
                const response = await fetch(link.href);
                if (!response.ok) throw new Error("Manifest niet opgehaald");
                const manifest = await response.json();
                return manifest.name || manifest.short_name || 'APDSoftware-App';
            } catch (e) {
                console.warn("Fout bij ophalen app naam uit manifest:", e);
                return 'APDSoftware-App';
            }
        }
        static async loadCachedAndFresh({ cacheKey, fetchFunction, applyFunction }) {
            const appName = await PageJS.Utils.getAppNameFromManifest();
            const fullCacheKey = `${appName}_${cacheKey}`;
            const cached = localStorage.getItem(fullCacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    applyFunction(parsed, { fromCache: true });
                } catch (e) {
                    console.warn("Corrupt cache voor " + fullCacheKey);
                }
            }
        
            let fresh;
            try {
                fresh = await PageJS.UIController.visualizePromise(fetchFunction(), `Ophalen: ${fullCacheKey}`);
            } catch (err) {
                console.warn("UIController niet beschikbaar of fout tijdens visualisatie, fetch zonder visualisatie.");
                fresh = await fetchFunction();
            }
            localStorage.setItem(fullCacheKey, JSON.stringify(fresh));
            applyFunction(fresh, { fromCache: false });
        }
        static remToPx(rem) {
            return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
        }
        static debounce(fn, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        }

        /**
         * Geeft een absolute URL terug waarbij rekening wordt gehouden met de ingestelde basePath.
         * @param {string} path
         * @returns {string}
         */
        static resolveWithBasePath(path) {
            if (/^https?:\/\//.test(path)) return path;
            const base = (PageJS.basePath || "").replace(/\/$/, "");

            if (path.startsWith("/")) {
                if (base && path.startsWith(base + "/")) {
                    return window.location.origin + path;
                }
                return window.location.origin + base + path;
            }
            return window.location.origin + base + "/" + path;
        }
    }
}
/*version.js*/window.PageJS = window.PageJS || {};

if(!PageJS.Version){
    PageJS.Version = class {
        static init(versionFilePath){
            if(versionFilePath){
                window.VERSIONFILEPATH = versionFilePath;
            }
            this.checkVersionAndUpdateIfNeeded();
        }
        static async getVersionFromManifest(){
            try{
                const link = document.querySelector('link[rel="manifest"]');
                if(!link) throw new Error('Manifest link niet gevonden');
                const manifestUrl = PageJS.Utils.resolveWithBasePath(link.getAttribute('href'));
                const response = await fetch(manifestUrl + '?nocache=' + new Date().getTime());
                if(!response.ok) throw new Error('Manifest niet opgehaald');
                const manifest = await response.json();
                return manifest.version;
            }catch(e){
                console.warn('Fout bij ophalen versie uit manifest:', e);
                return null;
            }
        }
        static async checkVersionAndUpdateIfNeeded() {
            try {
                let currentVersion;
                if (window.VERSIONFILEPATH) {
                    const versionUrl = PageJS.Utils.resolveWithBasePath(window.VERSIONFILEPATH);
                    const response = await fetch(`${versionUrl}?nocache=` + new Date().getTime());
                    const data = await response.json();
                    currentVersion = data.version;
                } else {
                    currentVersion = await this.getVersionFromManifest();
                }
                if(!currentVersion) return;
                const savedVersion = localStorage.getItem('siteVersion');

                if (savedVersion !== currentVersion) {
                    console.log(`New version detected: ${currentVersion} (was ${savedVersion})`);
                    if ('caches' in window) {
                        const keys = await caches.keys();
                        await Promise.all(keys.map(k => caches.delete(k)));
                    }
                    localStorage.setItem('siteVersion', currentVersion);
                    try{
                        if ("serviceWorker" in navigator) {
                            var registration = await navigator.serviceWorker.getRegistration();
                            registration.update();
                        }
                    }catch{}
                    location.reload(true);
                }
            } catch (err) {
                console.error('Version control failed:', err);
            }
        }
        static waitForVariable = (name, callback, timeout = 10000) => {
            const interval = 100;
            let waited = 0;
            const check = () => {
                if (typeof window[name] === 'string') {
                    console.log(`[PageJS] variabele ${name} is beschikbaar en wordt gebruikt!`);
                    clearInterval(timer);
                    callback();
                } else if (waited >= timeout) {
                    clearInterval(timer);
                    console.warn(`[PageJS] Timeout: variabele ${name} is niet gevonden`);
                    callback();
                }
                waited += interval;
            };

            const timer = setInterval(check, interval);
        };
    }
}

PageJS.Version.waitForVariable("VERSIONFILEPATH", () => {
    PageJS.Version.checkVersionAndUpdateIfNeeded();
});

/*copyright*/
