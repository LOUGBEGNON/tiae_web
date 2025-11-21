<script setup>
import { reactive, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// Vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

// Input state variables
const state = reactive({
  name: null,
  description: null,
  address: null,
  successMessage: null, // ← Message de succès
  errorMessage: null,   // ← Message d'erreur (optionnel, pour remplacer alert)
});

// Validation rules
const rules = computed(() => ({
  name: {
    required,
    minLength: minLength(3),
  },
  description: {
    required,
    minLength: minLength(5),
  },
  address: {
    required,
    minLength: minLength(5),
  },
}));

// Use vuelidate
const v$ = useVuelidate(rules, state);

// On form submission
async function onSubmit() {
  // Réinitialiser les messages précédents
  state.successMessage = null;
  state.errorMessage = null;

  const result = await v$.value.$validate();

  if (!result) {
    return;
  }

  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    state.errorMessage = "Vous devez être connecté pour créer une association.";
    return;
  }

  const payload = {
    name: state.name,
    description: state.description,
    address: state.address,
  };

  try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/associations/create/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

    console.log("Association créée avec succès :", response.data);
    state.successMessage = "Votre demande de création a été prise en compte. Un e-mail vous sera envoyé après validation.";
    // Optionnel : réinitialiser le formulaire
    // Object.assign(state, { name: null, description: null, address: null });
    // v$.value.$reset();
  } catch (error) {
    console.error("Erreur API :", error);

    let message = "Une erreur est survenue lors de la création.";
    if (error.response?.data) {
      const data = error.response.data;
      if (data.name) message = data.name[0];
      else if (data.description) message = data.description[0];
      else if (data.address) message = data.address[0];
      else if (data.detail) message = data.detail;
      else if (data.message) message = data.message;
      else message = "Une erreur inconnue est survenue.";
    } else if (error.request) {
      message = "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }

    state.errorMessage = message;
  }
}
</script>

<template>
  <!-- Hero -->
  <BasePageHeading
      title="Création"
      subtitle="Créez votre association."
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Association</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Création</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <div class="content">
    <!-- Billing Information -->
    <BaseBlock title="" content-full>
      <form @submit.prevent="onSubmit">
        <div class="row push">
          <div class="col-lg-4">
            <p class="fs-sm text-muted">
              Your billing information is never shown to other users and only
              used for creating your invoices.
            </p>
          </div>
          <div class="col-lg-8 col-xl-5">
            <!-- Message de succès -->
            <div v-if="state.successMessage" class="alert alert-success mb-4">
              {{ state.successMessage }}
            </div>

            <!-- Message d'erreur -->
            <div v-if="state.errorMessage" class="alert alert-danger mb-4">
              {{ state.errorMessage }}
            </div>

            <div class="mb-4">
              <label class="form-label" for="name">
                Nom <span class="text-danger">*</span>
              </label>
              <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.name.$errors.length }"
                  v-model="state.name"
                  @blur="v$.name.$touch"
                  placeholder="Enter a name.."
                  id="name"
                  name="name"
              />
              <div v-if="v$.name.$errors.length" class="invalid-feedback animated fadeIn">
                Veuillez entrer un nom d’au moins 3 caractères.
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="description">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                  id="description"
                  class="form-control"
                  :class="{ 'is-invalid': v$.description.$errors.length }"
                  rows="5"
                  v-model="state.description"
                  @blur="v$.description.$touch"
                  placeholder="Décrivez votre association..."
              ></textarea>
              <div
                  v-if="v$.description.$errors.length"
                  class="invalid-feedback animated fadeIn"
              >
                Veuillez entrer une description d’au moins 5 caractères.
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="address">
                Adresse <span class="text-danger">*</span>
              </label>
              <input
                  type="text"
                  class="form-control"
                  id="address"
                  name="address"
                  :class="{ 'is-invalid': v$.address.$errors.length }"
                  v-model="state.address"
                  @blur="v$.address.$touch"
                  placeholder="123 Rue de l'Exemple"
              />
              <div
                  v-if="v$.address.$errors.length"
                  class="invalid-feedback animated fadeIn"
              >
                Veuillez entrer une adresse valide (au moins 5 caractères).
              </div>
            </div>

            <div class="mb-4">
              <button type="submit" class="btn btn-alt-primary">Soumettre</button>
            </div>
          </div>
        </div>
      </form>
    </BaseBlock>
    <!-- END Billing Information -->
  </div>
</template>