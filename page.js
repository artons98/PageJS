(function(){
  const DEFAULT_BASE = "https://cdn.jsdelivr.net/gh/artons98/PageJS/";

  function ensureTrailingSlash(url){
    return url.endsWith('/') ? url : url + '/';
  }

  function getBaseUrl(){
    if (window.PageJS_BASE_URL) {
      return ensureTrailingSlash(window.PageJS_BASE_URL);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('pagejs_base');
      if(fromQuery){
        return ensureTrailingSlash(fromQuery);
      }
    } catch(err) {
      console.warn('PageJS loader: could not parse query params', err);
    }
    return DEFAULT_BASE;
  }

  const BASE_URL = getBaseUrl();

  const FILES = [
    'modalpage.js',
    'page-view.js',
    'confirm-view.js',
    'uicontroller.js',
    'css/pageJS.css',
    'https://kit.fontawesome.com/08661490f4.js',
    'startup.js',
    'router.js',
    'utils.js',
    'version.js',
    'push-setup.js'
  ];

  function loadScript(file){
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = file.startsWith('http') ? file : BASE_URL + file;
      script.type = 'text/javascript';
      script.onload = () => resolve(file + ' loaded.');
      script.onerror = () => reject(new Error(file + ' failed to load.'));
      document.body.appendChild(script);
    });
  }

  function loadCSS(file){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = file.startsWith('http') ? file : BASE_URL + file;
    document.head.appendChild(link);
  }

  async function loadAllFiles(){
    for(const file of FILES){
      if(file.endsWith('.js')){
        try{
          await loadScript(file);
        }catch(err){
          console.error('[PageJS] Error loading file:', err);
        }
      }else if(file.endsWith('.css')){
        loadCSS(file);
      }
    }
  }

  (async ()=>{
    await loadAllFiles();
    if (window.PageJS && PageJS.Startup) {
      new PageJS.Startup();
    }
  })();
})();

