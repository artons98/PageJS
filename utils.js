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

            function getNestedProperty(path) {
                return path.split('.').reduce((obj, key) => obj && obj[key], window);
            }

            const check = () => {
                const fn = getNestedProperty(name);
                if (typeof fn === 'function') {
                    console.log(`[PageJS] Functie ${name} is beschikbaar en wordt uitgevoerd!`);
                    clearInterval(timer);
                    callback(fn);
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
