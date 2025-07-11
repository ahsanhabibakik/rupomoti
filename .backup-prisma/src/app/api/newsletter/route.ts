import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const subscribeSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

function getWelcomeEmailHTML(email: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="font-size: 24px; color: #1a202c; text-align: center;">Welcome to Rupomoti!</h1>
        <p style="text-align: center;">
          <img src="https://i.ibb.co/C5fQkBC/logo.png" alt="Rupomoti Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;" />
        </p>
        <p>Hello ${email},</p>
        <p>Thank you for subscribing to our newsletter. We're thrilled to have you join our community of pearl lovers.</p>
        <p>You'll be the first to know about our new arrivals, exclusive offers, and the latest news from the world of authentic pearls.</p>
        <p>As a token of our appreciation, please enjoy <strong>10% off</strong> your first order with the code: <strong>PEARL10</strong>.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" style="background-color: #8a6c4a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
        </div>
        <p>Stay radiant,</p>
        <p><strong>The Rupomoti Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">
          If you no longer wish to receive these emails, you can <a href="${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #777; text-decoration: underline;">unsubscribe here</a>.
        </p>
        <p style="font-size: 12px; color: #777; text-align: center;">Rupomoti Jewellers, Dhaka, Bangladesh</p>
      </div>
    </div>
  `
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Invalid input.',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const existingSubscriber = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'This email is already subscribed.' },
        { status: 409 }
      )
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    })

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to the Rupomoti Newsletter!',
        html: getWelcomeEmailHTML(email),
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't block the user's subscription if the email fails.
      // Log the error for monitoring.
    }

    return NextResponse.json(
      { message: 'Thank you for subscribing! A welcome email is on its way.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
} 