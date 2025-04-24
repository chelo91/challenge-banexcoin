export class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class CommissionResponseDto {
  id: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserDto;
} 