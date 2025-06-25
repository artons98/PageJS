window.PageJS = window.PageJS || {};

if(!PageJS.Config){
    PageJS.Config = class{
        static settings = {
            prodBaseUrl: '',
            devBaseUrl: '',
            handleRouting: true,
            basePath: ''
        };

        static async initialize(){
            const origin = window.location.origin;
            const pathSegments = window.location.pathname.split('/').filter(s => s && !s.includes('.'));
            for(let i = pathSegments.length; i >= 0; i--){
                const subPath = '/' + pathSegments.slice(0, i).join('/') + (i > 0 ? '/' : '');
                const url = origin + subPath + 'pagejs-config.json';
                try{
                    const response = await fetch(url);
                    if(response.ok){
                        this.settings = await response.json();
                        PageJS.basePath = this.settings.basePath || '';
                        const hostname = window.location.hostname;
                        const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
                        if(isDev && this.settings.devBaseUrl){
                            window.PageJS_BASE_URL = this.settings.devBaseUrl;
                        }else if(!isDev && this.settings.prodBaseUrl){
                            window.PageJS_BASE_URL = this.settings.prodBaseUrl;
                        }
                        return;
                    }
                }catch(err){
                    // ignore and try parent path
                }
            }
            console.error('[PageJS.Config] pagejs-config.json niet gevonden.');
        }
    }
}
