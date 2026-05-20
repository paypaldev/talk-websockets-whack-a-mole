export interface SwagCatalogItem {
  id: string
  title: string
  description: string
  imageSrc: string
  amountCents: number
  currency: 'USD'
}

export const swagCatalog: ReadonlyArray<SwagCatalogItem> = [
  {
    id: 'paypal-swag-notebook',
    title: 'PayPal Notebook',
    description:
      'A sleek, pocket-sized notebook with a pixel art cover featuring PayPal\'s iconic blue and green colors.',
    imageSrc: '/paypal-swag1.png',
    amountCents: 1999,
    currency: 'USD',
  },
  {
    id: 'paypal-swag-hoodie',
    title: 'PayPal Hoodie',
    description:
      'A comfortable hoodie featuring PayPal\'s branding and colors, perfect for casual wear.',
    imageSrc: '/paypal-swag2.png',
    amountCents: 4999,
    currency: 'USD',
  },
  {
    id: 'paypal-swag-cap',
    title: 'PayPal Cap',
    description:
      'A stylish cap with PayPal\'s logo embroidered on the front, available in various colors.',
    imageSrc: '/paypal-swag3.png',
    amountCents: 2499,
    currency: 'USD',
  },
]

export function findSwagCatalogItem(itemId: string): SwagCatalogItem | null {
  return swagCatalog.find(item => item.id === itemId) ?? null
}
