window.PageJS = window.PageJS || {};

if(!PageJS.Startup){
  PageJS.Startup = class{
    constructor(){
      PageJS.Utils.waitForFunction("OnStartup", (fn) => {
        fn();
      });
    }
  }
}


