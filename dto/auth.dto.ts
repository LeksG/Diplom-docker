export interface UserResponseDTO {
  id: string;        
  email: string;
  fullName: string | null; 
  role: string;
}

export interface AuthResponseDTO {
  token: string;
  user: UserResponseDTO;
}