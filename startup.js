window.PageJS = window.PageJS || {};

if(!PageJS.Startup){
  PageJS.Startup = class{
    constructor(){
      (async () => {
        if(PageJS.Config && typeof PageJS.Config.initialize === 'function'){
          await PageJS.Config.initialize();
        }
        PageJS.Utils.waitForFunction("OnStartup", (fn) => {
          fn();
        });
      })();
    }
  }
}


