import {  IsNotEmpty, IsString } from "class-validator";


export class UpdateDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;


  @IsNotEmpty()
  @IsString()
  readonly address: string;

}