import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { MongoIdDto } from 'src/dto/mongo-id.dto';

@Injectable()
export class ParseMongoObjectIdPipe<Params extends MongoIdDto>
  implements PipeTransform
{
  transform(value: Params) {
    const validObjectId = Types.ObjectId.isValid(value.id);

    if (!validObjectId) {
      throw new BadRequestException('Invalid ObjectId');
    }

    return { ...value, id: new Types.ObjectId(value.id) };
  }
}
