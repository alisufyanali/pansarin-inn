import axios from 'axios';

// Setup Axios
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

declare global {
    interface Window {
        axios: typeof axios;
    }
}

console.log(' Axios initialized');

// ℹ Pusher/Echo removed - enable in .env if needed for real-time features