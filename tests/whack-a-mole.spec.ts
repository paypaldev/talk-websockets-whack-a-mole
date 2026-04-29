import { test, expect, type Page } from '@playwright/test'

type Strategy = 'hit-all' | 'miss-all' | 'hit-half'

async function enterNameAndStart(page: Page): Promise<void> {
  await page.goto('/')
  await page.getByLabel(/player name/i).fill('Playwright Tester')
  await page.getByRole('button', { name: /continue to game/i }).click()
}

async function getBoardSnapshot(
  page: Page
): Promise<{ moleIndex: number; emptyIndex: number; moleLabel: string }> {
  return page.locator('.grid.grid-cols-3 button').evaluateAll(buttons => {
    const labels = buttons.map(b => b.getAttribute('aria-label') ?? '')
    const moleIndex = labels.findIndex(l => l.startsWith('Whack'))
    return {
      moleIndex,
      emptyIndex: labels.findIndex(l => l === 'Empty hole'),
      moleLabel: moleIndex === -1 ? '' : labels[moleIndex],
    }
  })
}

async function playGame(page: Page, strategy: Strategy): Promise<void> {
  await enterNameAndStart(page)
  await page.getByRole('button', { name: /start game/i }).click()

  const holes = page.locator('.grid.grid-cols-3 button')
  let hitNext = true
  let actedOnCurrentMole = false

  while (!(await page.getByText(/Time's Up!?/).isVisible())) {
    const { moleIndex, emptyIndex, moleLabel } = await getBoardSnapshot(page)

    if (moleIndex === -1) {
      actedOnCurrentMole = false
      await page.waitForTimeout(60)
      continue
    }

    if (actedOnCurrentMole) {
      await page.waitForTimeout(60)
      continue
    }

    let shouldHit = false
    if (strategy === 'hit-all') shouldHit = true
    if (strategy === 'miss-all') shouldHit = false
    if (strategy === 'hit-half') {
      // PayPal moles are 10 points; always miss them to keep accuracy near 50%.
      if (moleLabel.includes('PayPal')) {
        shouldHit = false
      } else {
        shouldHit = hitNext
        hitNext = !hitNext
      }
    }

    const targetIndex = shouldHit ? moleIndex : emptyIndex
    if (targetIndex !== -1) {
      await holes.nth(targetIndex).click({ timeout: 400 }).catch(() => {})
      actedOnCurrentMole = true
    }

    await page.waitForTimeout(60)
  }
}

async function getStats(page: Page): Promise<{ hits: number; misses: number; accuracy: number }> {
  const valueOf = async (label: string) => {
    const text = await page
      .locator('span', { hasText: new RegExp(`^${label}$`) })
      .locator('..')
      .locator('span')
      .first()
      .textContent()
    return parseInt(text ?? '0', 10)
  }

  return {
    hits: await valueOf('Hits'),
    misses: await valueOf('Misses'),
    accuracy: await valueOf('Accuracy'),
  }
}

test.describe('Whack-a-Mole game outcomes', () => {
  test.setTimeout(70_000)

  test('direct /game visit without a stored name redirects to landing page', async ({ page }) => {
    await page.goto('/game')
    await page.waitForURL('**/')
    await expect(page).toHaveURL('/')
    await expect(page.getByLabel(/player name/i)).toBeVisible()
  })

  test('hit every mole → 100% accuracy and 0 misses', async ({ page }) => {
    await playGame(page, 'hit-all')
    const { misses, accuracy } = await getStats(page)
    expect(misses).toBe(0)
    expect(accuracy).toBe(100)
  })

  test('hit ~50% of moles → accuracy between 40–60%', async ({ page }) => {
    await playGame(page, 'hit-half')
    const { hits, misses, accuracy } = await getStats(page)
    expect(hits).toBeGreaterThan(0)
    expect(misses).toBeGreaterThan(0)
    expect(accuracy).toBeGreaterThanOrEqual(40)
    expect(accuracy).toBeLessThanOrEqual(60)
  })

  test('miss every mole → 0 hits and 0% accuracy', async ({ page }) => {
    await playGame(page, 'miss-all')
    const { hits, accuracy } = await getStats(page)
    expect(hits).toBe(0)
    expect(accuracy).toBe(0)
  })

  test('no interaction → game finishes on its own with 0 hits and 0 misses', async ({ page }) => {
    await enterNameAndStart(page)
    await page.getByRole('button', { name: /start game/i }).click()
    await expect(page.getByText(/Time's Up!?/)).toBeVisible({ timeout: 40_000 })
    const { hits, misses } = await getStats(page)
    expect(hits).toBe(0)
    expect(misses).toBe(0)
  })
})
