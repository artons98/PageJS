// URL van de GitHub-repo via jsDelivr
const BASE_URL = "https://cdn.jsdelivr.net/gh/artons98/PageJS/";

// Lijst van bestanden in je project
const FILES = [
  "modalpage.js",  
  "page.js",
  "uicontroller.js",
  "css/pageJS.css",
];

// Functie om een script te laden
function loadScript(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = BASE_URL + file;
    script.type = "text/javascript";
    script.onload = () => resolve(file + " loaded.");
    script.onerror = () => reject(new Error(file + " failed to load."));
    document.body.appendChild(script);
  });
}

// Functie om een CSS-bestand te laden
function loadCSS(file) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = BASE_URL + file;
  document.head.appendChild(link);
  console.log(file + " CSS loaded.");
}

// Dynamisch bestanden laden
async function loadAllFiles() {
  console.log("PageJS is loading files...");
  for (const file of FILES) {
    if (file.endsWith(".js")) {
      // JavaScript-bestand
      try {
        await loadScript(file);
        //console.log(file + " successfully loaded.");
      } catch (error) {
        console.error(error);
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
loadAllFiles();