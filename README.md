# nest-rsa-aes-api

NestJS HTTP service that encrypts and decrypts data with **hybrid encryption** (AES-256 + RSA). API docs are served by Swagger at `/api-docs`.

## How it works

| Endpoint | Steps |
|---|---|
| `POST /get-encrypt-data` | 1. Validate `payload` (string, required, 0–2000 chars)<br>2. Generate a random 32-char string as the AES key<br>3. `data2` = AES-256-CBC(payload, AES key), base64 of `iv + ciphertext`<br>4. `data1` = RSA **private key** encrypt(AES key), base64<br>5. Return `{ data1, data2 }` |
| `POST /get-decrypt-data` | 1. Validate `data1`, `data2` (string, required)<br>2. AES key = RSA **public key** decrypt(`data1`)<br>3. payload = AES decrypt(`data2`, AES key)<br>4. Return `{ payload }` |

Response format (every endpoint, including errors):

```json
{ "successful": true, "error_code": "", "data": { "data1": "...", "data2": "..." } }
{ "successful": false, "error_code": "VALIDATION_ERROR", "data": null }
```

Error codes: `VALIDATION_ERROR` (400), `DECRYPT_FAILED` (400), `ENCRYPT_FAILED` (500), `NOT_FOUND` (404), `INTERNAL_ERROR` (500).

## Requirements

- Node.js 18+ (tested on Node 24)
- npm

## How to start the service

```bash
npm install

# RSA keys: ./keys/private.pem and ./keys/public.pem
#  - The included keys were generated at https://cryptotools.net/rsagen (2048 bit),
#    so the project runs out of the box.
#  - To use your own: generate at https://cryptotools.net/rsagen and paste the
#    "Private Key" / "Public Key" into those two files (or run: npm run gen:keys)

npm run build
npm start              # production build  -> http://localhost:3000
# or
npm run start:dev      # run TypeScript directly with ts-node
```

Open Swagger: **http://localhost:3000/api-docs**

### Configuration (optional env vars)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `PRIVATE_KEY` | – | PEM private key (`\n` escaped allowed). Overrides `keys/private.pem` |
| `PUBLIC_KEY` | – | PEM public key. Overrides `keys/public.pem` |
| `KEYS_DIR` | `./keys` | Folder holding `private.pem` and `public.pem` |

## Tests

```bash
npm test          # unit tests (service + controller)
npm run test:cov  # unit tests with coverage
npm run test:e2e  # HTTP tests with supertest (Swagger, round trip, validation, errors)
```

## Example

```bash
curl -X POST http://localhost:3000/get-encrypt-data \
  -H "Content-Type: application/json" -d '{"payload":"hello world"}'

curl -X POST http://localhost:3000/get-decrypt-data \
  -H "Content-Type: application/json" -d '{"data1":"<data1>","data2":"<data2>"}'
```

## Project structure

```
src/
  main.ts                     bootstrap
  setup.ts                    ValidationPipe, exception filter, Swagger (/api-docs)
  app.module.ts
  common/
    api-response.ts           response helpers + error codes
    all-exceptions.filter.ts  maps every error to { successful:false, error_code, data:null }
  crypto/
    crypto.controller.ts      2 endpoints
    crypto.service.ts         AES + RSA logic
    dto/crypto.dto.ts         request/response DTOs (validation + Swagger)
    *.spec.ts                 unit tests
test/app.e2e-spec.ts          e2e tests
```

> The keys in `./keys` (from cryptotools.net/rsagen) are for demo only. Use your own keys and keep the private key out of source control in a real deployment.
