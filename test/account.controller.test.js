// const request = require('supertest');
// const app = require('../app'); // Path ke aplikasi Express Anda
// const prisma = require('../config/prisma');
// const generateRandom = require('../utils/random');
// const Validator = require('fastest-validator');

// jest.mock('../config/prisma');
// jest.mock('../utils/random');

// const v = new Validator();

// describe('Account Controller', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   describe('GET /accounts', () => {
//     it('should return list of accounts', async () => {
//       const user = { id: 1 };
//       const accounts = [
//         {
//           id: 1,
//           bankName: 'Bank A',
//           accountNumber: '123456789012',
//           balance: 1000,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ];
      
//       prisma.account.findMany.mockResolvedValue(accounts);

//       const response = await request(app)
//         .get('/accounts')
//         .set('Authorization', 'Bearer valid_token'); // Sesuaikan jika Anda menggunakan middleware otentikasi

//       expect(response.status).toBe(200);
//       expect(response.body.status).toBe('success');
//       expect(response.body.data).toEqual(accounts);
//     });

//     it('should return 500 if there is an internal server error', async () => {
//       prisma.account.findMany.mockRejectedValue(new Error('Internal Server Error'));

//       const response = await request(app)
//         .get('/accounts')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(500);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toContain('Internal Server Error');
//     });
//   });

//   describe('POST /accounts', () => {
//     it('should create a new account', async () => {
//       const user = { id: 1 };
//       const newAccount = {
//         bankName: 'Bank A',
//         userId: 1,
//       };

//       generateRandom.mockReturnValue('123456789012');
//       prisma.account.findUnique.mockResolvedValue(null); // No existing account number
//       prisma.user.findUnique.mockResolvedValue({ id: 1 }); // User exists
//       prisma.account.create.mockResolvedValue({
//         ...newAccount,
//         id: 1,
//         balance: 0,
//       });

//       const response = await request(app)
//         .post('/accounts')
//         .send(newAccount)
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(201);
//       expect(response.body.status).toBe('success');
//       expect(response.body.message).toBe('Success Create Account');
//     });

//     it('should return 400 for validation errors', async () => {
//       const newAccount = {}; // Missing required fields

//       const response = await request(app)
//         .post('/accounts')
//         .send(newAccount)
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(400);
//       expect(response.body.status).toBe('error');
//     });

//     it('should return 400 if userId does not match', async () => {
//       const newAccount = {
//         bankName: 'Bank A',
//         userId: 2, // Invalid userId
//       };

//       const response = await request(app)
//         .post('/accounts')
//         .send(newAccount)
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(400);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toBe('Your userId not valid your own id');
//     });

//     it('should return 500 if there is an internal server error', async () => {
//       generateRandom.mockReturnValue('123456789012');
//       prisma.account.findUnique.mockResolvedValue(null);
//       prisma.user.findUnique.mockResolvedValue({ id: 1 });
//       prisma.account.create.mockRejectedValue(new Error('Internal Server Error'));

//       const response = await request(app)
//         .post('/accounts')
//         .send({ bankName: 'Bank A', userId: 1 })
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(500);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toContain('Internal Server Error');
//     });
//   });

//   describe('PUT /accounts/:id', () => {
//     it('should update an account', async () => {
//       const user = { id: 1 };
//       const updatedAccount = {
//         bankName: 'Bank B',
//       };

//       prisma.account.findFirst.mockResolvedValue({
//         id: 1,
//         bankName: 'Bank A',
//         userId: 1,
//       });
//       prisma.account.update.mockResolvedValue({
//         ...updatedAccount,
//         id: 1,
//         userId: 1,
//       });

//       const response = await request(app)
//         .put('/accounts/1')
//         .send(updatedAccount)
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(200);
//       expect(response.body.status).toBe('success');
//       expect(response.body.message).toBe('Sucess Update Account');
//     });

//     it('should return 400 if account does not belong to user', async () => {
//       prisma.account.findFirst.mockResolvedValue(null);

//       const response = await request(app)
//         .put('/accounts/1')
//         .send({ bankName: 'Bank B' })
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(404);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toBe('Account data not found');
//     });

//     it('should return 500 if there is an internal server error', async () => {
//       prisma.account.findFirst.mockResolvedValue({
//         id: 1,
//         bankName: 'Bank A',
//         userId: 1,
//       });
//       prisma.account.update.mockRejectedValue(new Error('Internal Server Error'));

//       const response = await request(app)
//         .put('/accounts/1')
//         .send({ bankName: 'Bank B' })
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(500);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toContain('Internal Server Error');
//     });
//   });

//   describe('GET /accounts/:id', () => {
//     it('should return account details', async () => {
//       const user = { id: 1 };
//       const account = {
//         id: 1,
//         bankName: 'Bank A',
//         accountNumber: '123456789012',
//         balance: 1000,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         user: {
//           id: 1,
//           name: 'John Doe',
//           username: 'john_doe',
//           phone: '1234567890',
//           address: '123 Main St',
//           dob: '1990-01-01T00:00:00.000Z',
//         },
//       };

//       prisma.account.findFirst.mockResolvedValue(account);

//       const response = await request(app)
//         .get('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(200);
//       expect(response.body.status).toBe('success');
//       expect(response.body.data).toEqual(account);
//     });

//     it('should return 404 if account is not found', async () => {
//       prisma.account.findFirst.mockResolvedValue(null);

//       const response = await request(app)
//         .get('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(404);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toBe('Account data not found');
//     });

//     it('should return 500 if there is an internal server error', async () => {
//       prisma.account.findFirst.mockRejectedValue(new Error('Internal Server Error'));

//       const response = await request(app)
//         .get('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(500);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toContain('Internal Server Error');
//     });
//   });

//   describe('DELETE /accounts/:id', () => {
//     it('should delete an account', async () => {
//       const user = { id: 1 };

//       prisma.account.findFirst.mockResolvedValue({
//         id: 1,
//         userId: 1,
//       });
//       prisma.account.delete.mockResolvedValue({ id: 1 });

//       const response = await request(app)
//         .delete('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(200);
//       expect(response.body.status).toBe('success');
//       expect(response.body.message).toBe('Success delete account');
//     });

//     it('should return 404 if account is not found', async () => {
//       prisma.account.findFirst.mockResolvedValue(null);

//       const response = await request(app)
//         .delete('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(404);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toBe('Account data not found');
//     });

//     it('should return 500 if there is an internal server error', async () => {
//       prisma.account.findFirst.mockResolvedValue({
//         id: 1,
//         userId: 1,
//       });
//       prisma.account.delete.mockRejectedValue(new Error('Internal Server Error'));

//       const response = await request(app)
//         .delete('/accounts/1')
//         .set('Authorization', 'Bearer valid_token');

//       expect(response.status).toBe(500);
//       expect(response.body.status).toBe('error');
//       expect(response.body.message).toContain('Internal Server Error');
//     });
//   });
// });
