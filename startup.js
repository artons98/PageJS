const waitForFunction = (name, callback, timeout = 10000) => {
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
  
waitForFunction("OnStartup", (fn) => {
fn(); // Voer de functie uit
});
