window.PageJS = window.PageJS || {};

if(!PageJS.VersionJS){
    PageJS.VersionJS = class {
        static init(versionFilePath){
            window.VERSIONFILEPATH = versionFilePath;
            this.checkVersionAndUpdateIfNeeded();
        }
        static async checkVersionAndUpdateIfNeeded() {
        try {
            const response = await fetch(`${window.VERSIONFILEPATH}?nocache=` + new Date().getTime());
            const data = await response.json();
            const currentVersion = data.version;
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
