import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from '../../entities/commission.entity';
import { CommissionStatus } from '../../entities/commission.entity';
import { Account } from 'src/entities/account.entity';
import { CommissionResponseDto } from './dto/commission-response.dto';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
  ) { }

  async getById(id: string): Promise<Commission | null> {
    return this.commissionRepository.findOne({ where: { id, status: CommissionStatus.ENABLED } });
  }

  async getByAccount(account: Account): Promise<CommissionResponseDto[]> {
    const commissions = await this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.beneficiary', 'beneficiary')
      .leftJoinAndSelect('beneficiary.user', 'user')
      .where('commission.beneficiaryId = :beneficiaryId', { beneficiaryId: account.id })
      .andWhere('commission.status = :status', { status: CommissionStatus.ENABLED })
      .getMany();

    return commissions.map(commission => ({
      id: commission.id,
      amount: commission.amount,
      currency: commission.currency,
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
      user: {
        id: commission.beneficiary.user.id,
        firstName: commission.beneficiary.user.firstName,
        lastName: commission.beneficiary.user.lastName,
        email: commission.beneficiary.user.email
      }
    }));
  }

  async getAll(): Promise<Commission[]> {
    return this.commissionRepository.find({ where: { status: CommissionStatus.ENABLED } });
  }

  async create(commissionData: Partial<Commission>): Promise<Commission> {
    const commission = this.commissionRepository.create(commissionData);
    return this.commissionRepository.save(commission);
  }
} 