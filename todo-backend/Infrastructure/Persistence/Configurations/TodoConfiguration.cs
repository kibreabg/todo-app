using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using todo_backend.Domain.Entities;

namespace todo_backend.Infrastructure.Persistence.Configurations;

public sealed class TodoConfiguration : IEntityTypeConfiguration<Todo>
{
    public void Configure(EntityTypeBuilder<Todo> builder)
    {
        builder.ToTable("todos");

        builder.HasKey(todo => todo.Id);

        builder.Property(todo => todo.Id)
            .ValueGeneratedNever();

        builder.Property(todo => todo.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(todo => todo.Completed)
            .IsRequired();

        builder.Property(todo => todo.CreatedAt)
            .IsRequired();

        builder.Property(todo => todo.UpdatedAt)
            .IsRequired();

        builder.Property(todo => todo.UserId)
            .HasMaxLength(450);

        builder.HasOne(todo => todo.User)
            .WithMany()
            .HasForeignKey(todo => todo.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(todo => todo.UserId);
    }
}
