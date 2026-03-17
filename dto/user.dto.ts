export interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
  // Ми спеціально НЕ додаємо сюди email, бо його не можна змінювати просто так
  // І тим паче НЕ додаємо role, щоб юзер не міг зробити себе адміном
}