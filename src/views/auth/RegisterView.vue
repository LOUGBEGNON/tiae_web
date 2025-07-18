<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";

// Vuelidate, for more info and examples you can check out https://github.com/vuelidate/vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength, email, sameAs } from "@vuelidate/validators";

// Main store and Router
const store = useTemplateStore();
const router = useRouter();

// Input state variables
const state = reactive({
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
  terms: null,
});

// Validation rules
const rules = computed(() => {
  return {
    username: {
      required,
      minLength: minLength(3),
    },
    email: {
      required,
      email,
    },
    password: {
      required,
      minLength: minLength(5),
    },
    confirmPassword: {
      required,
      sameAs: sameAs(state.password),
    },
    terms: {
      sameAs: sameAs(true),
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, state);

// On form submission
async function onSubmit() {
  const result = await v$.value.$validate();

  if (!result) {
    // notify user form is invalid
    return;
  }

  // Go to dashboard
  router.push({ name: "backend-pages-auth" });
}
</script>

<template>
  <!-- Page Content -->
  <div class="bg-primary-dark">
    <div class="row g-0 bg-primary-dark-op">
      <!-- Meta Info Section -->
      <div
          class="hero-static col-lg-4 d-none d-lg-flex flex-column justify-content-center"
      >
        <div class="p-4 p-xl-5 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <RouterLink
                :to="{ name: 'landing' }"
                class="link-fx fw-semibold fs-2 text-white"
            >
              Tiae<span class="fw-normal"></span>
            </RouterLink>
            <p class="text-white-75 me-xl-8 mt-2">
              Creating a new accoughgkhfghnfgnt is completely free. Get started with 5
              projects to manage and feel free to upgrade as your business grow.
            </p>
          </div>
        </div>
        <div
            class="p-4 p-xl-5 d-xl-flex justify-content-between align-items-center fs-sm"
        >
          <p class="fw-medium text-white-50 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline mb-0 py-2">
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Legal</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Contact</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Terms</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!-- END Meta Info Section -->

      <!-- Main Section -->
      <div
          class="hero-static col-lg-8 d-flex flex-column align-items-center bg-body-extra-light"
      >
        <div class="p-3 w-100 d-lg-none text-center">
          <RouterLink
              :to="{ name: 'landing' }"
              class="link-fx fw-semibold fs-3 text-dark"
          >
            Tiae<span class="fw-normal"></span>
          </RouterLink>
        </div>
        <div class="p-4 w-100 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <!-- Header -->
            <div class="text-center mb-5">
              <p class="mb-3">
                <i class="fa fa-2x fa-circle-notch text-primary-light"></i>
              </p>
              <h1 class="fw-bold mb-2">Create Account</h1>
              <p class="fw-medium text-muted">
                Get your access today in one easy step
              </p>
            </div>
            <!-- END Header -->

            <!-- Sign Up Form -->
            <div class="row g-0 justify-content-center">
              <div class="col-sm-8 col-xl-4">
                <form @submit.prevent="onSubmit">
                  <div class="mb-4">
                    <input
                        type="text"
                        class="form-control form-control-lg form-control-alt py-3"
                        id="signup-username"
                        name="signup-username"
                        placeholder="Username"
                        :class="{
                        'is-invalid': v$.username.$errors.length,
                      }"
                        v-model="state.username"
                        @blur="v$.username.$touch"
                    />
                    <div
                        v-if="v$.username.$errors.length"
                        class="invalid-feedback animated fadeIn"
                    >
                      Please enter a username
                    </div>
                  </div>
                  <div class="mb-4">
                    <input
                        type="email"
                        class="form-control form-control-lg form-control-alt py-3"
                        id="signup-email"
                        name="signup-email"
                        placeholder="Email"
                        :class="{
                        'is-invalid': v$.email.$errors.length,
                      }"
                        v-model="state.email"
                        @blur="v$.email.$touch"
                    />
                    <div
                        v-if="v$.email.$errors.length"
                        class="invalid-feedback animated fadeIn"
                    >
                      Please enter a valid email address
                    </div>
                  </div>
                  <div class="mb-4">
                    <input
                        type="password"
                        class="form-control form-control-lg form-control-alt py-3"
                        id="signup-password"
                        name="signup-password"
                        placeholder="Password"
                        :class="{
                        'is-invalid': v$.password.$errors.length,
                      }"
                        v-model="state.password"
                        @blur="v$.password.$touch"
                    />
                    <div
                        v-if="v$.password.$errors.length"
                        class="invalid-feedback animated fadeIn"
                    >
                      Please provide a password
                    </div>
                  </div>
                  <div class="mb-4">
                    <input
                        type="password"
                        class="form-control form-control-lg form-control-alt py-3"
                        id="signup-password-confirm"
                        name="signup-password-confirm"
                        placeholder="Confirm Password"
                        :class="{
                        'is-invalid': v$.confirmPassword.$errors.length,
                      }"
                        v-model="state.confirmPassword"
                        @blur="v$.confirmPassword.$touch"
                    />
                    <div
                        v-if="v$.confirmPassword.$errors.length"
                        class="invalid-feedback animated fadeIn"
                    >
                      Please confirm the password
                    </div>
                  </div>
                  <div class="mb-4">
                    <div
                        class="d-md-flex align-items-md-center justify-content-md-between"
                    >
                      <div class="form-check">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="signup-terms"
                            name="signup-terms"
                            :class="{
                            'is-invalid': v$.terms.$errors.length,
                          }"
                            v-model="state.terms"
                            @blur="v$.terms.$touch"
                        />
                        <label class="form-check-label" for="signup-terms"
                        >I agree to Terms &amp; Conditions</label
                        >
                        <div
                            v-if="v$.terms.$errors.length"
                            class="invalid-feedback animated fadeIn"
                        >
                          You must agree to the service terms!
                        </div>
                      </div>
                      <div class="py-2">
                        <a
                            class="fs-sm fw-medium"
                            href="javascript:void(0)"
                            data-bs-toggle="modal"
                            data-bs-target="#one-signup-terms"
                        >View Terms</a
                        >
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <button type="submit" class="btn btn-lg btn-alt-success">
                      <i class="fa fa-fw fa-plus me-1 opacity-50"></i> Sign Up
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <!-- END Sign Up Form -->
          </div>
        </div>
        <div
            class="px-4 py-3 w-100 d-lg-none d-flex flex-column flex-sm-row justify-content-between fs-sm text-center text-sm-start"
        >
          <p class="fw-medium text-black-50 py-2 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline py-2 mb-0">
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Legal</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Contact</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Terms</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!-- END Main Section -->
    </div>

    <!-- Terms Modal -->
    <div
        class="modal fade"
        id="one-signup-terms"
        tabindex="-1"
        role="dialog"
        aria-labelledby="one-signup-terms"
        aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-popout" role="document">
        <div class="modal-content">
          <BaseBlock title="Terms &amp; Conditions" transparent class="mb-0">
            <template #options>
              <button
                  type="button"
                  class="btn-block-option"
                  data-bs-dismiss="modal"
                  aria-label="Close"
              >
                <i class="fa fa-fw fa-times"></i>
              </button>
            </template>

            <template #content>
              <div class="block-content">
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
              </div>
              <div class="block-content block-content-full text-end bg-body">
                <button
                    type="button"
                    class="btn btn-sm btn-alt-secondary me-1"
                    data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    data-bs-dismiss="modal"
                >
                  I Agree
                </button>
              </div>
            </template>
          </BaseBlock>
        </div>
      </div>
    </div>
    <!-- END Terms Modal -->
  </div>
  <!-- END Page Content -->
</template>
