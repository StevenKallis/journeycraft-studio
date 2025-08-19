import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'package' | 'ticket';
  bookingDetails: {
    title?: string;
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

export const BookingForm = ({ isOpen, onClose, type, bookingDetails }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
        body: {
          type,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || undefined,
          message: formData.message || undefined,
          bookingDetails
        }
      });

      if (error) throw error;

      toast({
        title: "Booking Request Sent!",
        description: "We've received your booking request and will contact you shortly.",
      });

      // Reset form and close dialog
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        message: ""
      });
      onClose();
    } catch (error) {
      console.error('Error sending booking request:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPackage = type === 'package';
  const title = isPackage 
    ? `Book ${bookingDetails.title}` 
    : `Book Flight: ${bookingDetails.origin} → ${bookingDetails.destination}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in your details and we'll contact you to confirm your booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Email Address *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              placeholder="Your phone number"
            />
          </div>

          <div>
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Any special requests or questions..."
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Summary:</h4>
            {isPackage ? (
              <div className="text-sm space-y-1">
                <p><strong>Package:</strong> {bookingDetails.title}</p>
                <p><strong>Price:</strong> ${bookingDetails.price}</p>
                <p><strong>Duration:</strong> {bookingDetails.duration}</p>
                <p><strong>Location:</strong> {bookingDetails.location}</p>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <p><strong>Route:</strong> {bookingDetails.origin} → {bookingDetails.destination}</p>
                <p><strong>Airline:</strong> {bookingDetails.airline}</p>
                <p><strong>Price:</strong> {bookingDetails.price} {bookingDetails.currency}</p>
                <p><strong>Class:</strong> {bookingDetails.flightClass}</p>
                {bookingDetails.departureDate && (
                  <p><strong>Departure:</strong> {new Date(bookingDetails.departureDate).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-hero-gradient text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};