import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PaginatedResponseSortEnum } from '../interfaces/paginated-response.interface';
import { User } from '../schema/user.schema';

export class QueryUserDto extends PartialType(User) {
  @ApiProperty({
    default: 20,
    description: `Number of users to return`,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    default: 1,
    description: `Current page of users`,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({
    default: PaginatedResponseSortEnum.ASC,
    description: `Sort order. Desc/Newest = -1, Asc/Oldest = 1`,
    enum: PaginatedResponseSortEnum,
    required: false,
  })
  @IsEnum(PaginatedResponseSortEnum)
  @IsOptional()
  @Type(() => Number)
  sort: PaginatedResponseSortEnum;

  @ApiProperty({
    default: 'createdAt',
    description: `User field to sort by`,
    required: false,
  })
  @IsOptional()
  sortBy: string;

  constructor(args?: Partial<QueryUserDto>) {
    super();
    this.limit = 20;
    this.page = 1;
    this.sort = PaginatedResponseSortEnum.ASC;
    this.sortBy = 'createdAt';
    Object.assign(this, args);
  }
}
