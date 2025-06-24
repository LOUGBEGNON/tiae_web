import { defineStore } from 'pinia'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

console.log('API =', apiUrl)

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || '',
        refresh_token: localStorage.getItem('refresh_token') || '',
    }),
    actions: {
        async login(email, password) {
            try {
                const response = await axios.post(apiUrl+'/auth/login/', {
                    email,
                    password
                });
                console.log(response.data);
                console.log(response.data.access);
                this.token = response.data.access;
                this.refresh_token = response.data.refresh;
                localStorage.setItem('token', this.token);
                localStorage.setItem('refresh_token', this.refresh_token);
                await this.fetchUser();
            } catch (error) {
                // let message = "Une erreur est survenue.";
                //
                // // Vérifie si le backend a renvoyé une réponse avec un message d'erreur
                // if (error.response) {
                //     // Exemple avec Django REST Framework
                //     if (typeof error.response.data === 'string') {
                //         message = error.response.data;
                //     } else if (error.response.data.detail) {
                //         message = error.response.data.detail;
                //     } else if (error.response.data.error) {
                //         message = error.response.data.error;
                //     } else {
                //         message = "Erreur : " + JSON.stringify(error.response.data);
                //     }
                // } else if (error.message === "Network Error") {
                //     message = "Impossible de se connecter au serveur. Vérifie le backend.";
                // }
                //
                // showToast(message, "error");
                console.log(error)
                throw error;
            }
        },
        async fetchUser() {
            if (!this.token) return;

            try {
                const res = await axios.get(apiUrl+'/auth/user/', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                console.log(res.data);
                this.user = res.data;
            } catch (err) {
                console.log(err)
                this.logout();
            }
        },
        logout() {
            this.user = null;
            this.token = '';
            this.refresh_token = '';
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
        },
        refresh_token() {

        }
    }
});
