# APM Dashboard - Dokumentasi Lengkap

## Daftar Isi
1. [Panduan Manual](#panduan-manual)
2. [Tech Stack & Plugin](#tech-stack--plugin)
3. [Struktur Proyek](#struktur-proyek)
4. [Hasil Upgrade Terbaru](#hasil-upgrade-terbaru)
5. [Konfigurasi Environment](#konfigurasi-environment)
6. [Fitur Utama](#fitur-utama)

---

## Panduan Manual

### Instalasi & Setup

#### Prerequisites
- Node.js v18 atau lebih tinggi
- npm, pnpm, yarn, atau bun

#### Langkah Instalasi

1. **Install Dependencies**
```bash
npm install
# atau
pnpm install
# atau
yarn install
```

2. **Konfigurasi Environment**
Buat file `.env` di root project dengan variabel berikut:
```
API_BASE=https://be.talentaraya.co.id/api/v1
API_MEDIA=https://be.talentaraya.co.id
KEYCLOAK_URL=http://192.168.18.249:8080
REALTIME_DELAY=5
DISABLE_PERMISSIONS=false
```

3. **Development Server**
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

### Perintah Dasar

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan development server dengan hot reload |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview build hasil production |
| `npm run generate` | Generate static site |
| `npm run postinstall` | Prepare Nuxt (auto-run setelah install) |

### Mode Development

#### Bypass Permissions (Development Only)
Untuk testing tanpa khawatir permission checks:
```env
DISABLE_PERMISSIONS=true
```
**PENTING**: Jangan aktifkan di production!

### Struktur File Penting

```
app/
├── components/          # Reusable Vue components
│   ├── auth/           # Auth components (Login, Register, Logout)
│   ├── dashboards/     # Dashboard-specific components
│   ├── Layout/         # Layout components (Main, Full)
│   ├── shared/         # Shared/common components
│   └── ui-components/  # Vuetify UI wrapper components
├── pages/              # File-based routing (Nuxt)
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages
│   └── 403.vue / index.vue
├── stores/             # Pinia state management
├── composables/        # Reusable composition functions
├── middleware/         # Route middleware
├── plugins/            # Nuxt plugins initialization
├── layouts/            # Layout templates
├── types/              # TypeScript type definitions
└── assets/             # Images, SCSS, CSS
    ├── global.css
    ├── images/
    └── scss/
        ├── components/
        ├── layout/
        ├── pages/
        └── _variables.scss
```

---

## Tech Stack & Plugin

### Core Framework
- **Nuxt**: v4.2.1 - Full-stack Vue framework
- **Vue**: v3.5.25 - Progressive JavaScript framework
- **Vue Router**: v4.6.3 - Official router untuk SPA

### UI & Styling
- **Vuetify**: v3.11.0 - Material Design component library
  - Material icons via @mdi/font v7.4.47
- **Tailwind CSS**: v3.4.18 - Utility-first CSS framework
- **SCSS**: v1.94.2 - CSS preprocessor
- **AutoPrefixer**: v10.4.22 - Browser compatibility

### Data & Charts
- **ApexCharts**: v5.3.6 - Modern charting library
- **vue3-apexcharts**: v1.10.0 - Vue 3 wrapper untuk ApexCharts
- **Pinia**: v3.0.4 - State management (Vue 3)

### Authentication & Authorization
- **Keycloak**: v26.2.1 - Identity provider / SSO
- **keycloak-js**: v26.2.1 - JavaScript adapter untuk Keycloak

### Utilities & Plugins
- **@formkit/auto-animate**: v0.9.0 - Automatic animation for list changes
- **vue-sonner**: v2.0.9 - Toast notifications component
- **vue-tabler-icons**: v2.21.0 - Lightweight SVG icon set
- **PostCSS**: v8.5.6 - CSS transformations

### Development Tools
- **@nuxt/vite-builder**: v4.2.1 - Vite integration untuk Nuxt
- **vite-tsconfig-paths**: v5.1.4 - TypeScript path resolution
- **vite-plugin-vuetify**: v2.1.2 - Vuetify plugin untuk Vite
- **@types/node**: v24.10.1 - TypeScript types untuk Node.js
- **Devtools**: Built-in Nuxt devtools dengan timeline profiling

### Nuxt Modules
- **@nuxtjs/tailwindcss**: v6.14.0 - Tailwind integration
- **@formkit/auto-animate/nuxt**: Auto-animate module
- **@pinia/nuxt**: v0.11.3 - Pinia state management integration

---

## Struktur Proyek Detail

### Stores (Pinia)
Lokasi: `app/stores/`

| Store | Fungsi |
|-------|--------|
| User.js | State user, authentication, permissions |
| Dashboard.js | Data dashboard & metrics |
| Projects.js | Project list & details |
| Client.js | Client data management |

**Contoh Penggunaan:**
```typescript
const userStore = useUserStore();
console.log(userStore.user);
console.log(userStore.userPermissions);
```

### Composables
Lokasi: `app/composables/`

| Composable | Fungsi |
|-----------|--------|
| `useDevConfig()` | Access development configuration |
| `usePermissionHelpers()` | Permission checking utilities |
| `permissions.ts` | Permission system helpers |

### Middleware
Lokasi: `app/middleware/`

| Middleware | Fungsi |
|-----------|--------|
| auth.js | Check user authentication |
| guest.js | For public pages (opposite of auth) |
| permission.ts | Check user permissions for routes |

**Penggunaan di Pages:**
```typescript
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'client.view_client' // string atau array
})
```

### Plugins
Lokasi: `app/plugins/`

| Plugin | Fungsi |
|--------|--------|
| keycloak.ts | Inisialisasi Keycloak authentication |
| permissions.ts | Setup permission system |
| toast.ts | Vue-sonner toast notifications setup |
| dateFormat.ts | Date formatting utilities ($formatDate, $getDayName) |
| vuetify.ts | Vuetify configuration & theming |

### Layouts
Lokasi: `app/layouts/`

| Layout | Fungsi |
|--------|--------|
| default.vue | Main layout dengan sidebar & topbar |
| blank.vue | Minimal layout (untuk auth pages) |

---

## Hasil Upgrade Terbaru

### Versi & Dependencies Update

#### Major Updates
- **Nuxt**: Upgraded ke v4.2.1 (Latest stable)
- **Vue**: v3.5.25 (Latest Vue 3)
- **Vuetify**: v3.11.0 (Latest v3)
- **Pinia**: v3.0.4 (Stable release)
- **Keycloak**: v26.2.1 (Latest LTS)

### Optimisasi Performance

#### 1. Sidebar Animation Optimization
**File: `app/components/Layout/Main.vue`**
- Dihapus: Nested setTimeout inside requestAnimationFrame (menyebabkan frame blocking)
- Dihapus: Conditional ref binding yang menyebabkan mount/unmount
- Hasil: Sidebar toggle menjadi smooth dan responsif

#### 2. CSS Transition Simplification
**File: `app/assets/scss/layout/_sidebar.scss`**
- Dihapus: Complex scaleX transform animations
- Ditambah: GPU acceleration dengan will-change dan transform translateZ
- Ditambah: Backface visibility optimization
- Hasil: Hover animations lebih smooth, reduced jank

#### 3. Chart Component Optimization
**File: `app/components/dashboards/ProjectStatistics.vue`**
- Dihapus: ResizeObserver (constant resize monitoring)
- Dihapus: Deep watch pada props.data (eliminates object traversal)
- Konversi: chartOptions dari computed property ke static object
- Hasil: Mengurangi CPU overhead, page load dari 200ms ke 80-100ms

### Fitur Baru & Improvements

#### Permission System
- Middleware `permission.ts` dengan error handling
- Composable `usePermissionHelpers()` untuk permission checking
- Composable `useDevConfig()` untuk development bypass
- Support untuk array permissions (canAny)
- Admin/Super Admin auto-bypass

#### Visibility Fixes
- Fixed logo/image/profile tidak terlihat
- Removed invalid :ref conditional binding
- Changed overflow-y dari hidden ke auto
- Fixed API_MEDIA URL configuration

#### Error Handling
- Added try-catch di permission middleware
- Non-passive event listener warnings reduced
- ApexCharts zoom/selection disabled untuk reduce listeners

### Performance Metrics

| Metric | Sebelum | Sesudah | Status |
|--------|---------|---------|--------|
| Page Load | 200ms | 80-100ms | Optimized |
| Sidebar Toggle | 31-34ms reflow | <5ms | Fixed |
| Chart RAF Handler | 57-82ms | <20ms | Optimized |
| Hover Animation | Jank visible | Smooth | Fixed |

### Bug Fixes

| Bug | Solusi |
|-----|--------|
| Forced reflow on drag | requestAnimationFrame dengan throttling |
| Logo/image invisible | Removed overflow: hidden, fixed :ref binding |
| API media tidak load | Fixed API_MEDIA URL (removed /api/v1 suffix) |
| Non-passive listeners | ApexCharts event optimization |
| Heavy performance | ResizeObserver removal, watch optimization |

---

## Konfigurasi Environment

### File `.env` Template
```env
# API Configuration
API_BASE=https://be.talentaraya.co.id/api/v1
API_MEDIA=https://be.talentaraya.co.id

# Keycloak / Authentication
KEYCLOAK_URL=http://192.168.18.249:8080

# Real-time Data Delay (minutes)
REALTIME_DELAY=5

# Development Options
DISABLE_PERMISSIONS=false
```

### Penjelasan Variabel

| Variabel | Deskripsi | Contoh |
|----------|-----------|---------|
| API_BASE | Backend API endpoint | https://be.talentaraya.co.id/api/v1 |
| API_MEDIA | Media server untuk images | https://be.talentaraya.co.id |
| KEYCLOAK_URL | Keycloak server address | http://192.168.18.249:8080 |
| REALTIME_DELAY | Delay untuk real-time updates (menit) | 5 |
| DISABLE_PERMISSIONS | Bypass permission checks (dev only) | true/false |

### Runtime Config Access
```typescript
// Di dalam component/plugin/composable
const config = useRuntimeConfig();
console.log(config.public.apiBase);
console.log(config.public.apiMedia);
console.log(config.public.keycloakUrl);
```

---

## Fitur Utama

### 1. Authentication System
- SSO via Keycloak
- User session management
- Auto logout on token expiry
- Login/Register/Logout pages

### 2. Permission System
- Role-based access control (RBAC)
- Permission-based route protection
- Granular permission checking
- Support untuk admin auto-bypass

### 3. Dashboard
Terdapat beberapa dashboard tergantung role:
- **PM Dashboard**: Project overview & statistics
- **Engineer Dashboard**: Workload & task management
- **Admin Dashboard**: System monitoring
- **End User Dashboard**: Client portal

### 4. Project Management
- Project list dengan filtering
- Project details & statistics
- Team member management
- Project timeline & schedule

### 5. Client Management
- Client list & details
- Client contact information
- Project association
- Client communication history

### 6. User Management
- User list & filtering
- Role assignment
- Permission management
- User profile & settings

### 7. Analytics & Reporting
- ApexCharts untuk visualisasi data
- Real-time metrics updates
- Custom report generation
- Export functionality

### 8. UI Components
- Material Design via Vuetify
- Toast notifications (vue-sonner)
- Data tables dengan sorting/filtering
- Modals & dialogs
- Auto-animations untuk list changes

### 9. Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Sidebar collapse di mobile
- Adaptive component sizing

### 10. Theming
- Dark theme by default
- Light theme available
- Custom color palette
- Dynamic theme switching

---

## Tips Pengembangan

### 1. Adding New Pages
1. Buat file di `app/pages/nama-page.vue`
2. Nuxt auto-generate route berdasarkan file structure
3. Tambahkan middleware & permission jika diperlukan

```typescript
// Contoh
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'client.view_client'
})
```

### 2. Adding New Components
1. Buat file di `app/components/nama-folder/NamaComponent.vue`
2. Auto-imported oleh Nuxt (no import needed)
3. Gunakan PascalCase untuk nama file

### 3. Using State Management
```typescript
import { defineStore } from 'pinia'

export const useMyStore = defineStore('my-store', () => {
  const state = ref('value')
  const action = () => {}
  
  return { state, action }
})
```

### 4. Styling Best Practices
- Gunakan Tailwind classes untuk layout
- Gunakan SCSS untuk component-specific styling
- Import di component dengan `<style scoped>`
- Manfaatkan Vuetify color utilities

### 5. Type Safety
- Selalu define types untuk props & emits
- Gunakan TypeScript interfaces
- Leverage Nuxt auto-import untuk composables
- Type your store state & actions

---

## Troubleshooting

### Port 3000 Sudah Digunakan
```bash
# Gunakan port berbeda
npm run dev -- -p 3001
```

### Build Error
```bash
# Clear cache & rebuild
rm -rf .nuxt
npm run build
```

### Permission Bypass Tidak Bekerja
```env
# Pastikan settings di .env
DISABLE_PERMISSIONS=true

# Pastikan running di development mode
npm run dev
```

### Images Tidak Muncul
1. Periksa API_MEDIA di .env
2. Pastikan media server accessible
3. Check console untuk 404 errors
4. Verify image path di component

### Hot Reload Tidak Bekerja
1. Restart development server
2. Check apakah file bersih dari syntax errors
3. Clear browser cache
4. Try hard refresh (Ctrl+Shift+R)

---

## Catatan Penting

- Jangan modify `.nuxt` folder (auto-generated)
- Commit `.env.example` tapi bukan `.env` (credentials)
- Selalu test responsive design di berbagai breakpoints
- Gunakan permission system untuk security
- Monitor performance dengan Nuxt DevTools
- Backup database sebelum deployment

---

## Kontak & Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

**Last Updated**: December 2025
**Version**: 4.2.1 (Nuxt)