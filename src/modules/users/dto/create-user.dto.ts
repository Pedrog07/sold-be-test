import { User } from '../schema/user.schema';

export class CreateUserDto extends User {
  constructor(args?: Partial<CreateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
