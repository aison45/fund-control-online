
using Microsoft.EntityFrameworkCore;
using ExpenseControl.API.Models.Entities;

namespace ExpenseControl.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ExpenseType> ExpenseTypes { get; set; }
        public DbSet<MonetaryFund> MonetaryFunds { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<ExpenseHeader> ExpenseHeaders { get; set; }
        public DbSet<ExpenseDetail> ExpenseDetails { get; set; }
        public DbSet<Deposit> Deposits { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // ExpenseType Configuration
            modelBuilder.Entity<ExpenseType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // MonetaryFund Configuration
            modelBuilder.Entity<MonetaryFund>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AccountNumber).HasMaxLength(50);
                entity.Property(e => e.BankName).HasMaxLength(100);
            });

            // Budget Configuration
            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Month).IsRequired().HasMaxLength(7);
                entity.Property(e => e.BudgetAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SpentAmount).HasColumnType("decimal(18,2)");
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.ExpenseType)
                      .WithMany()
                      .HasForeignKey(e => e.ExpenseTypeId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => new { e.UserId, e.ExpenseTypeId, e.Month }).IsUnique();
            });

            // ExpenseHeader Configuration
            modelBuilder.Entity<ExpenseHeader>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CommerceName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.DocumentNumber).HasMaxLength(50);
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Observations).HasMaxLength(500);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.MonetaryFund)
                      .WithMany()
                      .HasForeignKey(e => e.MonetaryFundId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ExpenseDetail Configuration
            modelBuilder.Entity<ExpenseDetail>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Description).HasMaxLength(200);
                
                entity.HasOne(e => e.ExpenseHeader)
                      .WithMany(h => h.ExpenseDetails)
                      .HasForeignKey(e => e.ExpenseHeaderId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.ExpenseType)
                      .WithMany()
                      .HasForeignKey(e => e.ExpenseTypeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Deposit Configuration
            modelBuilder.Entity<Deposit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.Property(e => e.ReferenceNumber).HasMaxLength(50);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.MonetaryFund)
                      .WithMany()
                      .HasForeignKey(e => e.MonetaryFundId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
