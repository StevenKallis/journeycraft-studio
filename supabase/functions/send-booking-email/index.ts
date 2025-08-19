import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  type: 'package' | 'ticket';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  bookingDetails: {
    title: string;
    price: number;
    currency?: string;
    // Package specific
    duration?: string;
    location?: string;
    maxGuests?: number;
    // Ticket specific
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    airline?: string;
    flightClass?: string;
    availableSeats?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      customerName,
      customerEmail,
      customerPhone,
      message,
      bookingDetails
    }: BookingRequest = await req.json();

    console.log("Processing booking request:", { type, customerName, customerEmail });

    // Create different email content based on type
    const isPackage = type === 'package';
    const subject = isPackage 
      ? `New Travel Package Booking Request - ${bookingDetails.title}`
      : `New Air Ticket Booking Request - ${bookingDetails.origin} to ${bookingDetails.destination}`;

    const detailsHtml = isPackage ? `
      <h3>Package Details:</h3>
      <ul>
        <li><strong>Package:</strong> ${bookingDetails.title}</li>
        <li><strong>Price:</strong> $${bookingDetails.price}</li>
        <li><strong>Duration:</strong> ${bookingDetails.duration || 'N/A'}</li>
        <li><strong>Location:</strong> ${bookingDetails.location || 'N/A'}</li>
        <li><strong>Max Guests:</strong> ${bookingDetails.maxGuests || 'N/A'}</li>
      </ul>
    ` : `
      <h3>Flight Details:</h3>
      <ul>
        <li><strong>Route:</strong> ${bookingDetails.origin} → ${bookingDetails.destination}</li>
        <li><strong>Airline:</strong> ${bookingDetails.airline || 'N/A'}</li>
        <li><strong>Price:</strong> ${bookingDetails.price} ${bookingDetails.currency || 'USD'}</li>
        <li><strong>Class:</strong> ${bookingDetails.flightClass || 'N/A'}</li>
        <li><strong>Departure:</strong> ${bookingDetails.departureDate || 'N/A'}</li>
        ${bookingDetails.returnDate ? `<li><strong>Return:</strong> ${bookingDetails.returnDate}</li>` : ''}
        <li><strong>Available Seats:</strong> ${bookingDetails.availableSeats || 'N/A'}</li>
      </ul>
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New ${isPackage ? 'Travel Package' : 'Air Ticket'} Booking Request
        </h2>
        
        <h3>Customer Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${customerEmail}</li>
          ${customerPhone ? `<li><strong>Phone:</strong> ${customerPhone}</li>` : ''}
        </ul>
        
        ${detailsHtml}
        
        ${message ? `
          <h3>Customer Message:</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            ${message}
          </p>
        ` : ''}
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          This booking request was submitted from your Strakotou Travel and Tours website.
          Please contact the customer to confirm availability and complete the booking.
        </p>
      </div>
    `;

    // Send email to the travel agency
    const emailResponse = await resend.emails.send({
      from: "Strakotou Travel <onboarding@resend.dev>",
      to: ["estravel@cytanet.com.cy"],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to customer
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Thank you for your booking request!
        </h2>
        
        <p>Dear ${customerName},</p>
        
        <p>We have received your ${isPackage ? 'travel package' : 'air ticket'} booking request for:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <strong>${isPackage ? bookingDetails.title : `${bookingDetails.origin} → ${bookingDetails.destination}`}</strong>
        </div>
        
        <p>Our team will review your request and contact you shortly to confirm availability and discuss the next steps.</p>
        
        <p>If you have any immediate questions, please don't hesitate to contact us at:</p>
        <ul>
          <li>Email: estravel@cytanet.com.cy</li>
        </ul>
        
        <p>Thank you for choosing Strakotou Travel and Tours!</p>
        
        <p>Best regards,<br>
        The Strakotou Travel Team</p>
      </div>
    `;

    await resend.emails.send({
      from: "Strakotou Travel <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Booking Request Confirmation - ${isPackage ? bookingDetails.title : `${bookingDetails.origin} to ${bookingDetails.destination}`}`,
      html: confirmationHtml,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking request sent successfully" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);