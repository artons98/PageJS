window.PageJS = window.PageJS || {};

if(!PageJS.PushSetup){
    PageJS.PushSetup = class{
        constructor(url = null){
            this.vapidPublicKey = 'BJ_s73UJuOwb23NtDqmc5HoLhks1GAYL2h3_VGSFfoTiwZPsJTc_D4sqhIsMCbGloVG7BYGDkEakfwdaFpMebKs';
            this.subscribeForPushNotifications(url);
        }
        async urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            return Uint8Array.from(atob(base64).split('').map(c => c.charCodeAt(0)));
        }
        async subscribeForPushNotifications(url = null) {
            if (!('serviceWorker' in navigator)) return;
        
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
        
            const key = await this.urlBase64ToUint8Array(vapidPublicKey);
        
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: key
            });
        
            await fetch(url || '/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });
        }
    } 
}
