# 📰 News Explorer Backend

RESTful API para News Explorer - Aplicación de exploración y guardado de artículos de noticias con autenticación segura.

## 🚀 Características Principales

- ✅ **Autenticación JWT**: Login y registro seguros
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar artículos
- ✅ **Control de Acceso**: Cada usuario solo ve sus artículos
- ✅ **Validaciones Robustas**: Email, URL, contraseña y campos requeridos
- ✅ **Seguridad**: Bcryptjs, Rate limiting, CORS, Helmet
- ✅ **Logging**: Winston para requests y errores
- ✅ **Tests Automatizados**: 65 tests de seguridad y funcionalidad
- ✅ **MongoDB**: Base de datos NoSQL con Mongoose

## 📋 Requisitos Previos

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.4 (local o cloud)
- **npm** >= 8.0.0

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Robensonl/news-explorer-backend.git
cd news-explorer-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Desarrollo
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/news-explorer-db
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Producción (en servidor)
NODE_ENV=production
MONGODB_URI=<uri-produccion>
JWT_SECRET=<secret-fuerte>
```

### 4. Iniciar el servidor

**Desarrollo** (con hot reload):
```bash
npm run dev
```

**Producción** (sin hot reload):
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 API Endpoints

### 🔐 Autenticación (Sin JWT requerido)

#### Registro
```http
POST /signup
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123",
  "name": "Juan Pérez"
}

Response: 201 Created
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez"
}
```

**Validaciones**:
- Email válido y único
- Contraseña mínimo 12 caracteres
- Nombre 2-30 caracteres (opcional)

#### Login
```http
POST /signin
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}

Response: 200 OK
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token**:
- Válido por 7 días
- Se envía en header: `Authorization: Bearer <token>`

---

### 👤 Usuarios (JWT requerido)

#### Obtener usuario actual
```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "createdAt": "2024-01-31T10:30:00.000Z",
  "updatedAt": "2024-01-31T10:30:00.000Z"
}
```

---

### 📰 Artículos (JWT requerido)

#### Obtener todos los artículos del usuario
```http
GET /articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "keyword": "inteligencia artificial",
    "title": "IA revoluciona el sector tecnológico",
    "text": "Los últimos avances en inteligencia artificial...",
    "date": "2024-01-31",
    "source": "TechNews",
    "link": "https://technews.com/articulo",
    "image": "https://technews.com/imagen.jpg",
    "owner": "64f1a2b3c4d5e6f7g8h9i0j1",
    "createdAt": "2024-01-31T10:30:00.000Z"
  }
]
```

#### Crear nuevo artículo
```http
POST /articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "keyword": "inteligencia artificial",
  "title": "IA revoluciona el sector tecnológico",
  "text": "Los últimos avances en inteligencia artificial transforman el mundo...",
  "date": "2024-01-31",
  "source": "TechNews",
  "link": "https://technews.com/articulo",
  "image": "https://technews.com/imagen.jpg"
}

Response: 201 Created
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "keyword": "inteligencia artificial",
  "title": "IA revoluciona el sector tecnológico",
  "text": "Los últimos avances en inteligencia artificial...",
  "date": "2024-01-31",
  "source": "TechNews",
  "link": "https://technews.com/articulo",
  "image": "https://technews.com/imagen.jpg",
  "owner": "64f1a2b3c4d5e6f7g8h9i0j1",
  "createdAt": "2024-01-31T10:30:00.000Z"
}
```

**Validaciones**:
- keyword: string, requerido, máximo 50 caracteres
- title: string, requerido, máximo 200 caracteres
- text: string, requerido, máximo 5000 caracteres
- date: string, requerido
- source: string, requerido, máximo 100 caracteres
- link: URL válida (http/https)
- image: URL válida (http/https)

#### Eliminar artículo
```http
DELETE /articles/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
{
  "message": "Artículo eliminado correctamente"
}
```

**Solo el propietario del artículo puede eliminarlo.**

---

## 🔒 Seguridad

- ✅ **JWT**: Autenticación basada en tokens (7 días de expiración)
- ✅ **Bcryptjs**: Contraseñas encriptadas con 12 rounds
- ✅ **Helmet**: Headers HTTP seguros
- ✅ **CORS**: Restringido a orígenes específicos
- ✅ **Rate Limiting**: 50 intentos de auth por 15 minutos
- ✅ **Validación**: Todos los inputs validados (email, URL, etc)
- ✅ **Control de Acceso**: Cada usuario solo puede acceder/modificar sus datos

## 🧪 Testing

Ejecutar todos los tests:
```bash
npm test
```

Ejecutar tests en modo watch:
```bash
npm run test:watch
```

Ver cobertura de tests:
```bash
npm run test:coverage
```

### Tests Incluidos
- **users.test.js**: 15 tests de autenticación y usuarios
- **database.test.js**: 50 tests de base de datos y artículos

Total: **65 tests automatizados** ✅

## 📝 Linting

Verificar errores de linting:
```bash
npm run lint
```

Arreglar automáticamente:
```bash
npm run lint:fix
```

**Configuración**: ESLint con airbnb-base

## 📊 Estructura del Proyecto

```
news-explorer-backend/
├── app.js                      # Aplicación principal
├── .env.example               # Variables de entorno (ejemplo)
├── .gitignore                 # Archivos ignorados en git
├── .eslintrc                  # Configuración ESLint
├── .editorconfig              # Configuración del editor
├── package.json               # Dependencias y scripts
├── jest.config.js             # Configuración de Jest
│
├── models/
│   ├── user.js                # Esquema de usuario
│   └── article.js             # Esquema de artículo
│
├── controllers/
│   ├── users.js               # Lógica de usuarios
│   └── articles.js            # Lógica de artículos
│
├── routes/
│   ├── users.js               # Rutas de usuarios
│   └── articles.js            # Rutas de artículos
│
├── middlewares/
│   ├── auth.js                # Verificación JWT
│   ├── validation.js          # Validación con Joi/Celebrate
│   ├── logger.js              # Logging con Winston
│   └── errorHandler.js        # Manejo centralizado de errores
│
├── errors/
│   ├── BadRequestError.js     # Error 400
│   ├── UnauthorizedError.js   # Error 401
│   ├── ForbiddenError.js      # Error 403
│   ├── NotFoundError.js       # Error 404
│   └── ConflictError.js       # Error 409
│
├── tests/
│   ├── users.test.js          # Tests de usuarios
│   └── database.test.js       # Tests de base de datos
│
├── logs/
│   ├── request.log            # Logs de requests (gitignored)
│   └── error.log              # Logs de errores (gitignored)
│
└── docs/
    ├── SECURITY_AUDIT.md              # Auditoría de seguridad
    ├── SECURITY_IMPROVEMENTS.md       # Mejoras de seguridad
    ├── TESTING_GUIDE.md              # Guía de tests
    ├── REQUIREMENTS_COMPLIANCE.md    # Cumplimiento de requisitos
    └── COMPLETION_SUMMARY.md         # Resumen de completitud
```

## 🔧 Variables de Entorno

| Variable | Descripción | Desarrollo | Producción |
|----------|-------------|-----------|-----------|
| NODE_ENV | Ambiente | development | production |
| PORT | Puerto del servidor | 3000 | 3000 (o variable) |
| MONGODB_URI | URI de MongoDB | localhost | URL de producción |
| JWT_SECRET | Secreto para JWT | dev-key | Cambiar OBLIGATORIO |

## 📚 Documentación

- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Auditoría de seguridad completa
- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Mejoras implementadas
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guía para ejecutar tests
- [REQUIREMENTS_COMPLIANCE.md](REQUIREMENTS_COMPLIANCE.md) - Checklist de requisitos
- [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) - Resumen ejecutivo

## 🐛 Troubleshooting

### Error: `connect ECONNREFUSED 127.0.0.1:27017`
**Solución**: MongoDB no está corriendo
```bash
# Iniciar MongoDB (si está instalado localmente)
mongod

# O usar Docker
docker run -d -p 27017:27017 mongo:latest
```

### Error: `JWT_SECRET no está definido`
**Solución**: Crear archivo `.env` con JWT_SECRET

### Error: `Port 3000 already in use`
**Solución**: Cambiar PORT en `.env` o cerrar la aplicación que usa ese puerto

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios mayores:

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

ISC - Libre para usar

## 👤 Autor

**Robenson Louissaint**
- GitHub: [@Robensonl](https://github.com/Robensonl)
- Email: robenson@example.com

## 🔗 Enlaces Útiles

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [News API](https://newsapi.org/)

## 📞 Soporte

Para reportar bugs o solicitar características, abre un issue en el [repositorio](https://github.com/Robensonl/news-explorer-backend/issues).

---

**Estado**: ✅ Production Ready (con mejoras de seguridad)
**Versión**: 1.0.0
**Última actualización**: 31 Enero 2026
