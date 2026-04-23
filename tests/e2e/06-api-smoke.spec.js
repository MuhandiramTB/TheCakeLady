import { test, expect, request as pwrequest } from '@playwright/test';
import { API_BASE, apiLoginAdmin, ADMIN, uniqueEmail, uniquePhone } from './helpers.js';

test.describe('API smoke tests', () => {
  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.status).toBe('ok');
  });

  test('GET /categories returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/categories`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  test('GET /products returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/products`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  test('GET /config/branding returns branding data', async ({ request }) => {
    const res = await request.get(`${API_BASE}/config/branding`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.salonName).toBeTruthy();
  });

  test('GET /store-info returns store info', async ({ request }) => {
    const res = await request.get(`${API_BASE}/store-info`);
    expect(res.ok()).toBeTruthy();
  });

  test('admin login returns token', async ({ request }) => {
    const token = await apiLoginAdmin(request);
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);
  });

  test('protected endpoint rejects unauthenticated', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/stats`);
    expect(res.status()).toBe(401);
  });

  test('admin stats endpoint works with token', async ({ request }) => {
    const token = await apiLoginAdmin(request);
    const res = await request.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data).toHaveProperty('customers');
    expect(json.data).toHaveProperty('orders');
  });

  test('customer register + login round-trip', async ({ request }) => {
    const email = uniqueEmail();
    const phone = uniquePhone();
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'API Test', email, phone, password: 'password123' },
    });
    expect(regRes.ok()).toBeTruthy();

    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: 'password123' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const json = await loginRes.json();
    expect(json.data.token).toBeTruthy();
  });

  test('duplicate registration returns error', async ({ request }) => {
    const email = uniqueEmail();
    const phone = uniquePhone();
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'Dup', email, phone, password: 'password123' },
    });
    const res2 = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'Dup', email, phone: uniquePhone(), password: 'password123' },
    });
    expect(res2.ok()).toBeFalsy();
  });

  test('create order requires auth', async ({ request }) => {
    const res = await request.post(`${API_BASE}/orders`, {
      data: { productId: 1, totalPrice: 1000, deliveryDate: '2030-01-01' },
    });
    expect(res.status()).toBe(401);
  });
});
