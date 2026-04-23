export const ADMIN = {
  email: 'admin@thecakelady.com',
  password: 'cakelady@123',
};

export async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', ADMIN.email);
  await page.fill('input[name="password"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
}

export async function registerCustomer(page, { name, email, phone, password }) {
  await page.goto('/register');
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="phone"]', phone);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;
}

export function uniquePhone() {
  return `07${Date.now().toString().slice(-8)}`;
}

export const API_BASE = 'http://localhost:3000/api/v1';

export async function apiLoginAdmin(request) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email: ADMIN.email, password: ADMIN.password },
  });
  const json = await res.json();
  return json.data.token;
}
