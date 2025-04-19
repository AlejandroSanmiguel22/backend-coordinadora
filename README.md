# Coordinadora - Backend

Este proyecto es una API RESTful construida con **Node.js**, **Express** y **TypeScript** para gestionar el flujo logístico de envíos en la empresa Coordinadora. Implementa los principios de **Clean Architecture**, autenticación con **JWT**, almacenamiento en caché con **Redis**, documentación con **Swagger** y pruebas automatizadas con **Jest**.

---

## Arquitectura

Se sigue el patrón de diseño **Clean Architecture**, separando responsabilidades en capas:

```
src/
├── application/
│   └── usecases/               # Casos de uso
├── domain/
│   └── models/                 # Entidades de dominio
├── infrastructure/
│   ├── database/               # Prisma ORM
│   └── cache/                  # Cliente Redis
├── interfaces/
│   ├── controllers/            # Lógica de manejo de rutas
│   ├── middlewares/            # Validación JWT, roles, etc.
│   └── routes/                 # Definición de rutas express
├── config/                     # Swagger y configuración general
├── server.ts                   # Creación de servidor Express
└── index.ts                    # Inicialización de app y Redis
```

---

## Pruebas

Se han implementado **pruebas unitarias y de integración** con Jest y Supertest para todos los endpoints principales.

```bash
npm run test
```

---

## Seguridad

- Autenticación con JWT
- Roles de usuario: `user` y `admin`
- Middleware `authenticateToken` y `authorizeRole`

---

## Características

- Registro y login de usuarios
- Registro de envíos con seguimiento
- Asignación de rutas a envíos (admin)
- Consulta del estado en tiempo real con **Redis**
- Historial completo de cambios de estado
- Filtros y dashboard para admins
- Documentación Swagger disponible en `/api/docs`

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/coordinadora-backend.git
cd coordinadora-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/coordinadora"
JWT_SECRET="supersecreto"
REDIS_URL="redis://localhost:6379"
PORT=3000
```

### 4. Inicializar base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Recomendación: poblar la base de datos con datos de prueba:
Se recomienda este paso ya que las tablas de las Routes y Carriers se hacen de forma manual

```bash
mysql -u root -p coordinadora < seed.sql
```

### 5. Iniciar servidor

```bash
npm run dev
```

---

## Documentación Swagger

Disponible en: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Tecnologías usadas

- Node.js + Express
- TypeScript
- Prisma ORM + MySQL
- Redis
- Swagger
- JWT (autenticación)
- Jest + Supertest

---

## Autor

**Luis ALejandro Sanmiguel Galeano**
Desarrollador Fullstack apasionado por arquitecturas limpias y escalables.