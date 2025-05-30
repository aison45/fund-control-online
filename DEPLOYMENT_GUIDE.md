
# Guía de Despliegue - Control de Gastos

## Opciones de Despliegue

### 1. Despliegue Local con Docker

#### Prerrequisitos
- Docker Desktop instalado
- SQL Server en Docker o instancia local

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # Base de datos SQL Server
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: expense-control-db
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=StrongPassword123!
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    networks:
      - expense-network

  # API Backend
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: expense-control-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=ExpenseControlDB;User Id=sa;Password=StrongPassword123!;TrustServerCertificate=true;
    ports:
      - "5001:80"
    depends_on:
      - sqlserver
    networks:
      - expense-network

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: expense-control-frontend
    environment:
      - VITE_API_URL=http://localhost:5001/api
    ports:
      - "3000:80"
    depends_on:
      - api
    networks:
      - expense-network

volumes:
  sqlserver_data:

networks:
  expense-network:
    driver: bridge
```

#### Comandos de Despliegue
```bash
# Clonar el repositorio
git clone <repository-url>
cd expense-control-system

# Construir y ejecutar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 2. Despliegue en Azure

#### Azure App Service + Azure SQL Database

**1. Crear recursos en Azure:**
```bash
# Login a Azure
az login

# Crear grupo de recursos
az group create --name expense-control-rg --location "East US"

# Crear SQL Server
az sql server create \
  --name expense-control-sql \
  --resource-group expense-control-rg \
  --location "East US" \
  --admin-user sqladmin \
  --admin-password StrongPassword123!

# Crear base de datos
az sql db create \
  --resource-group expense-control-rg \
  --server expense-control-sql \
  --name ExpenseControlDB \
  --service-objective Basic

# Crear App Service Plan
az appservice plan create \
  --name expense-control-plan \
  --resource-group expense-control-rg \
  --sku B1 \
  --is-linux

# Crear Web App para API
az webapp create \
  --resource-group expense-control-rg \
  --plan expense-control-plan \
  --name expense-control-api \
  --runtime "DOTNETCORE|8.0"

# Crear Web App para Frontend
az webapp create \
  --resource-group expense-control-rg \
  --plan expense-control-plan \
  --name expense-control-frontend \
  --runtime "NODE|18-lts"
```

**2. Configurar variables de entorno:**
```bash
# Configurar connection string para API
az webapp config appsettings set \
  --resource-group expense-control-rg \
  --name expense-control-api \
  --settings ConnectionStrings__DefaultConnection="Server=tcp:expense-control-sql.database.windows.net,1433;Initial Catalog=ExpenseControlDB;Persist Security Info=False;User ID=sqladmin;Password=StrongPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Configurar API URL para Frontend
az webapp config appsettings set \
  --resource-group expense-control-rg \
  --name expense-control-frontend \
  --settings VITE_API_URL="https://expense-control-api.azurewebsites.net/api"
```

**3. Desplegar aplicaciones:**
```bash
# Desplegar API
cd backend/ExpenseControl.API
dotnet publish -c Release -o ./publish
az webapp deployment source config-zip \
  --resource-group expense-control-rg \
  --name expense-control-api \
  --src ./publish.zip

# Desplegar Frontend
cd frontend
npm run build
az webapp deployment source config-zip \
  --resource-group expense-control-rg \
  --name expense-control-frontend \
  --src ./dist.zip
```

### 3. Despliegue en AWS

#### AWS ECS + RDS

**1. Crear infraestructura con Terraform:**

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "expense-control-vpc"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "Public Subnet ${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "Private Subnet ${count.index + 1}"
  }
}

# RDS SQL Server
resource "aws_db_instance" "main" {
  identifier             = "expense-control-db"
  engine                 = "sqlserver-ex"
  engine_version         = "15.00.4236.7.v1"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_encrypted      = true
  
  db_name  = "ExpenseControlDB"
  username = "sqladmin"
  password = "StrongPassword123!"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  skip_final_snapshot = true

  tags = {
    Name = "expense-control-db"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "expense-control-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
```

**2. Desplegar con Docker:**
```bash
# Build y push a ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# API
docker build -t expense-control-api ./backend
docker tag expense-control-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/expense-control-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/expense-control-api:latest

# Frontend
docker build -t expense-control-frontend ./frontend
docker tag expense-control-frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/expense-control-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/expense-control-frontend:latest
```

### 4. Despliegue en IIS (Windows Server)

#### Prerrequisitos
- Windows Server 2019 o superior
- IIS instalado con .NET 8 Hosting Bundle
- SQL Server instalado

#### Pasos de configuración:

**1. Preparar el servidor:**
```powershell
# Instalar IIS y características necesarias
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-NetFxExtensibility45, IIS-ISAPIExtensions, IIS-ISAPIFilter, IIS-NetFxExtensibility, IIS-ASPNET45

# Descargar e instalar .NET 8 Hosting Bundle
Invoke-WebRequest -Uri "https://download.visualstudio.microsoft.com/download/pr/..." -OutFile "dotnet-hosting-8.0-win.exe"
.\dotnet-hosting-8.0-win.exe /quiet
```

**2. Configurar la aplicación:**
```powershell
# Crear directorio de la aplicación
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\ExpenseControlAPI"
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\ExpenseControlFrontend"

# Publicar API
cd backend/ExpenseControl.API
dotnet publish -c Release -o "C:\inetpub\wwwroot\ExpenseControlAPI"

# Copiar archivos del frontend
cd frontend
npm run build
Copy-Item -Path "dist\*" -Destination "C:\inetpub\wwwroot\ExpenseControlFrontend" -Recurse
```

**3. Configurar IIS:**
```powershell
# Importar módulo de IIS
Import-Module WebAdministration

# Crear Application Pool para la API
New-WebAppPool -Name "ExpenseControlAPI" -Force
Set-ItemProperty -Path "IIS:\AppPools\ExpenseControlAPI" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\ExpenseControlAPI" -Name managedRuntimeVersion -Value ""

# Crear sitio web para API
New-Website -Name "ExpenseControlAPI" -Port 5001 -PhysicalPath "C:\inetpub\wwwroot\ExpenseControlAPI" -ApplicationPool "ExpenseControlAPI"

# Crear sitio web para Frontend
New-Website -Name "ExpenseControlFrontend" -Port 3000 -PhysicalPath "C:\inetpub\wwwroot\ExpenseControlFrontend"
```

**4. Configurar SSL:**
```powershell
# Crear certificado autofirmado (para desarrollo)
$cert = New-SelfSignedCertificate -DnsName "expense-control.local" -CertStoreLocation "cert:\LocalMachine\My"

# Configurar HTTPS binding
New-WebBinding -Name "ExpenseControlAPI" -Protocol https -Port 5002 -SslFlags 0
New-WebBinding -Name "ExpenseControlFrontend" -Protocol https -Port 3001 -SslFlags 0
```

### 5. Monitoreo y Logs

#### Configuración de Serilog (API)
```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.File", "Serilog.Sinks.Console"],
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "logs/expense-control-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      },
      {
        "Name": "Console"
      }
    ]
  }
}
```

#### Health Checks
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddCheck("api", () => HealthCheckResult.Healthy());

app.MapHealthChecks("/health");
```

### 6. Backup y Recuperación

#### Script de Backup Automatizado
```sql
-- Backup automático diario
DECLARE @BackupPath NVARCHAR(255) = 'C:\Backups\ExpenseControlDB_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak'

BACKUP DATABASE ExpenseControlDB 
TO DISK = @BackupPath
WITH FORMAT, COMPRESSION, CHECKSUM;

-- Verificar backup
RESTORE VERIFYONLY FROM DISK = @BackupPath;
```

#### PowerShell Script para Backup
```powershell
# backup-database.ps1
$BackupPath = "C:\Backups\ExpenseControlDB_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak"
$SqlCmd = "BACKUP DATABASE ExpenseControlDB TO DISK = '$BackupPath' WITH FORMAT, COMPRESSION, CHECKSUM"

Invoke-Sqlcmd -Query $SqlCmd -ServerInstance "localhost" -Database "master"
Write-Host "Backup completed: $BackupPath"

# Limpiar backups antiguos (mantener últimos 30 días)
Get-ChildItem "C:\Backups\ExpenseControlDB_*.bak" | Where-Object CreationTime -lt (Get-Date).AddDays(-30) | Remove-Item
```

### 7. Configuración de Dominio y SSL

#### Let's Encrypt con Certbot
```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d expense-control.yourdomain.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Configuración de Nginx
```nginx
server {
    listen 80;
    server_name expense-control.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name expense-control.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/expense-control.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/expense-control.yourdomain.com/privkey.pem;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/expense-control-frontend;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8. Verificación del Despliegue

#### Checklist de Verificación
- [ ] Base de datos creada y configurada
- [ ] API funcionando y respondiendo en `/health`
- [ ] Frontend accesible y conectando a la API
- [ ] Login con usuario admin/admin funcional
- [ ] Todas las funcionalidades principales operativas
- [ ] SSL configurado correctamente
- [ ] Backups programados
- [ ] Logs funcionando
- [ ] Monitoreo configurado

#### URLs de Verificación
```
Frontend: https://expense-control.yourdomain.com
API Health: https://expense-control.yourdomain.com/api/health
API Swagger: https://expense-control.yourdomain.com/api/swagger
```

Esta guía proporciona múltiples opciones de despliegue para adaptarse a diferentes entornos y necesidades. Cada opción incluye todos los pasos necesarios para un despliegue exitoso.
