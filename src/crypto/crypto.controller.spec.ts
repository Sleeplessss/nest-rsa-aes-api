import { Test } from '@nestjs/testing';
import { AppException, ErrorCode } from '../common/api-response';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

describe('CryptoController', () => {
  let controller: CryptoController;
  const service = { encrypt: jest.fn(), decrypt: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [{ provide: CryptoService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CryptoController);
  });

  it('get-encrypt-data returns successful response', () => {
    service.encrypt.mockReturnValue({ data1: 'a', data2: 'b' });
    expect(controller.getEncryptData({ payload: 'hi' })).toEqual({
      successful: true,
      error_code: '',
      data: { data1: 'a', data2: 'b' },
    });
    expect(service.encrypt).toHaveBeenCalledWith('hi');
  });

  it('get-decrypt-data returns successful response', () => {
    service.decrypt.mockReturnValue({ payload: 'hi' });
    expect(controller.getDecryptData({ data1: 'a', data2: 'b' })).toEqual({
      successful: true,
      error_code: '',
      data: { payload: 'hi' },
    });
  });

  it('get-decrypt-data maps crypto errors to DECRYPT_FAILED', () => {
    service.decrypt.mockImplementation(() => {
      throw new Error('bad');
    });
    try {
      controller.getDecryptData({ data1: 'a', data2: 'b' });
      fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(AppException);
      expect((e as AppException).errorCode).toBe(ErrorCode.DECRYPT_FAILED);
    }
  });

  it('get-encrypt-data maps crypto errors to ENCRYPT_FAILED', () => {
    service.encrypt.mockImplementation(() => {
      throw new Error('bad');
    });
    expect(() => controller.getEncryptData({ payload: 'x' })).toThrow(AppException);
  });
});
