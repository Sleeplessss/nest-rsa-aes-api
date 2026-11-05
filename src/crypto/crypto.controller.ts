import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse, AppException, ErrorCode, ok } from '../common/api-response';
import { CryptoService } from './crypto.service';
import {
  DecryptDataDto,
  DecryptRequestDto,
  DecryptResponseDto,
  EncryptDataDto,
  EncryptRequestDto,
  EncryptResponseDto,
  ErrorResponseDto,
} from './dto/crypto.dto';

@ApiTags('crypto')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Encrypt payload: data2 = AES(payload), data1 = RSA-private(AES key)' })
  @ApiOkResponse({ type: EncryptResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  getEncryptData(@Body() body: EncryptRequestDto): ApiResponse<EncryptDataDto> {
    try {
      return ok(this.cryptoService.encrypt(body.payload));
    } catch {
      throw new AppException(ErrorCode.ENCRYPT_FAILED, 500);
    }
  }

  @Post('get-decrypt-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Decrypt: AES key = RSA-public(data1), payload = AES(data2)' })
  @ApiOkResponse({ type: DecryptResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  getDecryptData(@Body() body: DecryptRequestDto): ApiResponse<DecryptDataDto> {
    try {
      return ok(this.cryptoService.decrypt(body.data1, body.data2));
    } catch {
      throw new AppException(ErrorCode.DECRYPT_FAILED, 400);
    }
  }
}
