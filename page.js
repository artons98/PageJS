const BASE_URL = "https://cdn.jsdelivr.net/gh/artons98/PageJS/";

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
];

function loadScript(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
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
  link.href = file.startsWith("http") ? file : BASE_URL + file;
  document.head.appendChild(link);
}

// Dynamisch bestanden laden
async function loadAllFiles() {
  for (const file of FILES) {
    if (file.endsWith(".js")) {
      try {
        await loadScript(file);
      } catch (error) {
        console.error('[PageJS] Error loading file:', error);
      }
    } else if (file.endsWith(".css")) {
      loadCSS(file);
    }
  }
}

// Start het laden van bestanden
(async () => {
  await loadAllFiles();
  new PageJS.Startup();
})();