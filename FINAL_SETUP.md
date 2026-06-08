# COAR - Sistema de Autenticación Profesional con Supabase Auth

## ✅ Estado Actual

Tu sistema de autenticación está **100% funcional y listo para producción**.

### Lo que ya está implementado:

- ✅ **Login/Signup** - Con email, contraseña y Google OAuth
- ✅ **Email Verification** - Supabase lo maneja automáticamente
- ✅ **Onboarding** - Página para completar perfil (username, fecha, género)
- ✅ **Rutas Protegidas** - `/home` y `/onboarding` solo para autenticados
- ✅ **Logout** - Cierre de sesión seguro
- ✅ **Dark Theme** - Gradientes cyan-purple, totalmente responsive
- ✅ **Términos y Privacidad** - Páginas legales listas para personalizar

---

## 🚀 Pasos para Poner en Vivo (5 minutos)

### Paso 1: Configurar Supabase

1. Ve a https://supabase.com y crea una nueva tabla
2. Ve a `SQL Editor` y copia/pega todo el contenido de `/scripts/setup-database.sql`
3. Ejecuta el script (esto crea `profiles`, triggers, y RLS)

### Paso 2: Obtener Credenciales

1. En Supabase, ve a **Settings > API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 3: Configurar Variables de Entorno

Crea `.env.local` en tu proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# (Opcional - solo para development)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Paso 4: Instalar Dependencias

```bash
pnpm install
```

### Paso 5: Ejecutar Localmente

```bash
pnpm dev
```

Abre `http://localhost:3000` y serás redirigido automáticamente a `/login`

---

## 🔒 Seguridad Implementada

- **Passwords**: Hasheados por Supabase Auth (bcrypt)
- **Sessions**: JWT tokens con expiración automática
- **RLS**: Row Level Security en tabla `profiles`
- **Cookies**: `httpOnly` y `secure` en producción
- **OAuth**: Google OAuth integrado y seguro
- **Email Verification**: Obligatoria antes de usar la plataforma

---

## 📱 Flujo de Usuario

```
1. Usuario accede a / → Redirige a /login
2. Usuario hace clic en "Crear cuenta" → Va a /signup
3. Llena email + contraseña + acepta términos → Se crea en Supabase Auth
4. Recibe email de verificación → Hace clic en link
5. Redirige a /auth/callback → Valida token → Va a /onboarding
6. Completa perfil (username, fecha, género) → Redirige a /home
7. Usuario autenticado ve /home con botón de logout
```

---

## 📝 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `/lib/supabase/client.ts` | Cliente para el navegador |
| `/lib/supabase/server.ts` | Cliente para el servidor |
| `/lib/auth.ts` | Server actions de auth |
| `/app/(auth)/login/page.tsx` | Página de login |
| `/app/(auth)/signup/page.tsx` | Página de signup |
| `/app/onboarding/page.tsx` | Página de completar perfil |
| `/app/home/page.tsx` | Página protegida de bienvenida |
| `/middleware.ts` | Protección de rutas |
| `/app/auth/callback/route.ts` | **CRÍTICO**: Maneja OAuth y email links |

---

## 🎨 Personalización

### Cambiar Colores (Dark Theme)

En `/app/globals.css`, sección `.dark`:

```css
--primary: oklch(0.6 0.2 276);      /* Purple */
--secondary: oklch(0.55 0.17 200);  /* Cyan */
```

### Cambiar Textos

En las páginas de login/signup, edita los textos en los componentes JSX.

### Agregar Logo Personalizado

En `/app/(auth)/login/page.tsx`, reemplaza el ícono de COAR por tu logo.

---

## 🐛 Troubleshooting

**Error: "Email is not confirmed"**
→ El usuario debe verificar su email. Supabase envía automáticamente el link.

**Error: "Profile already exists"**
→ Esperado si el usuario creó cuenta dos veces. El trigger lo maneja.

**OAuth no funciona**
→ Verifica que `NEXT_PUBLIC_APP_URL` sea la URL correcta de tu app.

**Página en blanco después de login**
→ El middleware está protegiendo `/home`. Verifica que Supabase sesión esté activa.

---

## 📦 Deploy a Vercel

1. Conecta tu repositorio a Vercel
2. En **Settings > Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL=https://tu-dominio.com`
3. Deploy 🚀

---

## ✨ Próximas Mejoras (Opcionales)

- [ ] Agregar foto de perfil
- [ ] Editar perfil
- [ ] Recuperar contraseña
- [ ] 2FA (autenticación de dos factores)
- [ ] Redes sociales adicionales (GitHub, Twitter, etc.)

---

## 📞 Soporte

Todos los archivos están documentados. Lee:
- `README.md` - Overview general
- `REFACTORING.md` - Cómo fue refactorizado
- `AUTH_REFACTORING_SUMMARY.md` - Resumen técnico

¡Tu sistema está listo para los directores de tu universidad! 🎓
