import { PartialType } from '@nestjs/swagger';
import { MongoIdDto } from 'src/dto/mongo-id.dto';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserParamsDto extends MongoIdDto {}
