/**
 * Push Notification API Route
 *
 * Handles sending push notifications to subscribed users.
 * POST /api/notifications - Send a notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification, isPushConfigured, type PushSubscriptionData } from '@/lib/push-server';

interface SendNotificationRequest {
  subscription: PushSubscriptionData;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function POST(request: NextRequest) {
  // Check if push is configured
  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    );
  }

  try {
    const body: SendNotificationRequest = await request.json();

    // Validate request
    if (!body.subscription?.endpoint || !body.subscription?.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Send the notification
    await sendPushNotification(body.subscription, {
      title: body.title,
      body: body.body,
      url: body.url ?? '/',
      tag: body.tag,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to send notification:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'SUBSCRIPTION_EXPIRED') {
        return NextResponse.json(
          { error: 'Subscription expired', code: 'SUBSCRIPTION_EXPIRED' },
          { status: 410 }
        );
      }
      if (error.message === 'RATE_LIMITED') {
        return NextResponse.json(
          { error: 'Rate limited', code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    configured: isPushConfigured(),
    status: 'ok',
  });
}
