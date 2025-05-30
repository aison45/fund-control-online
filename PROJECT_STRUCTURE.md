
# Control de Gastos - Estructura del Proyecto Completo

## Arquitectura del Sistema

Este proyecto utiliza una arquitectura de 3 capas:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: .NET 8 Web API
- **Base de Datos**: SQL Server

## Estructura de Directorios

```
expense-control-system/
│
├── frontend/                          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Componentes base (shadcn/ui)
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── maintenance/
│   │   │   │   ├── ExpenseTypes.tsx
│   │   │   │   └── MonetaryFunds.tsx
│   │   │   ├── movements/
│   │   │   │   ├── Budgets.tsx
│   │   │   │   ├── ExpenseRegistration.tsx
│   │   │   │   └── Deposits.tsx
│   │   │   └── reports/
│   │   │       ├── MovementQuery.tsx
│   │   │       └── BudgetChart.tsx
│   │   ├── services/
│   │   │   ├── api.ts                 # Configuración de Axios
│   │   │   ├── authService.ts
│   │   │   ├── expenseTypeService.ts
│   │   │   ├── monetaryFundService.ts
│   │   │   ├── budgetService.ts
│   │   │   ├── expenseService.ts
│   │   │   └── depositService.ts
│   │   ├── types/
│   │   │   └── expense.ts             # Interfaces TypeScript
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   └── utils/
│   │       └── constants.ts
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                           # API .NET
│   ├── ExpenseControl.API/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── ExpenseTypesController.cs
│   │   │   ├── MonetaryFundsController.cs
│   │   │   ├── BudgetsController.cs
│   │   │   ├── ExpensesController.cs
│   │   │   ├── DepositsController.cs
│   │   │   └── ReportsController.cs
│   │   ├── Models/
│   │   │   ├── DTOs/
│   │   │   │   ├── LoginDto.cs
│   │   │   │   ├── ExpenseTypeDto.cs
│   │   │   │   ├── MonetaryFundDto.cs
│   │   │   │   ├── BudgetDto.cs
│   │   │   │   ├── ExpenseHeaderDto.cs
│   │   │   │   ├── ExpenseDetailDto.cs
│   │   │   │   └── DepositDto.cs
│   │   │   └── Entities/
│   │   │       ├── User.cs
│   │   │       ├── ExpenseType.cs
│   │   │       ├── MonetaryFund.cs
│   │   │       ├── Budget.cs
│   │   │       ├── ExpenseHeader.cs
│   │   │       ├── ExpenseDetail.cs
│   │   │       └── Deposit.cs
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Configurations/
│   │   │       ├── UserConfiguration.cs
│   │   │       ├── ExpenseTypeConfiguration.cs
│   │   │       ├── MonetaryFundConfiguration.cs
│   │   │       ├── BudgetConfiguration.cs
│   │   │       ├── ExpenseHeaderConfiguration.cs
│   │   │       ├── ExpenseDetailConfiguration.cs
│   │   │       └── DepositConfiguration.cs
│   │   ├── Services/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── IExpenseTypeService.cs
│   │   │   │   ├── IMonetaryFundService.cs
│   │   │   │   ├── IBudgetService.cs
│   │   │   │   ├── IExpenseService.cs
│   │   │   │   ├── IDepositService.cs
│   │   │   │   └── IReportService.cs
│   │   │   └── Implementations/
│   │   │       ├── AuthService.cs
│   │   │       ├── ExpenseTypeService.cs
│   │   │       ├── MonetaryFundService.cs
│   │   │       ├── BudgetService.cs
│   │   │       ├── ExpenseService.cs
│   │   │       ├── DepositService.cs
│   │   │       └── ReportService.cs
│   │   ├── Middleware/
│   │   │   ├── AuthenticationMiddleware.cs
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   ├── Helpers/
│   │   │   ├── JwtHelper.cs
│   │   │   └── PasswordHelper.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── ExpenseControl.API.csproj
│   │
│   └── ExpenseControl.Tests/          # Proyecto de pruebas
│       ├── UnitTests/
│       ├── IntegrationTests/
│       └── ExpenseControl.Tests.csproj
│
├── database/                          # Scripts de Base de Datos
│   ├── 01_CreateDatabase.sql
│   ├── 02_CreateTables.sql
│   ├── 03_CreateIndexes.sql
│   ├── 04_CreateStoredProcedures.sql
│   ├── 05_InsertInitialData.sql
│   └── 06_CreateViews.sql
│
├── docs/                              # Documentación
│   ├── API_Documentation.md
│   ├── Database_Schema.md
│   └── Deployment_Guide.md
│
├── docker-compose.yml                 # Para desarrollo local
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

## Configuración del Entorno de Desarrollo

### 1. Requisitos del Sistema

- **Node.js** 18 o superior
- **.NET 8 SDK**
- **SQL Server** 2019 o superior (o SQL Server Express)
- **Visual Studio 2022** o **VS Code**
- **SQL Server Management Studio** (SSMS)

### 2. Configuración de la Base de Datos

1. Crear la base de datos ejecutando los scripts en orden:
   ```sql
   -- Ejecutar scripts en este orden:
   01_CreateDatabase.sql
   02_CreateTables.sql
   03_CreateIndexes.sql
   04_CreateStoredProcedures.sql
   05_InsertInitialData.sql
   06_CreateViews.sql
   ```

2. Configurar la cadena de conexión en `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ExpenseControlDB;Trusted_Connection=true;TrustServerCertificate=true;"
     }
   }
   ```

### 3. Configuración del Backend (.NET)

1. Instalar dependencias:
   ```bash
   cd backend/ExpenseControl.API
   dotnet restore
   ```

2. Ejecutar migraciones (si usas Entity Framework):
   ```bash
   dotnet ef database update
   ```

3. Ejecutar la API:
   ```bash
   dotnet run
   ```

La API estará disponible en: `https://localhost:7001`

### 4. Configuración del Frontend (React)

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configurar variables de entorno (`.env`):
   ```env
   VITE_API_URL=https://localhost:7001/api
   VITE_APP_TITLE=Control de Gastos
   ```

3. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en: `http://localhost:5173`

## Configuración de Producción

### 1. Docker (Recomendado)

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Solo construir
docker-compose build

# Ejecutar en segundo plano
docker-compose up -d
```

### 2. IIS (Windows Server)

1. **Backend**: Publicar la API en IIS
2. **Frontend**: Build de producción y servir archivos estáticos
3. **Base de Datos**: SQL Server en producción

### 3. Variables de Entorno de Producción

**Backend (`appsettings.Production.json`)**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=PROD_SERVER;Database=ExpenseControlDB;User Id=app_user;Password=secure_password;"
  },
  "JwtSettings": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters",
    "Issuer": "ExpenseControlAPI",
    "Audience": "ExpenseControlApp",
    "ExpirationInHours": 24
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

**Frontend (`.env.production`)**:
```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_TITLE=Control de Gastos
```

## Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **Axios** para llamadas HTTP
- **React Query** para gestión de estado del servidor
- **React Router** para navegación

### Backend
- **.NET 8** Web API
- **Entity Framework Core** para ORM
- **SQL Server** como base de datos
- **JWT** para autenticación
- **AutoMapper** para mapeo de objetos
- **FluentValidation** para validaciones
- **Serilog** para logging

### Base de Datos
- **SQL Server 2019+**
- **Stored Procedures** para operaciones complejas
- **Índices** optimizados para consultas
- **Triggers** para auditoría

## Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin

## Comandos Útiles

```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting

# Backend
dotnet run           # Ejecutar en desarrollo
dotnet build         # Compilar
dotnet test          # Ejecutar pruebas
dotnet publish       # Publicar para producción

# Base de Datos
sqlcmd -S localhost -d ExpenseControlDB -i script.sql
```

## Estructura de la API

### Endpoints Principales

```
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/expense-types
POST   /api/expense-types
PUT    /api/expense-types/{id}
DELETE /api/expense-types/{id}

GET    /api/monetary-funds
POST   /api/monetary-funds
PUT    /api/monetary-funds/{id}
DELETE /api/monetary-funds/{id}

GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/{id}
DELETE /api/budgets/{id}

GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/{id}
DELETE /api/expenses/{id}

GET    /api/deposits
POST   /api/deposits
PUT    /api/deposits/{id}
DELETE /api/deposits/{id}

GET    /api/reports/movements
GET    /api/reports/budget-comparison
```

## Próximos Pasos

1. Configurar el entorno de desarrollo
2. Ejecutar scripts de base de datos
3. Configurar y ejecutar el backend
4. Configurar y ejecutar el frontend
5. Probar la integración completa
6. Desplegar en producción

Para más detalles específicos, consultar la documentación en la carpeta `docs/`.
