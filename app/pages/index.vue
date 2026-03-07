<template>
  <div class="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10">

    <!-- Background image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/background_cccbr.png');"
    />
    <!-- Dark overlay for depth -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-dark/80 via-primary/60 to-secondary-dark/70 backdrop-blur-[2px]" />

    <!-- Animated particles/orbs for atmosphere -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
    </div>

    <!-- Login Card -->
    <div class="card-glass relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">

      <!-- Grid: 2 cols desktop, 1 col mobile -->
      <div class="grid grid-cols-1 md:grid-cols-2 min-h-[520px]">

        <!-- LEFT: Login Form -->
        <div class="flex flex-col justify-center px-8 py-10 md:px-10">
          <!-- Header -->
          <div class="mb-8">
            <p class="text-slate-800 text-xs font-semibold uppercase tracking-widest mb-1">Bienvenido (a)</p>
            <h2 class="text-slate text-2xl font-bold tracking-tight" style="font-family: 'Syne', sans-serif;">Iniciar Sesión</h2>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="flex flex-col gap-5">

            <!-- Broker Number -->
            <div class="input-group">
              <label class="field-label">Número de Broker</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  v-model="form.broker"
                  type="text"
                  placeholder="Ej. 100234"
                  class="field-input"
                  autocomplete="username"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="input-group">
              <label class="field-label">Contraseña</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="field-input pr-10"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 mt-4 p-3 rounded-50 bg-red-500/10 border border-red-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span class="text-secondary text-sm">{{ errorMessage }}</span>
            </div>

            <!-- Forgot password -->
            <div class="flex justify-end -mt-2">
              <NuxtLink to="/forgot-password" class="text-xs text-[#28323f] hover:text-secondary-light transition-colors underline underline-offset-2">
                ¿Olvidaste tu contraseña?
              </NuxtLink>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary group"
            >
              <span v-if="!loading" class="flex items-center justify-center gap-2">
                Iniciar Sesión
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verificando...
              </span>
            </button>

            <!-- Divider -->
            <div class="flex items-center gap-3 my-1">
              <div class="flex-1 h-px bg-slate-200" />
              <span class="text-[#28323f] text-xs uppercase tracking-widest">o</span>
              <div class="flex-1 h-px bg-slate-200" />
            </div>

            <!-- Google Login -->
            <button type="button" @click="handleGoogle" class="btn-google group">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>

        <!-- Divider vertical (desktop only) -->
        <div class="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-slate-200 -translate-x-1/2" />

        <!-- RIGHT: Brand -->
        <div class="hidden md:flex flex-col items-center justify-center px-10 py-10 relative">
          <!-- Logo placeholder -->
          <div class="logo-container mb-6">
            <div class="logo-ring" />
            <img
              src="/cccbrlogo.png"
              alt="CCCBR Manager Logo"
              class="logo-img"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- Fallback logo -->
            <!-- <div class="logo-fallback">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div> -->
          </div>

          <!-- Brand name -->
          <h1 class="brand-title" style="font-family: 'Syne', sans-serif;">
            CCCBR
          </h1>
          <h2 class="brand-subtitle" style="font-family: 'Syne', sans-serif;">
            MANAGER
          </h2>

          <!-- Tagline -->
         <p class="text-slate-800 text-xs text-center mt-4 max-w-[180px] leading-relaxed tracking-wide">
            Plataforma de gestión para brokers profesionales
          </p>

          <!-- Decorative line -->
          <div class="mt-6 flex items-center gap-2">
            <div class="w-6 h-px bg-primary/90" />
            <div class="w-2 h-2 rounded-full bg-secondary" />
            <div class="w-6 h-px bg-primary/90" />
          </div>
        </div>

        <!-- Mobile brand strip -->
        <div class="md:hidden flex items-center justify-center gap-3 px-8 pb-8 pt-0">
          <div class="h-px flex-1 bg-white/10" />
          <span class="brand-title-mobile" style="font-family: 'Syne', sans-serif;">CCCBR MANAGER</span>
          <div class="h-px flex-1 bg-white/10" />
        </div>

      </div>
    </div>

    <!-- SUCCESS DIALOG -->
    <Transition name="dialog">
      <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="dialog-backdrop absolute inset-0" />
        <div class="dialog-card relative">
          <!-- Animated checkmark -->
          <div class="check-circle">
            <svg class="check-svg" viewBox="0 0 52 52">
              <circle class="check-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path class="check-tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h3 class="dialog-title" style="font-family: 'Syne', sans-serif;">¡Inicio exitoso!</h3>
          <p class="dialog-subtitle">Redirigiendo al explorador…</p>
          <!-- Progress bar -->
          <div class="progress-track">
            <div class="progress-fill" />
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: "auth"
})
const router = useRouter()

const form = ref({ broker: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  if (!form.value.broker || !form.value.password) {
    errorMessage.value = 'Por favor, completa todos los campos.'
    return
  }
  
  if (form.value.broker !== '3779' || form.value.password !== 'cccbr2026') {
    errorMessage.value = 'Número de broker o contraseña incorrectos.'
    return
  }
  
  loading.value = true
  // Simulate auth
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
  showSuccess.value = true
  // Redirect after dialog animation
  setTimeout(() => {
    router.push('/explorer')
  }, 1000)
}

function handleGoogle() {
  // Integrate Google OAuth here
  console.log('Google login')
}
</script>

<style scoped>

/* ─── Card Glass ─────────────────────────────── */
.card-glass {

  background:  rgba(255,255,255,0.6);


  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(255,255,255,0.8);

  box-shadow:
    0 30px 80px rgba(0,0,0,0.35),
    0 10px 30px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.9);

}


/* ─── Orbs ───────────────────────────────────── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
  animation: float 8s ease-in-out infinite;
}
.orb-1 {
  width: 400px; height: 400px;
  background: #202d59;
  top: -10%; left: -10%;
  animation-delay: 0s;
}
.orb-2 {
  width: 300px; height: 300px;
  background: #a31e22;
  bottom: -5%; right: -5%;
  animation-delay: -3s;
}
.orb-3 {
  width: 200px; height: 200px;
  background: #2a3a6e;
  top: 40%; left: 50%;
  animation-delay: -5s;
}
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* ─── Form Fields ────────────────────────────── */
.input-group { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #28323f;
}
.input-wrapper { position: relative; }
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
   color: #64748b;
  display: flex;
  align-items: center;
}
.field-input {

  width: 100%;
  padding: 11px 12px 11px 36px;

  background: rgba(255,255,255,0.9);

  border: 1px solid rgba(32,45,89,0.15);

  border-radius: 10px;

  color: #1e293b;

  font-size: 0.875rem;

  outline: none;

  transition: all 0.25s ease;
}

.field-input::placeholder {
  color: rgba(0,0,0,0.35);
}

.field-input:focus {

  border-color: #a31e22;

  background: #fff;

  box-shadow:
    0 0 0 3px rgba(163,30,34,0.15);

}
/* ─── Buttons ────────────────────────────────── */
.btn-primary {
  width: 100%;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.03em;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #202d59 0%, #a31e22 100%);
   box-shadow:
    0 5px 15px rgba(32,45,89,0.45),
    0 3px 10px rgba(163,30,34,0.35);

  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: linear-gradient(135deg, #a31e22 0%, #202d59 100%);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(163,30,34,0.35);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-google {

  width: 100%;
  padding: 10px 20px;

  border-radius: 10px;

  font-weight: 600;

  font-size: 0.875rem;

  color: #1e293b;

  background: #ffffff;

  border: 1px solid #e2e8f0;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  transition: all 0.25s ease;
}

.btn-google:hover {

  background: #f8fafc;

  border-color: #8a9baf;

  transform: translateY(-1px);

}


/* ─── Logo ───────────────────────────────────── */
.logo-container {
  position: relative;
  width: 100px; height: 100px;
  display: flex; align-items: center; justify-content: center;
}
.logo-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #202d59, #a31e22) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: rotate 6s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg); } }
.logo-img {
  width: 80px; height: 80px;
  object-fit: contain;
  border-radius: 50%;
  position: relative; z-index: 1;
}
.logo-fallback {
  position: absolute;
  inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
}

/* ─── Brand Typography ───────────────────────── */
.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #2a3a6e 0%, #c42b2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.brand-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  background: linear-gradient(135deg, #a31e22 0%, #363636 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 4px;
}
.brand-title-mobile {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  background: linear-gradient(90deg, #a31e22, #473e3e, #202d59);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* ─── Success Dialog ─────────────────────────── */
.dialog-backdrop {
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
}
.dialog-card {
  background: rgba(20, 28, 58, 0.92);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 40px 48px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  animation: dialogPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes dialogPop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.dialog-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-top: 16px;
  letter-spacing: 0.02em;
}
.dialog-subtitle {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
  margin-top: 6px;
  letter-spacing: 0.04em;
}

/* ─── Checkmark SVG Animation ────────────────── */
.check-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.check-svg { width: 64px; height: 64px; }
.check-circle-bg {
  stroke: rgba(255,255,255,0.1);
  stroke-width: 2;
}
.check-tick {
  stroke: #4ade80;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: drawTick 0.5s 0.3s ease forwards;
}
@keyframes drawTick {
  to { stroke-dashoffset: 0; }
}

/* ─── Progress bar ───────────────────────────── */
.progress-track {
  margin-top: 20px;
  height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #202d59, #a31e22);
  animation: progressFill 2.2s 0.4s linear forwards;
  width: 0%;
}
@keyframes progressFill {
  to { width: 100%; }
}

/* ─── Dialog Transition ──────────────────────── */
.dialog-enter-active, .dialog-leave-active { transition: opacity 0.3s; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
</style>