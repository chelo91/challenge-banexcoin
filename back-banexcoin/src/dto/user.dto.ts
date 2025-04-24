import { Account } from 'src/entities/account.entity';
import { UserType, UserStatus } from '../entities/user.entity';
import { Exclude, Expose, Type } from 'class-transformer';

class AccountIdDto {
  @Expose()
  id: string;
}

@Exclude()
export class UserResponseDTO {
    @Expose()
    id: string;
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    email: string;
    @Exclude()
    hashedPassword: string;
    @Exclude()
    type: UserType;
    @Exclude()
    status: UserStatus;
    @Exclude()
    createdAt: Date;
    @Exclude()
    updatedAt: Date;
    @Expose()
    @Type(() => AccountIdDto)
    accounts: AccountIdDto[];

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
} 