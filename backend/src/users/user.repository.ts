// import { EntityRepository, Repository } from 'typeorm';
// import { Injectable } from '@nestjs/common';
// import { User } from './users.entity';

// @EntityRepository(User)
// @Injectable()
// export class UserRepository extends Repository<User> {}

// src/users/user.repository.ts

import { DataSource, Repository } from 'typeorm';
import { User } from './users.entity';

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  
}
