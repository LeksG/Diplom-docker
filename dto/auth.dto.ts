export interface UserResponseDTO {
  id: string;        
  email: string;
  firstName: string | null; 
  role: string;
  password?: string;
}

export interface AuthResponseDTO {
  token: string;
  user: UserResponseDTO;
}