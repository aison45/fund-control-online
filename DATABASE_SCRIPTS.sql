
-- =============================================
-- SCRIPT COMPLETO DE BASE DE DATOS
-- Control de Gastos - Sistema Completo
-- =============================================

-- =============================================
-- 1. CREAR BASE DE DATOS
-- =============================================
USE master;
GO

-- Verificar si la base de datos existe y crearla si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ExpenseControlDB')
BEGIN
    CREATE DATABASE ExpenseControlDB;
    PRINT 'Base de datos ExpenseControlDB creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos ExpenseControlDB ya existe.';
END
GO

USE ExpenseControlDB;
GO

-- =============================================
-- 2. CREAR TABLAS
-- =============================================

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Email NVARCHAR(100) NULL,
        FirstName NVARCHAR(50) NULL,
        LastName NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    PRINT 'Tabla Users creada exitosamente.';
END
GO

-- Tabla de Tipos de Gasto
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ExpenseTypes' AND xtype='U')
BEGIN
    CREATE TABLE ExpenseTypes (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code NVARCHAR(10) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    PRINT 'Tabla ExpenseTypes creada exitosamente.';
END
GO

-- Tabla de Fondos Monetarios
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MonetaryFunds' AND xtype='U')
BEGIN
    CREATE TABLE MonetaryFunds (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL,
        Type NVARCHAR(20) NOT NULL CHECK (Type IN ('bank', 'cash')),
        Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
        AccountNumber NVARCHAR(50) NULL,
        BankName NVARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    PRINT 'Tabla MonetaryFunds creada exitosamente.';
END
GO

-- Tabla de Presupuestos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Budgets' AND xtype='U')
BEGIN
    CREATE TABLE Budgets (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        ExpenseTypeId UNIQUEIDENTIFIER NOT NULL,
        Month NVARCHAR(7) NOT NULL, -- Formato YYYY-MM
        BudgetAmount DECIMAL(18,2) NOT NULL,
        SpentAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Budgets_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_Budgets_ExpenseTypes FOREIGN KEY (ExpenseTypeId) REFERENCES ExpenseTypes(Id),
        CONSTRAINT UQ_Budget_User_ExpenseType_Month UNIQUE (UserId, ExpenseTypeId, Month)
    );
    PRINT 'Tabla Budgets creada exitosamente.';
END
GO

-- Tabla de Encabezados de Gastos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ExpenseHeaders' AND xtype='U')
BEGIN
    CREATE TABLE ExpenseHeaders (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Date DATETIME2 NOT NULL,
        MonetaryFundId UNIQUEIDENTIFIER NOT NULL,
        Observations NVARCHAR(500) NULL,
        CommerceName NVARCHAR(200) NOT NULL,
        DocumentType NVARCHAR(20) NOT NULL CHECK (DocumentType IN ('receipt', 'invoice', 'other')),
        DocumentNumber NVARCHAR(50) NULL,
        Total DECIMAL(18,2) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_ExpenseHeaders_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_ExpenseHeaders_MonetaryFunds FOREIGN KEY (MonetaryFundId) REFERENCES MonetaryFunds(Id)
    );
    PRINT 'Tabla ExpenseHeaders creada exitosamente.';
END
GO

-- Tabla de Detalles de Gastos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ExpenseDetails' AND xtype='U')
BEGIN
    CREATE TABLE ExpenseDetails (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ExpenseHeaderId UNIQUEIDENTIFIER NOT NULL,
        ExpenseTypeId UNIQUEIDENTIFIER NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Description NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_ExpenseDetails_ExpenseHeaders FOREIGN KEY (ExpenseHeaderId) REFERENCES ExpenseHeaders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_ExpenseDetails_ExpenseTypes FOREIGN KEY (ExpenseTypeId) REFERENCES ExpenseTypes(Id)
    );
    PRINT 'Tabla ExpenseDetails creada exitosamente.';
END
GO

-- Tabla de Depósitos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Deposits' AND xtype='U')
BEGIN
    CREATE TABLE Deposits (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Date DATETIME2 NOT NULL,
        MonetaryFundId UNIQUEIDENTIFIER NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Description NVARCHAR(200) NULL,
        ReferenceNumber NVARCHAR(50) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Deposits_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_Deposits_MonetaryFunds FOREIGN KEY (MonetaryFundId) REFERENCES MonetaryFunds(Id)
    );
    PRINT 'Tabla Deposits creada exitosamente.';
END
GO

-- Tabla de Auditoría
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
BEGIN
    CREATE TABLE AuditLogs (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NULL,
        TableName NVARCHAR(50) NOT NULL,
        Operation NVARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
        RecordId UNIQUEIDENTIFIER NOT NULL,
        OldValues NVARCHAR(MAX) NULL,
        NewValues NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
    PRINT 'Tabla AuditLogs creada exitosamente.';
END
GO

-- =============================================
-- 3. CREAR ÍNDICES
-- =============================================

-- Índices para optimizar consultas frecuentes
CREATE NONCLUSTERED INDEX IX_ExpenseHeaders_Date ON ExpenseHeaders(Date);
CREATE NONCLUSTERED INDEX IX_ExpenseHeaders_UserId ON ExpenseHeaders(UserId);
CREATE NONCLUSTERED INDEX IX_ExpenseHeaders_MonetaryFundId ON ExpenseHeaders(MonetaryFundId);

CREATE NONCLUSTERED INDEX IX_ExpenseDetails_ExpenseHeaderId ON ExpenseDetails(ExpenseHeaderId);
CREATE NONCLUSTERED INDEX IX_ExpenseDetails_ExpenseTypeId ON ExpenseDetails(ExpenseTypeId);

CREATE NONCLUSTERED INDEX IX_Budgets_Month ON Budgets(Month);
CREATE NONCLUSTERED INDEX IX_Budgets_UserId ON Budgets(UserId);

CREATE NONCLUSTERED INDEX IX_Deposits_Date ON Deposits(Date);
CREATE NONCLUSTERED INDEX IX_Deposits_UserId ON Deposits(UserId);

PRINT 'Índices creados exitosamente.';
GO

-- =============================================
-- 4. CREAR STORED PROCEDURES
-- =============================================

-- Procedimiento para obtener el siguiente código de tipo de gasto
CREATE OR ALTER PROCEDURE sp_GetNextExpenseTypeCode
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NextCode INT;
    
    SELECT @NextCode = COALESCE(MAX(CAST(Code AS INT)), 0) + 1
    FROM ExpenseTypes
    WHERE ISNUMERIC(Code) = 1;
    
    SELECT RIGHT('000' + CAST(@NextCode AS VARCHAR(3)), 3) AS NextCode;
END
GO

-- Procedimiento para validar presupuesto al crear gasto
CREATE OR ALTER PROCEDURE sp_ValidateBudgetOverrun
    @UserId UNIQUEIDENTIFIER,
    @ExpenseDetails NVARCHAR(MAX) -- JSON con detalles del gasto
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentMonth NVARCHAR(7) = FORMAT(GETDATE(), 'yyyy-MM');
    DECLARE @Overruns TABLE (
        ExpenseTypeName NVARCHAR(100),
        BudgetAmount DECIMAL(18,2),
        CurrentSpent DECIMAL(18,2),
        NewExpense DECIMAL(18,2),
        TotalSpent DECIMAL(18,2),
        Overrun DECIMAL(18,2)
    );
    
    -- Parsear JSON y validar cada tipo de gasto
    INSERT INTO @Overruns
    SELECT 
        et.Name,
        b.BudgetAmount,
        b.SpentAmount,
        ed.Amount,
        b.SpentAmount + ed.Amount,
        (b.SpentAmount + ed.Amount) - b.BudgetAmount
    FROM OPENJSON(@ExpenseDetails) 
    WITH (
        ExpenseTypeId UNIQUEIDENTIFIER '$.expenseTypeId',
        Amount DECIMAL(18,2) '$.amount'
    ) ed
    INNER JOIN ExpenseTypes et ON ed.ExpenseTypeId = et.Id
    LEFT JOIN Budgets b ON b.UserId = @UserId 
        AND b.ExpenseTypeId = ed.ExpenseTypeId 
        AND b.Month = @CurrentMonth
    WHERE b.BudgetAmount IS NOT NULL 
        AND (b.SpentAmount + ed.Amount) > b.BudgetAmount;
    
    SELECT * FROM @Overruns;
END
GO

-- Procedimiento para actualizar balance de fondo monetario
CREATE OR ALTER PROCEDURE sp_UpdateMonetaryFundBalance
    @FundId UNIQUEIDENTIFIER,
    @Amount DECIMAL(18,2),
    @Operation NVARCHAR(10) -- 'ADD' or 'SUBTRACT'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        IF @Operation = 'ADD'
        BEGIN
            UPDATE MonetaryFunds 
            SET Balance = Balance + @Amount,
                UpdatedAt = GETUTCDATE()
            WHERE Id = @FundId;
        END
        ELSE IF @Operation = 'SUBTRACT'
        BEGIN
            UPDATE MonetaryFunds 
            SET Balance = Balance - @Amount,
                UpdatedAt = GETUTCDATE()
            WHERE Id = @FundId;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Procedimiento para obtener movimientos por rango de fechas
CREATE OR ALTER PROCEDURE sp_GetMovementsByDateRange
    @UserId UNIQUEIDENTIFIER,
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Gastos
    SELECT 
        'EXPENSE' AS MovementType,
        eh.Id,
        eh.Date,
        eh.CommerceName AS Description,
        mf.Name AS MonetaryFund,
        -eh.Total AS Amount,
        eh.DocumentType,
        eh.Observations
    FROM ExpenseHeaders eh
    INNER JOIN MonetaryFunds mf ON eh.MonetaryFundId = mf.Id
    WHERE eh.UserId = @UserId
        AND eh.Date BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Depósitos
    SELECT 
        'DEPOSIT' AS MovementType,
        d.Id,
        d.Date,
        COALESCE(d.Description, 'Depósito') AS Description,
        mf.Name AS MonetaryFund,
        d.Amount,
        'DEPOSIT' AS DocumentType,
        d.ReferenceNumber AS Observations
    FROM Deposits d
    INNER JOIN MonetaryFunds mf ON d.MonetaryFundId = mf.Id
    WHERE d.UserId = @UserId
        AND d.Date BETWEEN @StartDate AND @EndDate
    
    ORDER BY Date DESC;
END
GO

-- =============================================
-- 5. CREAR TRIGGERS
-- =============================================

-- Trigger para actualizar SpentAmount en Budgets
CREATE OR ALTER TRIGGER tr_UpdateBudgetSpentAmount
ON ExpenseDetails
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentMonth NVARCHAR(7) = FORMAT(GETDATE(), 'yyyy-MM');
    
    -- Actualizar presupuestos afectados
    UPDATE b
    SET SpentAmount = (
        SELECT COALESCE(SUM(ed.Amount), 0)
        FROM ExpenseDetails ed
        INNER JOIN ExpenseHeaders eh ON ed.ExpenseHeaderId = eh.Id
        WHERE ed.ExpenseTypeId = b.ExpenseTypeId
            AND eh.UserId = b.UserId
            AND FORMAT(eh.Date, 'yyyy-MM') = b.Month
    ),
    UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN ExpenseHeaders eh ON i.ExpenseHeaderId = eh.Id
        WHERE i.ExpenseTypeId = b.ExpenseTypeId
            AND eh.UserId = b.UserId
            AND FORMAT(eh.Date, 'yyyy-MM') = b.Month
    )
    OR EXISTS (
        SELECT 1 FROM deleted d
        INNER JOIN ExpenseHeaders eh ON d.ExpenseHeaderId = eh.Id
        WHERE d.ExpenseTypeId = b.ExpenseTypeId
            AND eh.UserId = b.UserId
            AND FORMAT(eh.Date, 'yyyy-MM') = b.Month
    );
END
GO

-- Trigger para actualizar balance de fondos monetarios
CREATE OR ALTER TRIGGER tr_UpdateMonetaryFundBalance
ON ExpenseHeaders
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Restar del balance cuando se inserta un gasto
    IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
    BEGIN
        UPDATE mf
        SET Balance = Balance - i.Total,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN inserted i ON mf.Id = i.MonetaryFundId;
    END
    
    -- Sumar al balance cuando se elimina un gasto
    IF EXISTS(SELECT * FROM deleted) AND NOT EXISTS(SELECT * FROM inserted)
    BEGIN
        UPDATE mf
        SET Balance = Balance + d.Total,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN deleted d ON mf.Id = d.MonetaryFundId;
    END
    
    -- Actualizar balance cuando se modifica un gasto
    IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        UPDATE mf
        SET Balance = Balance + d.Total - i.Total,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN inserted i ON mf.Id = i.MonetaryFundId
        INNER JOIN deleted d ON mf.Id = d.MonetaryFundId AND i.Id = d.Id;
    END
END
GO

-- Trigger para actualizar balance con depósitos
CREATE OR ALTER TRIGGER tr_UpdateMonetaryFundBalanceDeposits
ON Deposits
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Sumar al balance cuando se inserta un depósito
    IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
    BEGIN
        UPDATE mf
        SET Balance = Balance + i.Amount,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN inserted i ON mf.Id = i.MonetaryFundId;
    END
    
    -- Restar del balance cuando se elimina un depósito
    IF EXISTS(SELECT * FROM deleted) AND NOT EXISTS(SELECT * FROM inserted)
    BEGIN
        UPDATE mf
        SET Balance = Balance - d.Amount,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN deleted d ON mf.Id = d.MonetaryFundId;
    END
    
    -- Actualizar balance cuando se modifica un depósito
    IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        UPDATE mf
        SET Balance = Balance - d.Amount + i.Amount,
            UpdatedAt = GETUTCDATE()
        FROM MonetaryFunds mf
        INNER JOIN inserted i ON mf.Id = i.MonetaryFundId
        INNER JOIN deleted d ON mf.Id = d.MonetaryFundId AND i.Id = d.Id;
    END
END
GO

-- =============================================
-- 6. INSERTAR DATOS INICIALES
-- =============================================

-- Usuario administrador por defecto
DECLARE @AdminUserId UNIQUEIDENTIFIER = NEWID();

IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Id, Username, PasswordHash, Email, FirstName, LastName, IsActive)
    VALUES (
        @AdminUserId,
        'admin',
        '$2a$11$Kb2lfBTpfkYwWP.8HVbUTOZQjKLjOi9x5U8oQPkjHQKGNcR9tB6yS', -- Hash de "admin"
        'admin@expensecontrol.com',
        'Administrator',
        'System',
        1
    );
    PRINT 'Usuario administrador creado exitosamente.';
END

-- Tipos de gasto por defecto
IF NOT EXISTS (SELECT 1 FROM ExpenseTypes)
BEGIN
    INSERT INTO ExpenseTypes (Code, Name, Description) VALUES
    ('001', 'Alimentación', 'Gastos en comida y bebidas'),
    ('002', 'Transporte', 'Gastos en movilización y combustible'),
    ('003', 'Entretenimiento', 'Gastos en recreación y diversión'),
    ('004', 'Servicios Básicos', 'Electricidad, agua, gas, internet'),
    ('005', 'Salud', 'Medicamentos, consultas médicas'),
    ('006', 'Educación', 'Cursos, libros, materiales educativos'),
    ('007', 'Vestimenta', 'Ropa y calzado'),
    ('008', 'Hogar', 'Muebles, electrodomésticos, decoración'),
    ('009', 'Tecnología', 'Equipos electrónicos, software'),
    ('010', 'Otros', 'Gastos varios no categorizados');
    PRINT 'Tipos de gasto por defecto insertados exitosamente.';
END

-- Fondos monetarios por defecto
IF NOT EXISTS (SELECT 1 FROM MonetaryFunds)
BEGIN
    INSERT INTO MonetaryFunds (Name, Type, Balance, AccountNumber, BankName) VALUES
    ('Cuenta Corriente Principal', 'bank', 10000.00, '1234567890', 'Banco Nacional'),
    ('Cuenta de Ahorros', 'bank', 25000.00, '0987654321', 'Banco Nacional'),
    ('Caja Chica', 'cash', 1000.00, NULL, NULL),
    ('Billetera Personal', 'cash', 500.00, NULL, NULL);
    PRINT 'Fondos monetarios por defecto insertados exitosamente.';
END

-- Presupuestos de ejemplo para el mes actual
DECLARE @CurrentMonth NVARCHAR(7) = FORMAT(GETDATE(), 'yyyy-MM');
IF NOT EXISTS (SELECT 1 FROM Budgets WHERE Month = @CurrentMonth)
BEGIN
    INSERT INTO Budgets (UserId, ExpenseTypeId, Month, BudgetAmount) 
    SELECT 
        @AdminUserId,
        et.Id,
        @CurrentMonth,
        CASE et.Code
            WHEN '001' THEN 1500.00  -- Alimentación
            WHEN '002' THEN 800.00   -- Transporte
            WHEN '003' THEN 400.00   -- Entretenimiento
            WHEN '004' THEN 600.00   -- Servicios Básicos
            WHEN '005' THEN 300.00   -- Salud
            ELSE 200.00              -- Otros
        END
    FROM ExpenseTypes et
    WHERE et.Code IN ('001', '002', '003', '004', '005');
    PRINT 'Presupuestos de ejemplo insertados exitosamente.';
END

-- =============================================
-- 7. CREAR VISTAS
-- =============================================

-- Vista para resumen de gastos por tipo
CREATE OR ALTER VIEW vw_ExpenseSummaryByType
AS
SELECT 
    et.Code,
    et.Name AS ExpenseTypeName,
    COUNT(ed.Id) AS TransactionCount,
    SUM(ed.Amount) AS TotalAmount,
    AVG(ed.Amount) AS AverageAmount,
    FORMAT(eh.Date, 'yyyy-MM') AS Month
FROM ExpenseTypes et
LEFT JOIN ExpenseDetails ed ON et.Id = ed.ExpenseTypeId
LEFT JOIN ExpenseHeaders eh ON ed.ExpenseHeaderId = eh.Id
GROUP BY et.Code, et.Name, FORMAT(eh.Date, 'yyyy-MM');
GO

-- Vista para resumen de fondos monetarios
CREATE OR ALTER VIEW vw_MonetaryFundSummary
AS
SELECT 
    mf.Id,
    mf.Name,
    mf.Type,
    mf.Balance,
    COUNT(DISTINCT eh.Id) AS ExpenseCount,
    COALESCE(SUM(eh.Total), 0) AS TotalExpenses,
    COUNT(DISTINCT d.Id) AS DepositCount,
    COALESCE(SUM(d.Amount), 0) AS TotalDeposits
FROM MonetaryFunds mf
LEFT JOIN ExpenseHeaders eh ON mf.Id = eh.MonetaryFundId
LEFT JOIN Deposits d ON mf.Id = d.MonetaryFundId
WHERE mf.IsActive = 1
GROUP BY mf.Id, mf.Name, mf.Type, mf.Balance;
GO

-- Vista para comparación de presupuesto vs ejecución
CREATE OR ALTER VIEW vw_BudgetComparison
AS
SELECT 
    b.Month,
    et.Name AS ExpenseTypeName,
    b.BudgetAmount,
    b.SpentAmount,
    b.BudgetAmount - b.SpentAmount AS RemainingBudget,
    CASE 
        WHEN b.BudgetAmount > 0 
        THEN (b.SpentAmount * 100.0) / b.BudgetAmount 
        ELSE 0 
    END AS ExecutionPercentage,
    CASE 
        WHEN b.SpentAmount > b.BudgetAmount 
        THEN 'OVER_BUDGET' 
        WHEN b.SpentAmount = b.BudgetAmount 
        THEN 'ON_BUDGET' 
        ELSE 'UNDER_BUDGET' 
    END AS BudgetStatus
FROM Budgets b
INNER JOIN ExpenseTypes et ON b.ExpenseTypeId = et.Id
WHERE et.IsActive = 1;
GO

PRINT 'Vistas creadas exitosamente.';
PRINT '===========================================';
PRINT 'SCRIPT COMPLETADO EXITOSAMENTE';
PRINT 'Base de datos ExpenseControlDB configurada';
PRINT 'Usuario por defecto: admin / admin';
PRINT '===========================================';
