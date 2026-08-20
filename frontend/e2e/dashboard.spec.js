const { test, expect } = require('@playwright/test');

test.describe('Početna stranica', () => {
  test('prikazuje naslov, polje za pretragu i uputstvo', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('GITHUB ACTIVITY');
    await expect(page.getByPlaceholder(/Enter @username/)).toBeVisible();
    await expect(page.getByText(/Enter a GitHub username or owner\/repository/)).toBeVisible();
  });
});

test.describe('Pretraga korisnika', () => {
  test('uspešna pretraga vodi na /user/ i prikazuje profil', async ({ page }) => {
    // Mokujemo backend — test ne zavisi od GitHub-a ni od Render-a
    await page.route('**/api/search/repositories', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          login: 'torvalds',
          avatar_url: 'https://example.com/avatar.png',
          public_repos: 0,
          followers: 100,
          following: 0,
          repos_list: [],
        }),
      })
    );

    await page.goto('/');
    await page.getByPlaceholder(/Enter @username/).fill('@torvalds');
    await page.getByRole('button', { name: 'Go' }).click();

    await expect(page).toHaveURL(/\/user\/torvalds$/);
    await expect(page.getByText(/no public repositories to display/)).toBeVisible();
  });

  test('nepostojeći korisnik prikazuje poruku User Not Found', async ({ page }) => {
    await page.route('**/api/search/repositories', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) })
    );

    await page.goto('/');
    await page.getByPlaceholder(/Enter @username/).fill('nepostojeci-korisnik-123');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'User Not Found' })).toBeVisible();

    await page.getByRole('button', { name: 'Back to Search' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('unos owner/repo vodi na /repo/ rutu', async ({ page }) => {
    await page.route('**/api/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );

    await page.goto('/');
    await page.getByPlaceholder(/Enter @username/).fill('facebook/react');
    await page.getByRole('button', { name: 'Go' }).click();

    await expect(page).toHaveURL(/\/repo\/facebook\/react$/);
  });
});

test.describe('Prijava', () => {
  test('uspešan login vraća na početnu sa porukom dobrodošlice', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ role: 'user', username: 'una', user_id: 1 }),
      })
    );

    await page.goto('/auth');
    await page.getByPlaceholder('Username').fill('una');
    await page.getByPlaceholder('Password').fill('tajna');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Welcome back! Explore your favorite repositories/)).toBeVisible();
  });

  test('pogrešna lozinka prikazuje grešku', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid credentials' }) })
    );

    await page.goto('/auth');
    await page.getByPlaceholder('Username').fill('una');
    await page.getByPlaceholder('Password').fill('pogresna');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Error: Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/auth$/);
  });
});