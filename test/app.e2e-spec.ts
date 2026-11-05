import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /api-docs serves Swagger with both APIs', async () => {
    await request(app.getHttpServer()).get('/api-docs').expect(200);
    const res = await request(app.getHttpServer()).get('/api-docs-json').expect(200);
    expect(Object.keys(res.body.paths)).toEqual(expect.arrayContaining(['/get-encrypt-data', '/get-decrypt-data']));
  });

  it('encrypt -> decrypt round trip', async () => {
    const payload = 'Hello NestJS ภาษาไทย';
    const enc = await request(app.getHttpServer()).post('/get-encrypt-data').send({ payload }).expect(200);
    expect(enc.body.successful).toBe(true);
    expect(enc.body.error_code).toBe('');
    const { data1, data2 } = enc.body.data;

    const dec = await request(app.getHttpServer()).post('/get-decrypt-data').send({ data1, data2 }).expect(200);
    expect(dec.body).toEqual({ successful: true, error_code: '', data: { payload } });
  });

  it.each([
    [{}],
    [{ payload: 123 }],
    [{ payload: 'x'.repeat(2001) }],
  ])('encrypt rejects invalid body %#', async (body) => {
    const res = await request(app.getHttpServer()).post('/get-encrypt-data').send(body).expect(400);
    expect(res.body).toEqual({ successful: false, error_code: 'VALIDATION_ERROR', data: null });
  });

  it('encrypt accepts empty string and 2000 chars', async () => {
    for (const payload of ['', 'x'.repeat(2000)]) {
      const res = await request(app.getHttpServer()).post('/get-encrypt-data').send({ payload }).expect(200);
      expect(res.body.successful).toBe(true);
    }
  });

  it('decrypt rejects missing fields', async () => {
    const res = await request(app.getHttpServer()).post('/get-decrypt-data').send({ data1: 'abc' }).expect(400);
    expect(res.body).toEqual({ successful: false, error_code: 'VALIDATION_ERROR', data: null });
  });

  it('decrypt returns DECRYPT_FAILED for invalid cipher text', async () => {
    const res = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({ data1: 'invalid', data2: 'invalid' })
      .expect(400);
    expect(res.body).toEqual({ successful: false, error_code: 'DECRYPT_FAILED', data: null });
  });
});
