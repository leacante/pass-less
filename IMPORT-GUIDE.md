# 🔐 Pass-Less - Importación de Credenciales

Guía rápida para importar tus credenciales desde FYI.md

## 🚀 Inicio Rápido

### 1. Analizar y preparar datos

```bash
npm run import:analyze
```

Esto genera:
- `import-output/import-passwords.json` - Datos estructurados
- `import-output/import-passwords.sql` - Script SQL (backup)

### 2. Importar automáticamente (Recomendado) ✨

```bash
# Paso 1: Obtener tu token de sesión
# 1. Abre http://localhost:3000 en el navegador
# 2. Inicia sesión con tu cuenta
# 3. Abre DevTools (F12) > Application > Cookies
# 4. Copia el valor de "next-auth.session-token"

# Paso 2: Establecer token en .env.local
echo "NEXTAUTH_SESSION_TOKEN=tu-token-aqui" >> .env.local

# Paso 3: Ejecutar importación
npm run import:api
```

**Resultado esperado:**
```
🚀 Iniciando importación mediante API

📊 Datos a importar:
   - Tags: 14
   - Passwords: 200+

📝 Paso 1: Creando tags...
   Creando tag "Monitoreo"... ✅
   Creando tag "Hosting"... ✅
   ...

✅ Tags creados: 14/14

📝 Paso 2: Creando passwords...
   [1/200] "UpTime Kuma - Monitor de aplicaciones"... ✅
   ...

✅ Passwords creados: 200/200

🎉 ¡Importación completada!
```

### 3. Alternativa: Importar con curl

```bash
# Generar scripts
npm run import:curl

# Ejecutar (Linux/Mac)
./import-output/import-curl-commands.sh http://localhost:3000 "next-auth.session-token=TU_TOKEN"

# Ejecutar (Windows)
import-output\import-curl-commands.bat http://localhost:3000 "next-auth.session-token=TU_TOKEN"
```

## 📋 ¿Qué se importa?

### Tags (14 categorías)
- Monitoreo, Hosting, VPN, Base de Datos
- Securitas, Cliente, Desarrollo, Cloud
- Email, FTP, RDP, API, Git, SSH

### Passwords (200+ entradas)
Organizadas por sistema:
- **UpTime Kuma** - Monitoreo
- **Hostinger/Easypanel** - Hosting
- **Watchman** - Azure, BD Dev/Test/Prod, SMTP
- **AWS, Azure, Oracle** - Cloud
- **Securitas** (España, Chile, Perú, Uruguay, Ecuador, Colombia, Costa Rica)
- **OIA, Coprac, Bremen, Ferrovias** - Clientes
- **Bases de datos** SQL Server, MySQL, Oracle
- Y muchos más...

## ⚙️ Configuración

### Variables de entorno (.env.local)

```env
# Base de datos (MongoDB)
DATABASE_URL="mongodb://localhost:27017/pass-less"

# NextAuth
NEXTAUTH_SECRET="tu-secret-generado"
NEXTAUTH_URL="http://localhost:3000"

# Para importación
NEXTAUTH_SESSION_TOKEN="tu-token-de-sesion"
```

### Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 🔒 Seguridad

- ✅ Los passwords se encriptan automáticamente con AES-256-GCM
- ✅ Cada password tiene su propio IV y AuthTag
- ✅ La clave de encriptación se deriva de NEXTAUTH_SECRET
- ✅ Los datos nunca se almacenan en texto plano

## 🛠️ Scripts disponibles

```bash
npm run dev                # Ejecutar en desarrollo
npm run build             # Compilar para producción
npm run start             # Ejecutar en producción
npm run import:analyze    # Analizar FYI.md y generar archivos
npm run import:api        # Importar automáticamente via API
npm run import:curl       # Generar scripts curl
npm run lint              # Linter
npm run test              # Tests
```

## 📖 Documentación detallada

Ver [scripts/README-IMPORT.md](scripts/README-IMPORT.md) para:
- Guía completa de importación
- Solución de problemas
- Detalles técnicos
- Opciones avanzadas

## ❓ Solución de problemas comunes

### "Unauthorized" al importar
```bash
# Verifica que el token sea válido
# Obtén uno nuevo desde las DevTools
```

### "Failed to fetch"
```bash
# Asegúrate que la app esté corriendo
npm run dev
```

### Algunos passwords no se importan
```bash
# Revisa el reporte de errores al final
# Los caracteres especiales pueden causar problemas
```

## 🎯 Próximos pasos después de importar

1. Accede a http://localhost:3000
2. Revisa tus passwords importados
3. Organiza por workspaces si es necesario
4. Configura backup automático
5. ¡Empieza a usar tu gestor de passwords!

---

Para más información, consulta la [documentación completa](scripts/README-IMPORT.md).
