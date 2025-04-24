import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        
        if (!user) {
            throw new UnauthorizedException('El usuario no existe en el sistema');
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('La contraseña proporcionada es incorrecta');
        }
        
        const { hashedPassword, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            token: this.jwtService.sign(payload),
        };
    }
} 