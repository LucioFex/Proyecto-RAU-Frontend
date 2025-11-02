# Integración con el Backend de RAU

Este frontend ha sido adaptado para conectarse con el backend de FastAPI ubicado en:
https://github.com/LucioFex/Proyecto-RAU-Backend

## Configuración

### 1. Variables de Entorno

El archivo `.env` ya está configurado con la URL por defecto del backend:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Si el backend se ejecuta en otro puerto o URL, actualiza esta variable.

### 2. Ejecutar el Backend

Sigue las instrucciones del repositorio del backend para iniciarlo. Generalmente:

```bash
cd Proyecto-RAU-Backend
pipenv install
pipenv run uvicorn app.main:app --reload
```

El backend debería estar corriendo en `http://localhost:8000`.

### 3. Ejecutar el Frontend

```bash
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:3000`.

## Arquitectura de Servicios

El frontend ahora utiliza una arquitectura basada en servicios ubicados en `/services`:

- **api.ts**: Configuración de axios con interceptores para autenticación
- **auth.service.ts**: Login, registro, obtener usuario actual
- **user.service.ts**: Obtener y actualizar perfiles de usuario
- **community.service.ts**: CRUD de comunidades, unirse/salir
- **post.service.ts**: CRUD de posts, votación, obtener comentarios
- **comment.service.ts**: Crear y eliminar comentarios
- **onboarding.service.ts**: Guardar preferencias de onboarding

## Autenticación

El sistema de autenticación funciona con JWT:

1. Al iniciar sesión, el backend devuelve un `access_token`
2. Este token se guarda en `localStorage` como `auth_token`
3. Todos los requests subsecuentes incluyen el token en el header `Authorization: Bearer <token>`
4. Si el token expira o es inválido (401), el usuario es redirigido al login

## Mapeo de Datos

El backend usa nombres en español para los campos de la base de datos. Los servicios se encargan de mapear entre:

**Backend (español)** → **Frontend (inglés)**

- `usuario_id` → `id`
- `nombreCompleto` → `name`
- `titulo` → `title`
- `comunidad_id` → `id`
- `nombre` → `name`
- `descripcion` → `description`
- `post_id` → `id`
- `cuerpo` → `content`
- `comentario_id` → `id`

## Endpoints Utilizados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/register` - Registrar nuevo usuario

### Usuarios
- `GET /users/{user_id}` - Obtener perfil de usuario
- `PATCH /users/me` - Actualizar perfil propio

### Comunidades
- `GET /communities` - Listar comunidades
- `POST /communities` - Crear comunidad
- `GET /communities/{id}` - Obtener detalles de comunidad
- `POST /communities/{id}/join` - Unirse a comunidad
- `DELETE /communities/{id}/leave` - Salir de comunidad

### Posts
- `GET /posts` - Listar posts (con filtros opcionales)
- `POST /posts` - Crear post
- `GET /posts/{id}` - Obtener post específico
- `POST /posts/{id}/vote` - Votar post (+1 o -1)
- `POST /posts/{id}/bookmark` - Marcar/desmarcar post
- `DELETE /posts/{id}` - Eliminar post

### Comentarios
- `GET /posts/{post_id}/comments` - Listar comentarios de un post
- `POST /posts/{post_id}/comments` - Crear comentario
- `DELETE /posts/{post_id}/comments/{comment_id}` - Eliminar comentario

### Onboarding
- `GET /onboarding` - Obtener estado de onboarding
- `POST /onboarding` - Guardar preferencias de onboarding

## Manejo de Errores

Todos los servicios manejan errores de forma consistente:

```typescript
try {
  await service.method();
} catch (err: any) {
  setError(err.response?.data?.detail || 'Mensaje de error genérico');
}
```

Los errores se muestran al usuario a través de un componente de notificación.

## Testing

Para probar la integración:

1. Asegúrate de que el backend esté corriendo
2. Crea un usuario desde el formulario de registro
3. Inicia sesión con las credenciales
4. Completa el onboarding
5. Prueba las funcionalidades: crear posts, votar, comentar, etc.

## Notas Importantes

- El backend debe tener CORS configurado para permitir requests desde `http://localhost:3000`
- Los tokens JWT expiran después de 60 minutos (configurable en el backend)
- Las imágenes de perfil por defecto se sirven desde URLs externas (picsum.photos, unsplash)
