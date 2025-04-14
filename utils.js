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
    }
}