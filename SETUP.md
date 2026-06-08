# Guía de Configuración - COAR

Instrucciones paso a paso para configurar el sistema de autenticación COAR.

## 1. Configuración de Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se inicialice

### 1.2 Obtener credenciales

1. En el dashboard de Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: la clave pública
3. Guarda estas credenciales

### 1.3 Crear las tablas (HECHO)

Las tablas ya están creadas en tu base de datos:
- `users` - Almacena usuarios
- `email_verifications` - Códigos de verificación
- `user_profiles` - Perfiles adicionales

Puedes verificar en Supabase > Tables en el panel.

## 2. Configuración de Resend

### 2.1 Crear cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta gratuita
3. Verifica tu email

### 2.2 Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Copia tu API Key
3. Guarda esta clave de forma segura

### 2.3 Configurar dominio de email

En desarrollo puedes usar `noreply@coar.social` (cambiar en `lib/auth-actions.ts`).

Para producción:
1. Ve a **Domains** en Resend
2. Añade tu dominio
3. Configura los registros DNS

## 3. Configuración del Proyecto

### 3.1 Clonar y instalar

```bash
# Clonar el proyecto
git clone <tu-repo>
cd coar

# Instalar dependencias
pnpm install
```

### 3.2 Crear archivo .env.local

```bash
cp .env.example .env.local
```

### 3.3 Completar variables de entorno

Edita `.env.local` con tus credenciales:

```env
# Supabase - Obtenidas en paso 1.2
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Resend - Obtenida en paso 2.2
RESEND_API_KEY=tu-api-key-de-resend-aqui

# JWT Secret - Generar uno seguro:
# macOS/Linux: openssl rand -base64 32
# Windows: Usar una contraseña compleja de 32+ caracteres
JWT_SECRET=tu-secreto-jwt-aqui-cambia-esto-en-produccion

# Ambiente
NODE_ENV=development
```

### 3.4 Verificar configuración

```bash
# Ver que las variables están cargadas
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 4. Ejecutar Localmente

### 4.1 Iniciar el servidor de desarrollo

```bash
pnpm dev
```

El servidor iniciará en `http://localhost:3000`

### 4.2 Probar el flujo de registro

1. Abre http://localhost:3000
2. Haz click en "Crear cuenta"
3. Ingresa:
   - Email: test@example.com
   - Contraseña: Test123456
   - Confirmar: Test123456
4. Acepta términos y haz click "Crear cuenta"
5. Verás la página de verificación
6. En desarrollo, el código se mostrará en los logs del servidor
7. Ingresa el código y haz click "Verificar código"
8. Completa el perfil (fecha nacimiento y género)
9. Serás redirigido a /home

### 4.3 Probar el flujo de login

1. Haz click en "Cerrar sesión" (aparecerá en /home)
2. Irás a /login
3. Ingresa las credenciales que creaste
4. Deberías entrar a /home

## 5. Deployment en Vercel

### 5.1 Conectar con GitHub

1. Push tu código a GitHub:
```bash
git add .
git commit -m "Initial commit - COAR authentication"
git push origin main
```

### 5.2 Crear proyecto en Vercel

1. Ve a https://vercel.com
2. Haz click en "New Project"
3. Importa tu repositorio desde GitHub
4. Selecciona el proyecto

### 5.3 Configurar variables de entorno

En la sección de "Environment Variables":

1. Añade todas las variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `JWT_SECRET`

2. Haz click en "Deploy"

### 5.4 Dominio personalizado (opcional)

1. En proyecto de Vercel, ve a **Settings > Domains**
2. Añade tu dominio personalizado
3. Configura los DNS registros

## 6. Configuración Post-Deployment

### 6.1 Actualizar URL en navegadores

Actualiza los links en las páginas si cambió el dominio.

### 6.2 Verificar emails en Supabase

1. Ve a Supabase > SQL Editor
2. Ejecuta:
```sql
SELECT * FROM users;
```

Deberías ver los usuarios creados.

### 6.3 Monitorear logs

En Vercel:
1. Ve a **Deployments**
2. Haz click en el deploy actual
3. Ve a **Logs** para ver errores en tiempo real

## 7. Próximas Mejoras

Después de tener todo funcionando, considera:

### Implementar OAuth Google

1. Ve a Google Cloud Console: https://console.cloud.google.com
2. Crea un nuevo proyecto
3. Activa OAuth 2.0
4. Crea credenciales (Client ID + Secret)
5. Configura en Supabase > Authentication > Providers > Google
6. Implementa el botón en `app/(auth)/login/page.tsx`

### Añadir Rate Limiting

Usa Upstash Redis para limitar intentos de login:
```bash
pnpm add @upstash/redis
```

### Implementar 2FA

Considera agregar autenticación de dos factores con:
```bash
pnpm add speakeasy qrcode.react
```

### Logs y Monitoreo

Integra con Sentry:
```bash
pnpm add @sentry/nextjs
```

## 8. Troubleshooting

### Error: "Cannot find module 'resend'"
```bash
pnpm install
pnpm dev
```

### Error de CORS con Supabase
- Verifica que las URLs son correctas
- Asegúrate de que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es válida
- Revisa los CORS settings en Supabase

### Emails no llegan
- En desarrollo: revisa los logs del servidor (`pnpm dev`)
- En producción: verifica que `RESEND_API_KEY` es correcto
- Comprueba el spam/junk folder

### Código de verificación incorrecto
- Los códigos expiran en 10 minutos
- En desarrollo, generan nuevos cada vez

### Cookie de sesión no persiste
- Verifica que `httpOnly: true` en `lib/session.ts`
- En desarrollo, puede ser normal (usar modo incógnito)
- En producción, asegúrate que HTTPS está habilitado

## 9. Seguridad en Producción

ANTES de llevar a producción:

- [ ] Cambiar `JWT_SECRET` a un valor único y seguro
- [ ] Cambiar `RESEND_API_KEY` a la producción
- [ ] Habilitar HTTPS (Vercel lo hace automáticamente)
- [ ] Configurar CORS en Supabase correctamente
- [ ] Revisar RLS policies en Supabase
- [ ] Implementar rate limiting
- [ ] Configurar dominio personalizado
- [ ] Obtener certificado SSL (Vercel lo hace)
- [ ] Revisar logs regularmente
- [ ] Hacer backup de la base de datos

## 10. Contacto y Soporte

Para problemas o preguntas:
1. Revisa el README.md
2. Abre un issue en el repositorio
3. Consulta la documentación de Supabase: https://supabase.com/docs
4. Consulta la documentación de Resend: https://resend.com/docs

---

**COAR © 2024** - Configurado para éxito
