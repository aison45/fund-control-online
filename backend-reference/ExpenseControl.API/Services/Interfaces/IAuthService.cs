
using ExpenseControl.API.Models.DTOs;

namespace ExpenseControl.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(LoginDto loginDto);
        Task<AuthResult> RegisterAsync(RegisterDto registerDto);
        Task<UserDto?> GetUserByIdAsync(Guid userId);
        string GenerateJwtToken(UserDto user);
    }
}
