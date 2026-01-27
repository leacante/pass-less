# 🔑 Cómo obtener el Token de Sesión

Para importar datos mediante la API, necesitas un token de sesión válido de NextAuth.

## 📝 Método 1: Desde el Navegador (Recomendado)

### Paso 1: Iniciar sesión en la aplicación

```bash
# Asegúrate que la app esté corriendo
npm run dev
```

Abre tu navegador en: http://localhost:3000

### Paso 2: Autenticarte

Inicia sesión con tu cuenta (Google, GitHub, u otro provider configurado)

### Paso 3: Abrir DevTools

- **Chrome/Edge:** Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
- **Firefox:** Presiona `F12` o `Ctrl+Shift+I` / `Cmd+Option+I`
- **Safari:** Primero habilita "Develop menu" en Preferences, luego `Cmd+Option+I`

### Paso 4: Ir a la sección de Cookies

**Chrome/Edge:**
1. Click en la pestaña **"Application"**
2. En el panel izquierdo, expandir **"Storage"** → **"Cookies"**
3. Click en `http://localhost:3000`

**Firefox:**
1. Click en la pestaña **"Storage"**
2. Expandir **"Cookies"**
3. Click en `http://localhost:3000`

**Safari:**
1. Click en la pestaña **"Storage"**
2. Click en **"Cookies"**
3. Seleccionar `http://localhost:3000`

### Paso 5: Copiar el token

Busca la cookie llamada:
- `next-auth.session-token` (para HTTP)
- `__Secure-next-auth.session-token` (para HTTPS)

**Haz click en la cookie y copia el valor completo**

Ejemplo de valor:
```
eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..dGVzdA.test-token-value
```

### Paso 6: Guardar en .env.local

```bash
# Linux/Mac
echo 'NEXTAUTH_SESSION_TOKEN=tu-token-copiado-aqui' >> .env.local

# Windows PowerShell
Add-Content .env.local 'NEXTAUTH_SESSION_TOKEN=tu-token-copiado-aqui'

# O editar manualmente .env.local
```

Tu archivo `.env.local` debe quedar así:

```env
DATABASE_URL="mongodb://localhost:27017/pass-less"
NEXTAUTH_SECRET="tu-secret-generado"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SESSION_TOKEN="eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..dGVzdA.test-token-value"
```

## 📝 Método 2: Desde Network Tab (Alternativo)

### Paso 1-2: Igual que el Método 1

### Paso 3: Abrir DevTools → Network

1. Abrir DevTools (`F12`)
2. Ir a la pestaña **"Network"** (Red)
3. Recargar la página (`F5` o `Ctrl+R`)

### Paso 4: Buscar request

1. Filtrar por: `Fetch/XHR`
2. Buscar cualquier request a `/api/`
3. Click en el request

### Paso 5: Ver Headers

1. Click en la pestaña **"Headers"**
2. Scroll hasta **"Request Headers"**
3. Buscar el header `Cookie:`
4. Copiar el valor de `next-auth.session-token=...`

## 🔒 Seguridad del Token

### ⚠️ Importante

- ✅ El token es temporal y expira después de un tiempo
- ✅ Solo funciona para tu sesión actual
- ✅ Nunca compartas tu token
- ✅ Si el token expira, obtén uno nuevo
- ✅ El token solo funciona en el mismo dominio

### 🔄 Expiración

Los tokens de NextAuth expiran después de:
- **Por defecto:** 30 días
- **Configurable en:** `lib/auth.ts` → `session.maxAge`

Si tu importación falla con "Unauthorized", obtén un nuevo token.

## 🧪 Verificar que el token funciona

Prueba el token con curl:

```bash
# Linux/Mac
curl -H "Cookie: next-auth.session-token=TU_TOKEN" \
     http://localhost:3000/api/tags

# Windows PowerShell
curl -H "Cookie: next-auth.session-token=TU_TOKEN" http://localhost:3000/api/tags

# Debe retornar tus tags en JSON (o array vacío [])
```

Si retorna `{"error":"Unauthorized"}`, el token no es válido.

## 🚀 Ahora sí: Importar

Una vez que tengas el token en `.env.local`:

```bash
npm run import:api
```

## ❓ Preguntas Frecuentes

### ¿Puedo usar el mismo token en múltiples ejecuciones?

Sí, mientras no expire. Si la importación falla a mitad, puedes reintentar con el mismo token.

### ¿Qué pasa si cierro sesión en el navegador?

El token se invalida. Necesitas iniciar sesión nuevamente y obtener un nuevo token.

### ¿Funciona en producción?

Sí, pero debes:
1. Usar la URL de producción
2. Obtener el token desde el navegador en producción
3. Usar HTTPS (la cookie será `__Secure-next-auth.session-token`)

### ¿Puedo automatizar la obtención del token?

Para desarrollo local, puedes usar Playwright o Puppeteer para automatizar el login y extraer la cookie. Para producción, es mejor usar OAuth tokens de servicio.

## 🛠️ Troubleshooting

### No veo la cookie en DevTools

**Solución:**
1. Verifica que hayas iniciado sesión correctamente
2. Recarga la página
3. Asegúrate de buscar en el dominio correcto (`localhost:3000`)
4. En algunos navegadores, las cookies pueden estar en "Document" en lugar de "Storage"

### La cookie aparece vacía

**Solución:**
1. Cierra sesión y vuelve a iniciar
2. Limpia las cookies del sitio
3. Verifica que NextAuth esté configurado correctamente

### "Unauthorized" incluso con token válido

**Solución:**
1. Verifica que el token esté completo (pueden ser muy largos)
2. Asegúrate de no tener espacios o saltos de línea
3. Usa comillas simples o dobles según tu shell
4. Prueba con curl primero

---

¿Listo? Continúa con la [guía de importación](IMPORT-GUIDE.md) 🚀
