import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { IAppConfig } from 'config/app.config';
import { IMongoConfig } from 'config/mongo.config';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadUsersResponseDto } from './dto/upload-users-response.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService<
      IAppConfig & IMongoConfig,
      true
    >,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(data: CreateUserDto) {
    const user = await this.userModel.findOne({ email: data.email }).exec();

    if (user)
      throw new BadRequestException(
        'There is already a user with that email address',
      );

    const newUser = await new this.userModel(data).save();

    return newUser;
  }

  async updateUser(id: Types.ObjectId, data: UpdateUserDto) {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, {
        new: true,
        runValidators: true,
        lean: true,
      })
      .exec();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async deleteUser(id: Types.ObjectId) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        {
          new: true,
          lean: true,
        },
      )
      .exec();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async listUsers(query: QueryUserDto) {
    const { limit, page, sort, sortBy, ...rest } = query;

    const result = await this.userModel
      .aggregate([
        {
          $match: {
            isDeleted: false,
            ...rest,
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
        {
          $facet: {
            data: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              { $sort: { [sortBy]: sort } },
            ],
          },
        },
      ])
      .exec();

    const response = new PaginatedResponseDto<User>({
      ...result[0],
      limit,
      page,
      sort,
      sortBy,
    });

    return response;
  }

  async uploadUsers(users: User[]) {
    let failedCount = 0,
      successCount = 0;

    try {
      const result = await this.userModel.bulkWrite(
        users.map((user) => ({
          insertOne: {
            document: user,
          },
        })),
        {
          ordered: false,
        },
      );

      successCount = result.insertedCount;
    } catch (error) {
      successCount = error.result.insertedCount;
      failedCount = error.writeErrors.length;
    }

    return new UploadUsersResponseDto({
      failedCount,
      successCount,
    });
  }
}
