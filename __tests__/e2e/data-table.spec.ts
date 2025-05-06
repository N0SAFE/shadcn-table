import { test, expect } from '@playwright/test';

test.describe('DataTable E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example');
    await expect(page.locator('table')).toBeVisible();
  });

  test('renders all columns and rows', async ({ page }) => {
    const headers = await page.locator('table thead th').allTextContents();
    expect(headers).toContain('Task');
    expect(headers).toContain('Title');
    expect(headers).toContain('Status');
    expect(headers).toContain('Priority');
    expect(headers).toContain('Archived');
    expect(headers).toContain('Created At');
    // At least one row
    await expect(page.locator('table tbody tr')).toHaveCountGreaterThan(0);
  });

  test('can sort by status and priority', async ({ page }) => {
    // Click status header to sort
    await page.getByRole('columnheader', { name: /status/i }).click();
    // Check that rows are sorted (basic check: first row changes)
    const firstStatus = await page.locator('table tbody tr td').nth(2).textContent();
    await page.getByRole('columnheader', { name: /status/i }).click();
    const newFirstStatus = await page.locator('table tbody tr td').nth(2).textContent();
    expect(firstStatus).not.toBe(newFirstStatus);
  });

  test('can filter by status', async ({ page }) => {
    // Open filter (assume a filter button exists)
    await page.getByPlaceholder('Select status...').click();
    // Select a status (e.g., "done")
    await page.getByRole('option', { name: /done/i }).click();
    // Assert only rows with status "done" are visible
    const statuses = await page.locator('table tbody tr td').nth(2).allTextContents();
    expect(statuses.every((s) => /done/i.test(s))).toBeTruthy();
  });

  test('can paginate table', async ({ page }) => {
    // Assume pagination controls exist (e.g., next page button)
    const nextBtn = page.getByRole('button', { name: /next/i });
    if (await nextBtn.isVisible()) {
      const firstRowBefore = await page.locator('table tbody tr').first().textContent();
      await nextBtn.click();
      await page.waitForTimeout(500); // Wait for page change
      const firstRowAfter = await page.locator('table tbody tr').first().textContent();
      expect(firstRowBefore).not.toBe(firstRowAfter);
    }
  });

  test('can select rows and use toolbar actions', async ({ page }) => {
    // Select first row
    await page.locator('table tbody tr input[type="checkbox"]').first().check();
    // Toolbar should appear (e.g., delete, export, etc.)
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
    // Click export (simulate CSV export)
    await page.getByRole('button', { name: /export/i }).click();
    // Toast or download should be triggered (simulate by checking for toast)
    await expect(page.locator('[role="status"]')).toContainText(/exported|csv/i);
  });

  test('can select all rows', async ({ page }) => {
    // Select all
    await page.locator('thead input[type="checkbox"]').check();
    // All rows should be selected
    const allChecked = await page.locator('tbody input[type="checkbox"]').evaluateAll((els) => els.every((el) => el.checked));
    expect(allChecked).toBeTruthy();
  });

  test('can use floating bar and advanced toolbar', async ({ page }) => {
    // If floating bar is enabled, it should appear when rows are selected
    await page.locator('table tbody tr input[type="checkbox"]').first().check();
    // Floating bar actions (e.g., tag, archive, favorite)
    await expect(page.getByRole('button', { name: /archive/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /favorite/i })).toBeVisible();
    // Advanced toolbar: filter, search, etc.
    await expect(page.getByPlaceholder('Search by title...')).toBeVisible();
  });

  test('can delete a row', async ({ page }) => {
    // Select first row
    await page.locator('table tbody tr input[type="checkbox"]').first().check();
    // Click delete
    await page.getByRole('button', { name: /delete/i }).click();
    // Confirm deletion (if dialog appears)
    const confirmBtn = page.getByRole('button', { name: /confirm|delete/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    // Toast or row disappears
    await expect(page.locator('[role="status"]')).toContainText(/deleted/i);
  });

  test('can update status and priority via toolbar', async ({ page }) => {
    // Select first row
    await page.locator('table tbody tr input[type="checkbox"]').first().check();
    // Update status
    await page.getByRole('button', { name: /update status/i }).click();
    await page.getByRole('option', { name: /in-progress/i }).click();
    await expect(page.locator('[role="status"]')).toContainText(/updated/i);
    // Update priority
    await page.getByRole('button', { name: /update priority/i }).click();
    await page.getByRole('option', { name: /high/i }).click();
    await expect(page.locator('[role="status"]')).toContainText(/updated/i);
  });

  test('can add a tag to selected tasks', async ({ page }) => {
    // Select first row
    await page.locator('table tbody tr input[type="checkbox"]').first().check();
    // Open tag action (button with Tag icon)
    await page.getByRole('button', { name: /add tags/i }).click();
    // Enter tag and apply
    await page.getByPlaceholder('Enter tag name...').fill('Urgent');
    await page.getByRole('button', { name: /apply/i }).click();
    await expect(page.locator('[role="status"]')).toContainText(/tag/i);
  });

  test('can reorder rows if enabled', async ({ page }) => {
    // Enable row reordering
    await page.getByLabel('Toggle row reordering').check();
    // Drag and drop first row to second position (simulate if possible)
    // Playwright drag-and-drop API
    const firstRow = page.locator('tbody tr').first();
    const secondRow = page.locator('tbody tr').nth(1);
    if (await firstRow.isVisible() && await secondRow.isVisible()) {
      await firstRow.dragTo(secondRow);
      // Toast should appear
      await expect(page.locator('[role="status"]')).toContainText(/reordered/i);
    }
  });
});
