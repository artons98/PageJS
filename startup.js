const waitForFunction = (name, callback, timeout = 10000) => {
    const interval = 100;
    let waited = 0;
  
    const check = () => {
      if (typeof window[name] === 'function') {
        console.log(`Functie ${name} is beschikbaar!`);
        clearInterval(timer);
        callback(window[name]);
      } else if (waited >= timeout) {
        clearInterval(timer);
        console.warn(`Timeout: functie ${name} is niet gevonden`);
      }
      waited += interval;
    };
  
    const timer = setInterval(check, interval);
  };
  
waitForFunction("OnStartup", (fn) => {
fn(); // Voer de functie uit
});
