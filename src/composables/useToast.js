// src/composables/useToast.js
import { toast } from 'vue3-toastify';

export function useToast() {
    const showToast = (message = 'Message par défaut', type = 'info', options = {}) => {
        toast(message, {
            type, // success | error | warning | info | default
            theme: 'auto',
            autoClose: 3000,
            dangerouslyHTMLString: false,
            position: 'top-right',
            ...options,
        });
    };

    return { showToast };
}
