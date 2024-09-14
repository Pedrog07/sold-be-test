import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import { nullishValueTransform } from 'src/utils';

export type UserDocument = User & Document;

export const USERS_COLLECTION = 'users';

@Schema({
  collection: USERS_COLLECTION,
  timestamps: true,
})
export class User {
  @ApiResponseProperty()
  _id: Types.ObjectId;

  @Prop({ type: Number, select: false })
  __v: number;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;

  @ApiProperty({
    description: `User's birthdate`,
    example: new Date().toISOString(),
    required: true,
  })
  @Prop({ type: Date, required: true })
  @IsDateString()
  @IsNotEmpty()
  @Transform(nullishValueTransform)
  birthDate: Date;

  @ApiProperty({
    description: `User's email address`,
    example: 'johnsmith@nestjs.com',
    required: true,
  })
  @Prop({ required: true, unique: true })
  @IsEmail()
  @IsNotEmpty()
  @Transform(nullishValueTransform)
  email: string;

  @ApiProperty({
    description: `User's first name`,
    example: 'John',
    required: true,
  })
  @Prop({ required: true })
  @IsNotEmpty()
  @Transform(nullishValueTransform)
  firstName: string;

  @ApiProperty({
    description: `User's last name`,
    example: 'Smith',
    required: true,
  })
  @Prop({ required: true })
  @IsNotEmpty()
  @Transform(nullishValueTransform)
  lastName: string;

  @ApiProperty({ description: `User's phone number`, required: true })
  @Prop({ required: true })
  @IsPhoneNumber()
  @IsNotEmpty()
  @Transform(nullishValueTransform)
  phone: string;

  @ApiProperty({ description: `User's provider`, required: false })
  @Prop({ default: 'UNKNOWN' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(nullishValueTransform)
  marketingSource: string;

  @ApiProperty({
    description: `User's status`,
    example: 'DQL',
    required: false,
  })
  @Prop({ index: true, default: 'UNKNOWN' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Transform(nullishValueTransform)
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  constructor(args?: Partial<User>) {
    Object.assign(this, args);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
