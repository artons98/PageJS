/*PageJS by APDSoftware*/
/* Version: 1.0.37 */
/*modalpage.js*/
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

/*page-view.js*/
window.PageJS = window.PageJS || {};
window.PageJSStylesURL = 'https://cdn.jsdelivr.net/gh/artons98/PageJS/dist/1.0.37/pageJS.css';

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




/*confirm-view.js*/
window.PageJS = window.PageJS || {};

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




/*uicontroller.js*/
window.PageJS = window.PageJS || {};

if (!PageJS.UIController) {
    PageJS.UIController = class {
        static currentPage = null;
        static stack = [];
        static baseID = "pageJSElement-";
        static originalThemeColor = null;
        static activityIndicatorContainer = null;
        static _activeFetches = 0;
        static _popstateBound = null; // back-button support

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
                if (!this._popstateBound) {
                    this._popstateBound = this.handlePopState.bind(this);
                    window.addEventListener('popstate', this._popstateBound);
                }
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
                if (!this._popstateBound) {
                    this._popstateBound = this.handlePopState.bind(this);
                    window.addEventListener('popstate', this._popstateBound);
                }
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
                    const nav = document.getElementsByTagName('nav')[0];
                    if (nav) nav.classList.remove('hidden');
                    if (this._popstateBound) {
                        window.removeEventListener('popstate', this._popstateBound);
                        this._popstateBound = null;
                    }
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

/*config.js*/
window.PageJS = window.PageJS || {};

if(!PageJS.Config){
    PageJS.Config = class{
        static settings = {
            prodBaseUrl: '',
            devBaseUrl: '',
            handleRouting: true,
            basePath: '',
            version: '1.0.0',
            replaceContent: true,
            appName: 'APDSoftware-App',
            modules: ["Products", "Orders", "Invoices", "Email", "Gallery", "Analytics", "Settings", "Inspections", "Trading"],
            colors:{
                primary: '#507882',
                secondary: '#64868f'
            }
        };

        static async initialize(){
            const origin = window.location.origin;
            const pathSegments = window.location.pathname.split('/').filter(s => s && !s.includes('.'));
            for(let i = pathSegments.length; i >= 0; i--){
                const subPath = '/' + pathSegments.slice(0, i).join('/') + (i > 0 ? '/' : '');
                const url = origin + subPath + 'assets/js/pagejs-config.json';
                try{
                    const response = await fetch(url);
                    if(response.ok){
                        this.settings = await response.json();
                        PageJS.basePath = this.settings.basePath || '';
                        const hostname = window.location.hostname;
                        const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
                        if(isDev && this.settings.devBaseUrl){
                            window.PageJS_BASE_URL = this.settings.devBaseUrl;
                        }else if(!isDev && this.settings.prodBaseUrl){
                            window.PageJS_BASE_URL = this.settings.prodBaseUrl;
                        }
                        console.info(`[PageJS.Config] pagejs-config.json gevonden op ${url}`);
                        console.info(`[PageJS.Config] Instellingen:`, this.settings);
                        // Modules tonen na laden van settings
                        if (window.PageJS && PageJS.Utils && typeof PageJS.Utils.showEnabledModules === "function") {
                            PageJS.Utils.showEnabledModules();
                        }
                        return;
                    }
                }catch(err){
                    // ignore and try parent path
                }
            }
            console.error('[PageJS.Config] pagejs-config.json niet gevonden.');
        }
    }
}

/*startup.js*/
window.PageJS = window.PageJS || {};

if(!PageJS.Startup){
  PageJS.Startup = class{
    constructor(){
      (async () => {
        await PageJS.Config.initialize();
        PageJS.Styling.injectStylesheet();
        
        if(PageJS.Config.settings && PageJS.Config.settings.logo){
            PageJS.Utils.applyLogoFromSettings();
        }
        if(PageJS.Config.settings && PageJS.Config.settings.colors){
            PageJS.Styling.applyColorsFromSettings();
        }
        if(PageJS.Config.settings.replaceContent){
            PageJS.Utils.replaceContentFromSettings();
            const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (mutation.target instanceof Element) {
                        PageJS.Utils.replaceContentFromSettings(mutation.target);
                    }
                }
            }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true // Belangrijk als je ook toevoegingen diep in de DOM wilt volgen
            });
        }
        await PageJS.Version.checkVersionAndUpdateIfNeeded();
        PageJS.Utils.waitForFunction("OnStartup", (fn) => {
          fn();
        });
      })();
    }
  }
}



/*router.js*/
window.PageJS = window.PageJS || {};

if (!PageJS.Router) {
  PageJS.Router = class {
    static async handleRouting({ autoResetUrl = true, delayBetweenSteps = 300, timeout = 5000 } = {}) {
      const configuredBase = PageJS.Config && PageJS.Config.settings ? PageJS.Config.settings.basePath : '';
      const basePath = configuredBase || PageJS.basePath || '';
      let pathSegments = window.location.pathname
        .split("/")
        .filter(p => p && p.trim());

      if (basePath) {
        const baseParts = basePath.split("/").filter(p => p && p.trim());
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

/*utils.js*/
window.PageJS = window.PageJS || {};

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
                const manifestUrl = PageJS.Utils.resolveWithBasePath(link.getAttribute('href'));
                const response = await fetch(manifestUrl);
                if (!response.ok) throw new Error("Manifest niet opgehaald");
                const manifest = await response.json();
                //console.info("App naam uit manifest:", manifest.name || manifest.short_name || 'APDSoftware-App');
                return manifest.name || manifest.short_name || "";
            } catch (e) {
                console.warn("Fout bij ophalen app naam uit manifest:", e);
                return "";
            }
        }
        static getAppNameFromConfig(){
            if (PageJS.Config && PageJS.Config.settings && PageJS.Config.settings.appName) {
                return PageJS.Config.settings.appName;
            }
            return "";
        }
        static async getAppName(){
            let appName = this.getAppNameFromConfig();
            if (appName && appName.trim() !== "") {
                return appName;
            }
            appName = await PageJS.Utils.getAppNameFromManifest();
            if (appName && appName.trim() !== "") {
                return appName;
            }
            console.warn("Geen app naam gevonden in configuratie of manifest, gebruik standaard 'APDSoftware-App'.");
            return 'APDSoftware-App';
        }
        static async replaceContentFromSettings(element = null) {
            if(element !== null) {
                if (!element.hasAttribute('data-replace-content')) {
                    return;
                }
                const settingName = element.getAttribute("data-replace-content");
                const settingValue = PageJS.Config && PageJS.Config.settings ? PageJS.Config.settings[settingName] : null;
                if (settingValue !== null && settingValue !== undefined) {
                    element.innerText = settingValue;
                } else {
                    console.warn(`Geen waarde gevonden voor instelling "${settingName}"`);
                }
                return;
            }
            const elements = document.querySelectorAll("[data-replace-content]");
            if (elements.length === 0) return;
            for (const el of elements) {
                const settingName = el.getAttribute("data-replace-content");
                if (!settingName) continue;
                const settingValue = PageJS.Config && PageJS.Config.settings ? PageJS.Config.settings[settingName] : null;
                if (settingValue !== null && settingValue !== undefined) {
                    el.innerText = settingValue;
                } else {
                    console.warn(`Geen waarde gevonden voor instelling "${settingName}"`);
                }
            }
        }
        static async loadCachedAndFresh({ cacheKey, fetchFunction, applyFunction }) {
            const appName = await PageJS.Utils.getAppName();
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
                fresh = await PageJS.UIController.visualizePromise(fetchFunction(), `Laden...`);
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
            //console.log(`[PageJS.Utils] Resolving path: ${path}`);
            if (/^https?:\/\//.test(path)){
                //console.log(`[PageJS.Utils] Path is al een absolute URL: ${path}`);
                return path; // Als het al een absolute URL is, retourneer het direct.
            }
            const base = (PageJS.basePath || "").replace(/\/$/, "");
            //console.log(`[PageJS.Utils] Base path: ${base}`);
            if (path.startsWith("/")) {
                if (base && path.startsWith(base + "/")) {
                    //console.log(`[PageJS.Utils] Path begint met basePath: ${base}`);
                    return window.location.origin + path;
                }
                //console.log(`[PageJS.Utils] Path begint met een slash, maar niet met basePath: ${base}`);
                return window.location.origin + base + path;

            }
            //console.log(`[PageJS.Utils] Path begint niet met een slash: ${path}`);
            return window.location.origin + base + "/" + path;
        }

        static applyLogoFromSettings() {
            if (!PageJS.Config || !PageJS.Config.settings || !PageJS.Config.settings.logo) return;

            let logoUrl = PageJS.Config.settings.logo;
            if (!/^https?:\/\//.test(logoUrl)) {
                if (window.PageJS_BASE_URL) {
                    const base = window.PageJS_BASE_URL.replace(/\/$/, '');
                    logoUrl = base + (logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl);
                } else {
                    logoUrl = PageJS.Utils.resolveWithBasePath(logoUrl);
                }
            }

            const imgEl = document.querySelector('[data-logo-image]');
            if (imgEl) {
                imgEl.setAttribute('src', logoUrl);
            }

            const textEl = document.querySelector('[data-logo-text]');
            if (textEl) {
                textEl.classList.add('visually-hidden');
            }
        }

        /**
         * Maakt elementen zichtbaar waarvan het data-module-id voorkomt in PageJS.Config.settings.modules.
         */
        static showEnabledModules() {
            if (!PageJS.Config || !PageJS.Config.settings || !Array.isArray(PageJS.Config.settings.modules)) return;
            const enabledModules = PageJS.Config.settings.modules;
            document.querySelectorAll('[data-module-id]').forEach(el => {
                const moduleId = el.getAttribute('data-module-id');
                if (enabledModules.includes(moduleId)) {
                    el.classList.remove('visually-hidden');
                }
            });
        }
    }
}

// Extend Utils with Styling alias and ContextMenu utility
(function(){
    // Ensure namespace exists
    if (!window.PageJS || !PageJS.Utils) return;

    // 1) Styling alias so it's available as PageJS.Utils.Styling
    try{
        if (PageJS.Styling) {
            PageJS.Utils.Styling = PageJS.Styling;
        }
    }catch{}

    // 2) ContextMenu utility: gebruikt data-context-menu (id) om een bestaand verborgen menu te tonen op cursorpositie
    if (!PageJS.Utils.ContextMenu) {
        PageJS.Utils.ContextMenu = class {
            static _menuEl = null; // huidige getoonde menu-element
            static _outsideHandlerBound = null;

            /**
             * Toont een bestaand contextmenu (ul.dropdown-menu) op cursorpositie.
             * Zoekt naar data-context-menu op het target of ancestors.
             * De waarde is een id of #id van een reeds bestaande (verborgen) menu-element in de UI.
             * @param {MouseEvent} e
             */
            static ShowAtCursor(e){
                const trigger = (e.target && e.target.closest) ? e.target.closest('[data-context-menu]') : null;
                if (!trigger) return; // stond geen attribuut; laat native menu

                try{ e.preventDefault(); }catch{}

                const rawId = (trigger.getAttribute('data-context-menu') || '').trim();
                if (!rawId) return;
                const menuId = rawId.replace(/^#/, '');
                const menuEl = document.getElementById(menuId);
                if (!menuEl){
                    console.warn(`[PageJS.ContextMenu] Menu element met id '${menuId}' niet gevonden.`);
                    return;
                }

                this._showMenuAt(menuEl, e.clientX ?? 0, e.clientY ?? 0);
            }

            static _showMenuAt(menuEl, x, y){
                // Bewaar eerdere inline style om te kunnen herstellen
                if (!menuEl.dataset.pagejsPrevPosSaved){
                    menuEl.dataset.pagejsPrevPosition = menuEl.style.position || '';
                    menuEl.dataset.pagejsPrevLeft = menuEl.style.left || '';
                    menuEl.dataset.pagejsPrevTop = menuEl.style.top || '';
                    menuEl.dataset.pagejsPrevZ = menuEl.style.zIndex || '';
                    menuEl.dataset.pagejsPrevVisibility = menuEl.style.visibility || '';
                    menuEl.dataset.pagejsPrevDisplay = menuEl.style.display || '';
                    menuEl.dataset.pagejsPrevPosSaved = '1';
                }

                // Start zichtbaar maken om te kunnen meten
                menuEl.classList.add('show');
                menuEl.style.position = 'fixed';
                menuEl.style.left = `${x}px`;
                menuEl.style.top = `${y}px`;
                menuEl.style.visibility = 'hidden';
                menuEl.style.zIndex = (PageJS?.UIController?.getHighestZIndex?.() || 10000) + 1;

                // Bereken viewport-correctie
                const rect = menuEl.getBoundingClientRect();
                const margin = 4;
                let left = x;
                let top = y;
                if (rect.right > window.innerWidth) left = Math.max(margin, window.innerWidth - rect.width - margin);
                if (rect.bottom > window.innerHeight) top = Math.max(margin, window.innerHeight - rect.height - margin);
                if (left < margin) left = margin;
                if (top < margin) top = margin;

                menuEl.style.left = `${left}px`;
                menuEl.style.top = `${top}px`;
                menuEl.style.visibility = 'visible';

                this._menuEl = menuEl;
                // Bind interne blockers zodat clicks binnen het menu niet doorbubbelen naar onderliggende elementen
                this._bindMenuInternalBlockers(menuEl);
                this._attachOutsideHandlers();
            }

            static hide(){
                const el = this._menuEl;
                if (!el) return;
                // Verwijder interne blockers
                this._unbindMenuInternalBlockers(el);
                el.classList.remove('show');
                // Herstel eerdere inline styles
                if (el.dataset.pagejsPrevPosSaved === '1'){
                    el.style.position = el.dataset.pagejsPrevPosition || '';
                    el.style.left = el.dataset.pagejsPrevLeft || '';
                    el.style.top = el.dataset.pagejsPrevTop || '';
                    el.style.zIndex = el.dataset.pagejsPrevZ || '';
                    el.style.visibility = el.dataset.pagejsPrevVisibility || '';
                    // display is niet door ons ingesteld behalve via show-class; laat CSS dit bepalen
                    delete el.dataset.pagejsPrevPosition;
                    delete el.dataset.pagejsPrevLeft;
                    delete el.dataset.pagejsPrevTop;
                    delete el.dataset.pagejsPrevZ;
                    delete el.dataset.pagejsPrevVisibility;
                    delete el.dataset.pagejsPrevDisplay;
                    delete el.dataset.pagejsPrevPosSaved;
                }
                this._menuEl = null;
                this._detachOutsideHandlers();
            }

            static _bindMenuInternalBlockers(menuEl){
                if (menuEl._pagejsMenuBlockersBound) return;
                const stop = (ev) => { try{ ev.stopPropagation(); }catch{} };
                const preventAndStop = (ev) => { try{ ev.preventDefault(); }catch{} try{ ev.stopPropagation(); }catch{} };
                const hideOnClick = (ev) => {
                    // Laat target-handlers en default doorgaan, maar voorkom bubbelen voorbij het menu en sluit daarna
                    try{ ev.stopPropagation(); }catch{}
                    setTimeout(() => { try{ PageJS.Utils.ContextMenu.hide(); }catch{} }, 0);
                };
                // Bubbling-phase: laat targets binnen menu hun handlers krijgen, maar laat het niet voorbij het menu komen
                menuEl.addEventListener('click', stop, false);
                menuEl.addEventListener('click', hideOnClick, false);
                menuEl.addEventListener('mousedown', stop, false);
                menuEl.addEventListener('mouseup', stop, false);
                menuEl.addEventListener('pointerdown', stop, false);
                menuEl.addEventListener('touchstart', stop, false);
                // voorkom native contextmenu binnen ons menu en doorsijpelen
                menuEl.addEventListener('contextmenu', preventAndStop, false);
                menuEl._pagejsMenuBlockersBound = { stop, preventAndStop, hideOnClick };
            }

            static _unbindMenuInternalBlockers(menuEl){
                const b = menuEl._pagejsMenuBlockersBound;
                if (!b) return;
                menuEl.removeEventListener('click', b.stop, false);
                menuEl.removeEventListener('click', b.hideOnClick, false);
                menuEl.removeEventListener('mousedown', b.stop, false);
                menuEl.removeEventListener('mouseup', b.stop, false);
                menuEl.removeEventListener('pointerdown', b.stop, false);
                menuEl.removeEventListener('touchstart', b.stop, false);
                menuEl.removeEventListener('contextmenu', b.preventAndStop, false);
                delete menuEl._pagejsMenuBlockersBound;
            }

            static _attachOutsideHandlers(){
                if (this._outsideHandlerBound) return;
                this._outsideHandlerBound = (ev) => {
                    const el = this._menuEl;
                    if (!el) return;
                    if (ev.type === 'keydown' && ev.key === 'Escape') { this.hide(); return; }
                    if (ev.type === 'scroll' || ev.type === 'resize') { this.hide(); return; }
                    if (ev.type === 'contextmenu'){
                        // Altijd blokkeren buiten het menu
                        if (!el.contains(ev.target)) { try{ ev.preventDefault(); }catch{} try{ ev.stopPropagation(); }catch{} this.hide(); return; }
                        // Binnen menu: blokkeer native context menu
                        try{ ev.preventDefault(); }catch{}
                        try{ ev.stopPropagation(); }catch{}
                        return;
                    }
                    if (ev.type === 'click'){
                        if (!el.contains(ev.target)) { try{ ev.preventDefault(); }catch{} try{ ev.stopPropagation(); }catch{} this.hide(); return; }
                    }
                    if (ev.type === 'pointerdown'){
                        if (!el.contains(ev.target)) { try{ ev.preventDefault(); }catch{} try{ ev.stopPropagation(); }catch{} this.hide(); return; }
                    }
                };
                document.addEventListener('click', this._outsideHandlerBound, true);
                document.addEventListener('pointerdown', this._outsideHandlerBound, true);
                window.addEventListener('scroll', this._outsideHandlerBound, true);
                window.addEventListener('resize', this._outsideHandlerBound, true);
                document.addEventListener('contextmenu', this._outsideHandlerBound, true);
                document.addEventListener('keydown', this._outsideHandlerBound, true);
            }

            static _detachOutsideHandlers(){
                if (!this._outsideHandlerBound) return;
                document.removeEventListener('click', this._outsideHandlerBound, true);
                document.removeEventListener('pointerdown', this._outsideHandlerBound, true);
                window.removeEventListener('scroll', this._outsideHandlerBound, true);
                window.removeEventListener('resize', this._outsideHandlerBound, true);
                document.removeEventListener('contextmenu', this._outsideHandlerBound, true);
                document.removeEventListener('keydown', this._outsideHandlerBound, true);
                this._outsideHandlerBound = null;
            }

            /** Bind globale listener voor rechtermuisklik */
            static attach(){
                if (!this._bound) {
                    this._bound = true;
                    document.addEventListener('contextmenu', (e) => {
                        try{ PageJS.Utils.ContextMenu.ShowAtCursor(e); }catch(err){ console.warn('[PageJS.ContextMenu] Fout bij tonen menu:', err); }
                    });
                }
            }
        }

        // Direct activeren zodat rechtermuisklik werkt
        try{ PageJS.Utils.ContextMenu.attach(); }catch{}
    }
})();

/*version.js*/
window.PageJS = window.PageJS || {};

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
                }else if (PageJS.Config.settings){
                    currentVersion = PageJS.Config.settings.version;
                    console.info("Huidige versie uit configuratie:", currentVersion);
                } else {
                    currentVersion = await this.getVersionFromManifest();
                    console.info("Huidige versie uit manifest:", currentVersion);
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

    PageJS.Styling = class{
        static injectStylesheet(){
            if(!window.PageJSStylesURL) return;
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = window.PageJSStylesURL;
            try { link.crossOrigin = "anonymous"; } catch {}
            link.addEventListener('load', () => {
                try { PageJS.Styling.applyColorsFromSettings(); } catch {}
            });
            document.head.appendChild(link);
        }
        static applyColorsFromSettings(){
            try{
                const colors = PageJS?.Config?.settings?.colors;
                if (!colors || (!colors.primary && !colors.secondary)) return;
                
                const root = document.documentElement;
                const getVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

                // Normalize helpers
                const clampByte = (n) => Math.max(0, Math.min(255, n|0));
                const rgbToHex = (r,g,b) => {
                    const to2 = (n) => clampByte(n).toString(16).padStart(2,'0');
                    return `#${to2(r)}${to2(g)}${to2(b)}`;
                };
                const parseComputedRgb = (rgbStr) => {
                    const m = String(rgbStr).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
                    return m ? [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)] : null;
                };
                const toRgbString = (val) => {
                    if (!val) return null;
                    const testEl = document.createElement('span');
                    testEl.style.position = 'absolute';
                    testEl.style.left = '-9999px';
                    testEl.style.top = '-9999px';
                    testEl.style.color = val;
                    document.body.appendChild(testEl);
                    const computed = getComputedStyle(testEl).color; // rgb(...)
                    document.body.removeChild(testEl);
                    const triplet = parseComputedRgb(computed);
                    return triplet ? `${triplet[0]}, ${triplet[1]}, ${triplet[2]}` : null;
                };
                const toHexString = (val) => {
                    const triplet = toRgbString(val)?.split(',').map(s => parseInt(s.trim(),10));
                    return Array.isArray(triplet) ? rgbToHex(triplet[0], triplet[1], triplet[2]) : null;
                };

                // Resolve originals from the current theme variables
                const originalPrimaryHex = toHexString(getVar('--bs-primary')) || '';
                const originalSecondaryHex = toHexString(getVar('--bs-secondary')) || '';
                const originalPrimaryRgb = toRgbString(getVar('--bs-primary')) || '';
                const originalSecondaryRgb = toRgbString(getVar('--bs-secondary')) || '';

                if (!originalPrimaryHex && !originalSecondaryHex) return;

                // Resolve new target colors
                const newPrimaryHex = colors.primary ? toHexString(colors.primary) || colors.primary : null;
                const newSecondaryHex = colors.secondary ? toHexString(colors.secondary) || colors.secondary : null;
                const newPrimaryRgb = colors.primary ? toRgbString(colors.primary) : null;
                const newSecondaryRgb = colors.secondary ? toRgbString(colors.secondary) : null;

                // Build matchers that preserve alpha when present
                const buildRgbMatcher = (rgbStr) => {
                    if (!rgbStr) return null;
                    const [r,g,b] = rgbStr.split(',').map(s => s.trim());
                    return new RegExp(`(rgba?)\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}(\\s*,\\s*([^)]+))?\\)`, 'ig');
                };
                const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const buildHexMatcher = (hexStr) => hexStr ? new RegExp(escapeReg(hexStr), 'ig') : null;

                const primaryHexMatcher = buildHexMatcher(originalPrimaryHex);
                const secondaryHexMatcher = buildHexMatcher(originalSecondaryHex);
                const primaryRgbMatcher = buildRgbMatcher(originalPrimaryRgb);
                const secondaryRgbMatcher = buildRgbMatcher(originalSecondaryRgb);

                const replaceColorTokens = (value, hexMatcher, rgbMatcher, toHex, toRgb) => {
                    let out = value;
                    if (hexMatcher && toHex) out = out.replace(hexMatcher, toHex);
                    if (rgbMatcher && toRgb) {
                        out = out.replace(rgbMatcher, (full, fn, alphaGroup, alphaVal) => {
                            // Preserve alpha when present
                            if (alphaGroup) return `rgba(${toRgb},${alphaVal})`;
                            return `rgb(${toRgb})`;
                        });
                    }
                    return out;
                };

                const processRuleStyle = (style) => {
                    if (!style) return;
                    for (let i = style.length - 1; i >= 0; i--) {
                        const prop = style.item(i);
                        const priority = style.getPropertyPriority(prop);
                        const val = style.getPropertyValue(prop);
                        if (!val) continue;

                        let newVal = val;

                        // Replace any literal primary matches
                        if (newPrimaryHex && (primaryHexMatcher || primaryRgbMatcher)) {
                            newVal = replaceColorTokens(newVal, primaryHexMatcher, primaryRgbMatcher, newPrimaryHex, newPrimaryRgb);
                        }
                        // Replace any literal secondary matches
                        if (newSecondaryHex && (secondaryHexMatcher || secondaryRgbMatcher)) {
                            newVal = replaceColorTokens(newVal, secondaryHexMatcher, secondaryRgbMatcher, newSecondaryHex, newSecondaryRgb);
                        }

                        if (newVal !== val) {
                            style.setProperty(prop, newVal, priority);
                        }
                    }
                };

                // Walk CSSOM
                const processRules = (rules) => {
                    if (!rules) return;
                    for (const rule of Array.from(rules)) {
                        if (rule.style) {
                            processRuleStyle(rule.style);
                        }
                        // Recurse into grouping rules (media, supports, etc.)
                        if (rule.cssRules) {
                            processRules(rule.cssRules);
                        }
                    }
                };

                for (const sheet of Array.from(document.styleSheets)) {
                    let rules = null;
                    try { rules = sheet.cssRules; } catch { continue; } // Skip cross-origin without CORS
                    if (!rules) continue;
                    processRules(rules);
                }

                // Update inline style attributes as well
                document.querySelectorAll('[style]').forEach(el => {
                    const cssText = el.getAttribute('style') || '';
                    let updated = cssText;
                    if (newPrimaryHex && (primaryHexMatcher || primaryRgbMatcher)) {
                        updated = replaceColorTokens(updated, primaryHexMatcher, primaryRgbMatcher, newPrimaryHex, newPrimaryRgb);
                    }
                    if (newSecondaryHex && (secondaryHexMatcher || secondaryRgbMatcher)) {
                        updated = replaceColorTokens(updated, secondaryHexMatcher, secondaryRgbMatcher, newSecondaryHex, newSecondaryRgb);
                    }
                    if (updated !== cssText) {
                        el.setAttribute('style', updated);
                    }
                });

                // Also keep variables aligned for components that use them
                let cssVars = ':root{';
                if (newPrimaryHex) cssVars += `--bs-primary: ${newPrimaryHex};`;
                if (newPrimaryRgb) cssVars += `--bs-primary-rgb: ${newPrimaryRgb};`;
                if (newSecondaryHex) cssVars += `--bs-secondary: ${newSecondaryHex};`;
                if (newSecondaryRgb) cssVars += `--bs-secondary-rgb: ${newSecondaryRgb};`;
                cssVars += '}';

                let overrideStyle = document.head.querySelector('style[data-pagejs="bootstrap-color-overrides"]');
                if (!overrideStyle) {
                    overrideStyle = document.createElement('style');
                    overrideStyle.setAttribute('data-pagejs', 'bootstrap-color-overrides');
                    document.head.appendChild(overrideStyle);
                }
                overrideStyle.textContent = cssVars;
            }catch(e){
                console.warn('[PageJS.Styling] Kleurvariabelen konden niet worden toegepast:', e);
            }
        }
    }
}

if (window.PageJS && PageJS.Startup) {
    new PageJS.Startup();
}

