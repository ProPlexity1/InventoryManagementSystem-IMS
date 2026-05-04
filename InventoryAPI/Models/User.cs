using System.ComponentModel.DataAnnotations;
namespace InventoryAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public ICollection<UserRole> UserRoles { get; set; }

        public ICollection<Item> Items { get; set; }

    }
}