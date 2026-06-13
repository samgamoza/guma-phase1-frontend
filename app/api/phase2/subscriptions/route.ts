import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

/**
 * GET /api/phase2/subscriptions
 * Get user's current subscription
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_tiers(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user not subscribed)
      throw error
    }

    return NextResponse.json(subscription || { subscribed: false })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/phase2/subscriptions/checkout
 * Create Stripe checkout session
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { tierId, billingCycle } = body // 'monthly' or 'yearly'

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .single()

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    // Create Stripe checkout
    const price = billingCycle === 'yearly' ? tier.price_yearly : tier.price_monthly
    const interval = billingCycle === 'yearly' ? 'year' : 'month'

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.name} Plan`,
              description: `${tier.features?.join(', ')}`,
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
      metadata: {
        userId: user.id,
        tierId,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: `https://checkout.stripe.com/pay/${session.id}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/phase2/subscriptions/cancel
 * Cancel user's subscription
 */
export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    // Cancel via Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

    // Update in DB
    await supabase
      .from('user_subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled',
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
