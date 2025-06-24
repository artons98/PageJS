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
                const response = await fetch(link.href);
                if (!response.ok) throw new Error("Manifest niet opgehaald");
                const manifest = await response.json();
                return manifest.name || manifest.short_name || 'APDSoftware-App';
            } catch (e) {
                console.warn("Fout bij ophalen app naam uit manifest:", e);
                return 'defaultApp';
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
    }
}
