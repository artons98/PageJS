window.PageJS = window.PageJS || {};

PageJS.VERSION = window.PageJS_VERSION || "1.0.1";
if(!PageJS.appendVersion){
    PageJS.appendVersion = function(url){
        if(/^https?:\/\//.test(url)) return url;
        const sep = url.includes('?') ? '&' : '?';
        return url + sep + 'v=' + PageJS.VERSION;
    };
}

if(!PageJS.VersionJS){
    PageJS.VersionJS = class {
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

PageJS.VersionJS.waitForVariable("VERSIONFILEPATH", () => {
    PageJS.VersionJS.checkVersionAndUpdateIfNeeded();
});
