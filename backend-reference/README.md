
# ExpenseControl.API - Backend Reference

Este directorio contiene archivos de referencia para el backend .NET del sistema de Control de Gastos.

## ⚠️ Importante

Estos archivos son **SOLO DE REFERENCIA** para desarrollo local. Lovable no puede ejecutar código .NET directamente.

## Estructura Creada

```
backend-reference/
└── ExpenseControl.API/
    ├── Program.cs                      # Configuración principal de la aplicación
    ├── ExpenseControl.API.csproj       # Archivo de proyecto con dependencias
    ├── appsettings.json               # Configuración de la aplicación
    ├── Controllers/
    │   └── AuthController.cs          # Controlador de autenticación
    ├── Data/
    │   └── ApplicationDbContext.cs    # Contexto de Entity Framework
    ├── Models/
    │   ├── Entities/
    │   │   └── User.cs               # Entidad de usuario
    │   └── DTOs/
    │       └── LoginDto.cs           # DTOs para autenticación
    ├── Services/
    │   ├── Interfaces/
    │   │   └── IAuthService.cs       # Interface del servicio de auth
    │   └── Implementations/
    │       └── AuthService.cs        # Implementación del servicio de auth
    ├── Helpers/
    │   └── PasswordHelper.cs         # Helper para manejo de contraseñas
    └── Middleware/
        └── ExceptionHandlingMiddleware.cs # Middleware para manejo de errores
```

## Cómo usar estos archivos

1. **Crear proyecto .NET localmente:**
   ```bash
   dotnet new webapi -n ExpenseControl.API
   cd ExpenseControl.API
   ```

2. **Copiar archivos de referencia:**
   - Copia los archivos de `backend-reference/` a tu proyecto local
   - Instala las dependencias listadas en el `.csproj`

3. **Configurar base de datos:**
   - Ejecuta los scripts de `DATABASE_SCRIPTS.sql`
   - Configura la cadena de conexión en `appsettings.json`

4. **Ejecutar el proyecto:**
   ```bash
   dotnet restore
   dotnet run
   ```

## Características incluidas

- ✅ Autenticación JWT
- ✅ Entity Framework Core
- ✅ Manejo de errores
- ✅ Hashing de contraseñas con BCrypt
- ✅ CORS configurado para React
- ✅ Swagger/OpenAPI
- ✅ Estructura de servicios y repositorios

## Próximos pasos

1. Completar las entidades restantes (ExpenseType, MonetaryFund, etc.)
2. Implementar los controladores faltantes
3. Agregar validaciones con FluentValidation
4. Implementar los servicios completos
5. Agregar pruebas unitarias

## Conexión con Frontend

El frontend de Lovable puede conectarse a este backend local:
- URL de desarrollo: `https://localhost:7001/api`
- Configurar CORS para permitir `http://localhost:5173`

Para integración completa, considera usar la integración nativa de Lovable con Supabase.
