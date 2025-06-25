window.PageJS = window.PageJS || {};

if(!PageJS.Startup){
  PageJS.Startup = class{
    constructor(){
      (async () => {
        if(PageJS.Config && typeof PageJS.Config.initialize === 'function'){
          await PageJS.Config.initialize();
        }
        if(PageJS.Config && PageJS.Config.settings && PageJS.Config.settings.logo){
          PageJS.Utils.applyLogoFromSettings();
        }
        PageJS.Utils.waitForFunction("OnStartup", (fn) => {
          fn();
        });
      })();
    }
  }
}


