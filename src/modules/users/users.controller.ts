import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ApiOkResponsePaginated } from 'src/decorators/api-ok-response-paginated.decorator';
import { GenericExceptionFilter } from 'src/filters/generic-exception.filter';
import { ParseMongoObjectIdPipe } from 'src/pipes/parse-mongo-object-id.pipe';
import { CsvParser } from 'src/providers/csv-parser.provider';
import { mapObjectProperties } from 'src/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserParamsDto } from './dto/delete-user.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto, UpdateUserParamsDto } from './dto/update-user.dto';
import { UploadUsersResponseDto } from './dto/upload-users-response.dto';
import { UsersInterceptor } from './interceptors/users.interceptor';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';

@ApiTags('Users API')
@Controller('users')
@UseInterceptors(UsersInterceptor)
@UseFilters(new GenericExceptionFilter())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  @ApiOperation({ summary: `Create a new user` })
  @ApiOkResponse({ type: User })
  async postUsers(@Body() body: CreateUserDto): Promise<User> {
    return await this.usersService.createUser({ ...body, status: '' });
  }

  @Get('/')
  @ApiOperation({ summary: `Return a list of users` })
  @ApiOkResponsePaginated(User)
  async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedResponseDto<User>> {
    return await this.usersService.listUsers(query);
  }

  @Patch('/:id')
  @ApiOperation({ summary: `Update a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async patchUser(
    @Param(ParseMongoObjectIdPipe) params: UpdateUserParamsDto,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.updateUser(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: `Soft delete a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async deleteUser(
    @Param(ParseMongoObjectIdPipe)
    params: DeleteUserParamsDto,
  ): Promise<User> {
    return this.usersService.deleteUser(params.id);
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // Allow only CSV mimetypes
      fileFilter: (req, file, callback) => {
        if (!file.mimetype?.match(/text\/csv/i)) {
          return callback(null, false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ type: UploadUsersResponseDto })
  async uploadUsers(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadUsersResponseDto> {
    if (!file) {
      throw new UnprocessableEntityException(
        'Uploaded file is not a CSV file.',
      );
    }

    const users = await CsvParser.parse(file.path);

    const mappedUsers = users.map((item) =>
      mapObjectProperties<any, User>(
        item,
        {
          firstname: 'firstName',
          lastname: 'lastName',
          email: 'email',
          phone: 'phone',
          status: 'status',
          provider: 'marketingSource',
          birth_date: 'birthDate',
        },
        true,
      ),
    );

    return await this.usersService.uploadUsers(mappedUsers);
  }
}
