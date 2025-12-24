import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ✅ Setup Pusher & Echo
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
        axios: typeof axios;
    }
}

window.Pusher = Pusher;

// ✅ Initialize Echo
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap2',
    forceTLS: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    },
});

// ✅ Debug logs
console.log('🎧 Echo initialized');
console.log('🔑 Pusher Key:', import.meta.env.VITE_PUSHER_APP_KEY);
console.log('🌍 Cluster:', import.meta.env.VITE_PUSHER_APP_CLUSTER);

// ✅ Connection state logging
window.Echo.connector.pusher.connection.bind('state_change', (states: any) => {
    console.log('🔌 Pusher state:', states.previous, '→', states.current);
});

window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connected!');
});

window.Echo.connector.pusher.connection.bind('error', (err: any) => {
    console.error('❌ Pusher error:', err);
});