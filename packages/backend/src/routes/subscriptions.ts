import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const PLANS = {
  monthly: {
    price: 999, // $9.99
    productId: process.env.STRIPE_MONTHLY_PLAN_ID
  },
  yearly: {
    price: 9999, // $99.99
    productId: process.env.STRIPE_YEARLY_PLAN_ID
  }
};

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user!.userId;

    if (!PLANS[planId as keyof typeof PLANS]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.productId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium`,
      client_reference_id: userId,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          throw new Error('No user ID found in session');
        }

        // Update user and create subscription
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: true }
          }),
          prisma.subscription.create({
            data: {
              userId,
              planType: session.subscription as string,
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
          })
        ]);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          throw new Error('No user ID found in subscription');
        }

        // Update user and subscription status
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: false }
          }),
          prisma.subscription.updateMany({
            where: { userId, status: 'active' },
            data: { status: 'cancelled' }
          })
        ]);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router; 