const BASE_URL = "https://techniekleren.aprize.nl/PageJS/";

const FILES = [
  "modalpage.js",  
  "page-view.js",
  "confirm-view.js",
  "uicontroller.js",
  "css/pageJS.css",
  "https://kit.fontawesome.com/08661490f4.js", // Externe Font Awesome script
  "startup.js",
  "router.js",
  "utils.js",
  "version.js",
  "push-setup.js"
];

function loadScript(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // Gebruik BASE_URL alleen voor lokale bestanden
    script.src = file.startsWith("http") ? file : BASE_URL + file;
    script.type = "text/javascript";
    script.onload = () => resolve(file + " loaded.");
    script.onerror = () => reject(new Error(file + " failed to load."));
    document.body.appendChild(script);
  });
}

function loadCSS(file) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  // Gebruik BASE_URL alleen voor lokale bestanden
  link.href = file.startsWith("http") ? file : BASE_URL + file;
  document.head.appendChild(link);
}

// Dynamisch bestanden laden
async function loadAllFiles() {
  for (const file of FILES) {
    if (file.endsWith(".js")) {
      // JavaScript-bestand
      try {
        await loadScript(file);
        //console.log(file + " successfully loaded.");
      } catch (error) {
        console.error('[PageJS] Error loading file:', error);
      }
    } else if (file.endsWith(".css")) {
      // CSS-bestand
      loadCSS(file);
    } else {
      //console.warn(file + " not supported for loading.");
    }
  }
  //console.log("All files loaded.");
}

// Start het laden van bestanden
(async () => {
  await loadAllFiles();
  new PageJS.Startup();
})();
