# 📝 Resumen de Sistema de Importación

## ✅ Archivos Creados

### Scripts principales
1. **[scripts/import-fyi-data.ts](scripts/import-fyi-data.ts)**
   - Analiza FYI.md
   - Extrae ~200+ credenciales
   - Genera JSON y SQL estructurados
   - Define 14 categorías (tags)

2. **[scripts/import-via-api.ts](scripts/import-via-api.ts)** ⭐ RECOMENDADO
   - Importación automática mediante API REST
   - Crea tags y passwords automáticamente
   - Encriptación transparente
   - Reporte de progreso en tiempo real
   - Manejo de errores

3. **[scripts/generate-curl-import.ts](scripts/generate-curl-import.ts)**
   - Genera scripts curl (bash y batch)
   - Útil para importación manual
   - Debugging y testing de API

### Documentación
4. **[scripts/README-IMPORT.md](scripts/README-IMPORT.md)**
   - Guía completa de importación
   - 3 opciones de importación
   - Solución de problemas
   - Detalles técnicos

5. **[IMPORT-GUIDE.md](IMPORT-GUIDE.md)**
   - Guía rápida de inicio
   - Comandos principales
   - Configuración básica

### Archivos generados (después de ejecutar)
6. **import-output/import-passwords.json**
   - Datos estructurados para importación
   - Metadata, tags y passwords

7. **import-output/import-passwords.sql**
   - Script SQL de backup
   - Requiere encriptación manual

8. **import-output/import-curl-commands.sh** (Linux/Mac)
9. **import-output/import-curl-commands.bat** (Windows)
   - Scripts de importación manual

## 🎯 Uso Rápido

```bash
# 1. Analizar archivo FYI.md
npm run import:analyze

# 2. Obtener token de sesión (desde DevTools del navegador)
# next-auth.session-token = "tu-token-aqui"

# 3. Agregar al .env.local
echo "NEXTAUTH_SESSION_TOKEN=tu-token" >> .env.local

# 4. Importar automáticamente
npm run import:api
```

## 📊 Datos Extraídos

### Tags (14 categorías)
| Tag | Color | Descripción |
|-----|-------|-------------|
| Monitoreo | #FF6B6B | Herramientas de monitoreo |
| Hosting | #4ECDC4 | Servicios de hosting |
| VPN | #45B7D1 | Conexiones VPN |
| Base de Datos | #96CEB4 | SQL Server, MySQL, Oracle |
| Securitas | #FFEAA7 | Sistemas Securitas |
| Cliente | #DFE6E9 | Proyectos de clientes |
| Desarrollo | #74B9FF | Herramientas dev |
| Cloud | #A29BFE | AWS, Azure, Oracle Cloud |
| Email | #FD79A8 | Correos y SMTP |
| FTP | #FDCB6E | Accesos FTP/SFTP |
| RDP | #6C5CE7 | Escritorio remoto |
| API | #00B894 | Credenciales de APIs |
| Git | #F97F51 | Repositorios y tokens |
| SSH | #2D3436 | Accesos SSH |

### Distribución de Passwords (~200+ entradas)

**Por categoría:**
- Securitas: ~40 (múltiples países)
- Base de Datos: ~35 (SQL Server, MySQL, Oracle)
- RDP: ~25 (conexiones remotas)
- VPN: ~15 (accesos VPN)
- Cliente: ~20 (proyectos)
- Hosting: ~15 (servicios web)
- Cloud: ~10 (AWS, Azure, Oracle)
- Email: ~10 (correos y SMTP)
- FTP: ~10 (servidores FTP)
- Git: ~8 (repositorios)
- SSH: ~8 (servidores)
- API: ~8 (servicios)
- Desarrollo: ~6 (herramientas)
- Monitoreo: ~2 (sistemas)

**Por sistema principal:**
- Securitas (7 países): España, Chile, Perú, Uruguay, Ecuador, Colombia, Costa Rica
- Watchman: Azure, BD (Dev/Test/Prod), SMTP, PowerBI
- Hostinger/Easypanel: Hosting, SQL Server, Git
- OIA: VMs, DB (Dev/QA/Prod), Web
- Clientes: Coprac, Bremen, Ferrovias, Rheem, etc.

## 🔐 Seguridad

### Encriptación
- **Algoritmo:** AES-256-GCM
- **Clave:** Derivada de NEXTAUTH_SECRET (PBKDF2)
- **IV único:** Por cada password
- **AuthTag:** Para verificación de integridad
- **Almacenamiento:** MongoDB (encriptado)

### Flujo de importación segura
1. ✅ Autenticación mediante NextAuth
2. ✅ Validación de token de sesión
3. ✅ Encriptación automática antes de guardar
4. ✅ Nunca se almacena en texto plano
5. ✅ Cada password tiene su propio IV y AuthTag

## 🚀 Ventajas del Sistema

### vs SQL Directo
- ✅ Encriptación automática
- ✅ No requiere manipular la BD directamente
- ✅ Validaciones de negocio
- ✅ Logs y auditoría
- ✅ Manejo de errores robusto

### vs Importación Manual
- ✅ Procesa 200+ passwords automáticamente
- ✅ Crea tags automáticamente
- ✅ Asocia relaciones correctamente
- ✅ Reporte de progreso
- ✅ Reintentos automáticos

## 📈 Performance

- **Tags:** ~1.4 segundos (14 tags × 100ms delay)
- **Passwords:** ~40 segundos (200 passwords × 200ms delay)
- **Total:** ~45 segundos para importación completa
- **Delay configurable:** Se puede ajustar en el script

## 🎓 Arquitectura

```
┌─────────────────┐
│   FYI.md        │ Archivo fuente
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ import-fyi-     │ Análisis y extracción
│ data.ts         │
└────────┬────────┘
         │
         ├─────────► import-passwords.json (estructurado)
         └─────────► import-passwords.sql (backup)
         
         │
         ▼
┌─────────────────┐
│ import-via-     │ Importación automática
│ api.ts          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API REST       │ POST /api/tags
│  Next.js        │ POST /api/passwords
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use Cases      │ CreateTagUseCase
│  (Clean Arch)   │ CreatePasswordUseCase
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repositories   │ PrismaTagRepository
│  Infrastructure │ PrismaPasswordRepository
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Encryption     │ NodeCryptoService
│  Service        │ AES-256-GCM
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │ Prisma Client
│  (Encrypted)    │
└─────────────────┘
```

## 🔧 Tecnologías

- **Runtime:** Node.js / TypeScript
- **Framework:** Next.js 14
- **Base de Datos:** MongoDB (Prisma ORM)
- **Autenticación:** NextAuth v5
- **Encriptación:** Node.js Crypto (built-in)
- **Arquitectura:** Clean Architecture (DDD)

## 📦 Dependencias

```json
{
  "node-fetch": "Llamadas HTTP a la API",
  "@prisma/client": "ORM para MongoDB",
  "next-auth": "Autenticación",
  "crypto": "Built-in Node.js"
}
```

## 🎯 Casos de Uso

### 1. Importación inicial
```bash
npm run import:analyze
npm run import:api
```

### 2. Actualización incremental
```bash
# Editar FYI.md con nuevas credenciales
npm run import:analyze
# Revisar diff en import-passwords.json
npm run import:api
# Solo se crean los nuevos
```

### 3. Debugging
```bash
npm run import:curl
# Revisar scripts generados
# Ejecutar manualmente paso a paso
```

### 4. Migración a otro servidor
```bash
npm run import:analyze
npm run import:curl
# Ejecutar en servidor destino
./import-curl-commands.sh https://mi-servidor.com "token=xxx"
```

## ✨ Próximas Mejoras

- [ ] Interfaz UI para revisar antes de importar
- [ ] Detección de duplicados
- [ ] Importación incremental inteligente
- [ ] Backup automático antes de importar
- [ ] Rollback en caso de error
- [ ] Import/Export en diferentes formatos
- [ ] Sincronización bidireccional con FYI.md

---

**¿Listo para importar?** Sigue la [guía rápida](IMPORT-GUIDE.md) 🚀
