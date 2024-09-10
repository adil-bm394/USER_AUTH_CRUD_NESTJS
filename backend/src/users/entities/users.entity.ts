import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
