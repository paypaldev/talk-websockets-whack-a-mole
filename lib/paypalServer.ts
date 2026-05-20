import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
  type OrderRequest,
} from '@paypal/paypal-server-sdk'

interface CreateOrderInput {
  amountCents: number
  currency: string
  description: string
  customId: string
}

const clientId = process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const clientSecret = process.env.PAYPAL_CLIENT_SECRET

if (!clientId) {
  throw new Error('PayPal client id is required.')
}

if (!clientSecret) {
  throw new Error('PayPal client secret is required.')
}

const environment = process.env.PAYPAL_ENVIRONMENT === 'live'
  ? Environment.Production
  : Environment.Sandbox

const paypalClient = new Client({
  environment,
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret,
  },
})

const ordersController = new OrdersController(paypalClient)

function formatAmountFromCents(amountCents: number): string {
  return (amountCents / 100).toFixed(2)
}

export async function createPayPalCheckoutOrder(input: CreateOrderInput): Promise<string> {
  const orderRequest: OrderRequest = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        customId: input.customId,
        amount: {
          currencyCode: input.currency,
          value: formatAmountFromCents(input.amountCents),
        },
        description: input.description,
      },
    ],
  }

  const response = await ordersController.createOrder({
    body: orderRequest,
    prefer: 'return=minimal',
  })

  const orderId = response.result.id

  if (!orderId) {
    throw new Error('Unable to create PayPal order.')
  }

  return orderId
}
