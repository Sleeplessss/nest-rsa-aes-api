import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty({ description: 'Text to encrypt (0 - 2000 characters)', minLength: 0, maxLength: 2000, example: 'Hello world' })
  @IsDefined({ message: 'payload is required' })
  @IsString({ message: 'payload must be a string' })
  @MaxLength(2000, { message: 'payload must not exceed 2000 characters' })
  payload!: string;
}

export class DecryptRequestDto {
  @ApiProperty({ description: 'AES key encrypted with RSA private key (base64)' })
  @IsDefined({ message: 'data1 is required' })
  @IsString({ message: 'data1 must be a string' })
  @IsNotEmpty({ message: 'data1 must not be empty' })
  data1!: string;

  @ApiProperty({ description: 'Payload encrypted with AES key (base64)' })
  @IsDefined({ message: 'data2 is required' })
  @IsString({ message: 'data2 must be a string' })
  @IsNotEmpty({ message: 'data2 must not be empty' })
  data2!: string;
}

export class EncryptDataDto {
  @ApiProperty() data1!: string;
  @ApiProperty() data2!: string;
}

export class DecryptDataDto {
  @ApiProperty() payload!: string;
}

export class EncryptResponseDto {
  @ApiProperty({ example: true }) successful!: boolean;
  @ApiProperty({ example: '' }) error_code!: string;
  @ApiProperty({ type: EncryptDataDto, nullable: true }) data!: EncryptDataDto | null;
}

export class DecryptResponseDto {
  @ApiProperty({ example: true }) successful!: boolean;
  @ApiProperty({ example: '' }) error_code!: string;
  @ApiProperty({ type: DecryptDataDto, nullable: true }) data!: DecryptDataDto | null;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false }) successful!: boolean;
  @ApiProperty({ example: 'VALIDATION_ERROR' }) error_code!: string;
  @ApiProperty({ type: Object, nullable: true, example: null }) data!: null;
}
