import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Star, ArrowRight, Play, X, LogIn, LogOut, Loader2, FileText, Plane, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-travel.jpg";
import mountainPackage from "@/assets/mountain-package.jpg";
import beachPackage from "@/assets/beach-package.jpg";
import cityPackage from "@/assets/city-package.jpg";
import { BookingForm } from "@/components/BookingForm";

// Default images for packages without uploads
const defaultImages = [mountainPackage, beachPackage, cityPackage];

// Types for our data
interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  max_guests: number;
  images: string[];
  pdfs: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Ticket {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  airline: string;
  price: number;
  currency: string;
  flight_class: string;
  available_seats: number;
  flight_duration?: string;
  description?: string;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

const HomePage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingType, setBookingType] = useState<'package' | 'ticket'>('package');
  const [bookingItem, setBookingItem] = useState<Package | Ticket | null>(null);
  const { toast } = useToast();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
    fetchNews();
    fetchTickets();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load travel packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news updates",
        variant: "destructive",
      });
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load air tickets",
        variant: "destructive",
      });
    }
  };

  const handleBookNow = (item: Package | Ticket, type: 'package' | 'ticket') => {
    setBookingItem(item);
    setBookingType(type);
    setShowBookingForm(true);
  };

  const getBookingDetails = () => {
    if (!bookingItem) return {
      title: '',
      price: 0,
      currency: 'USD'
    };
    
    if (bookingType === 'package') {
      const pkg = bookingItem as Package;
      return {
        title: pkg.title,
        price: pkg.price,
        duration: pkg.duration,
        location: pkg.location,
        maxGuests: pkg.max_guests
      };
    } else {
      const ticket = bookingItem as Ticket;
      return {
        price: ticket.price,
        currency: ticket.currency,
        origin: ticket.origin,
        destination: ticket.destination,
        departureDate: ticket.departure_date,
        returnDate: ticket.return_date,
        airline: ticket.airline,
        flightClass: ticket.flight_class,
        availableSeats: ticket.available_seats
      };
    }
  };

  const getPackageImage = (pkg: Package, index: number) => {
    if (pkg.images && pkg.images.length > 0) {
      return `${supabase.storage.from('package-files').getPublicUrl(pkg.images[0]).data.publicUrl}`;
    }
    return defaultImages[index % defaultImages.length];
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Request Submitted!",
      description: "We'll contact you within 24 hours to confirm your booking.",
    });
    setShowBookingForm(false);
  };

  const navigateToAdmin = () => {
    window.location.href = '/admin';
  };

  const filteredPackages = packages;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading travel packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
           Strakotou-Travel and Tours
          </h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => scrollToSection('packages')}>Packages</Button>
            <Button variant="ghost" onClick={() => scrollToSection('tickets')}>Air Tickets</Button>
            <Button variant="ghost" onClick={() => scrollToSection('about')}>About</Button>
            <Button variant="ghost" onClick={() => scrollToSection('contact')}>Contact</Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" onClick={navigateToAdmin}>Admin</Button>
                )}
                <Button variant="ghost" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
            <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
              <DialogTrigger asChild>
                <Button variant="hero">Book Now</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book Your Adventure</DialogTitle>
                  <DialogDescription>
                    Fill out this form and we'll contact you to finalize your booking.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBooking} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="package">Preferred Package</Label>
                    <select id="package" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Select a package</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Special Requests</Label>
                    <Textarea id="message" placeholder="Any special requests or questions?" />
                  </div>
                  <Button type="submit" className="w-full">Submit Booking Request</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-6xl font-bold mb-6 leading-tight">
            Discover Your Next 
            <span className="block bg-hero-gradient bg-clip-text text-transparent">
              Adventure
            </span>
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            From pristine beaches to majestic mountains, create unforgettable memories 
            with our carefully crafted travel experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="hero" size="lg" className="shadow-hero" onClick={() => scrollToSection('packages')}>
              Explore Packages
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Discover WanderLux Travel</DialogTitle>
                  <button 
                    onClick={() => setShowVideoModal(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DialogHeader>
                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Video player would be embedded here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Showcasing our amazing travel destinations and experiences
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Travel Packages Section */}
      <section id="packages" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">Featured Travel Packages</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked destinations and experiences designed to create lasting memories
            </p>
          </div>

          {/* Package Filters - Hidden for now since we're showing all packages */}
          <div className="hidden justify-center gap-4 mb-12">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Packages
            </Button>
          </div>

          {/* Package Grid */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No travel packages available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg, index) => (
                <Card key={pkg.id} className="overflow-hidden group hover:shadow-card transition-all duration-300 hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img 
                      src={getPackageImage(pkg, index)} 
                      alt={pkg.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${pkg.price}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {pkg.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {pkg.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max {pkg.max_guests}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-current text-sunset" />
                        4.8
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="ocean" onClick={() => setSelectedPackage(pkg)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{selectedPackage?.title}</DialogTitle>
                          <DialogDescription>
                            Complete package details and booking information
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPackage && (
                          <div className="grid gap-6">
                            <img 
                              src={getPackageImage(selectedPackage, packages.indexOf(selectedPackage))} 
                              alt={selectedPackage.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{selectedPackage.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{selectedPackage.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="text-sm">Max {selectedPackage.max_guests} guests</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-current text-sunset" />
                                <span className="text-sm">4.8 rating</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-muted-foreground">{selectedPackage.description}</p>
                            </div>
                            {selectedPackage.pdfs && selectedPackage.pdfs.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Package Documents</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {selectedPackage.pdfs.map((pdf, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const url = supabase.storage.from('package-files').getPublicUrl(pdf).data.publicUrl;
                                        window.open(url, '_blank');
                                      }}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {pdf.length > 15 ? pdf.substring(0, 15) + '...' : pdf}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold">${selectedPackage.price}</span>
                                <span className="text-muted-foreground ml-2">per person</span>
                              </div>
                              <Button variant="hero" onClick={() => handleBookNow(selectedPackage, 'package')}>
                                Book This Package
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Air Tickets Section */}
      <section id="tickets" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Air Tickets</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the best flight deals for destinations around the world
            </p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading air tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Air Tickets Available</h3>
              <p className="text-muted-foreground">Check back soon for exciting flight deals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {ticket.flight_class}
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-hero">
                          {ticket.price} {ticket.currency}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="h-5 w-5 text-hero" />
                      <div className="flex flex-col">
                        <span className="text-sm font-normal text-muted-foreground">
                          {ticket.origin}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {ticket.destination}
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {ticket.airline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(ticket.departure_date).toLocaleDateString()}</span>
                      </div>
                      {ticket.return_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Return: {new Date(ticket.return_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {ticket.flight_duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.flight_duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{ticket.available_seats} seats available</span>
                      </div>
                    </div>
                    
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}

                    <Button 
                      className="w-full bg-hero-gradient hover:opacity-90 text-white"
                      onClick={() => handleBookNow(ticket, 'ticket')}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News & Updates Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">Latest News & Updates</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed about new destinations, special offers, and travel tips
            </p>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news updates available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Card key={item.id} className="hover:shadow-card transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto" onClick={() => setSelectedNews(item)}>
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{selectedNews?.title}</DialogTitle>
                          <DialogDescription>
                            {selectedNews?.category} • {selectedNews && new Date(selectedNews.created_at).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedNews && (
                          <div className="grid gap-4">
                            <p className="text-muted-foreground">{selectedNews.content}</p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 bg-sunset-gradient bg-clip-text text-transparent">
                Es-Travel and Tours
              </h4>
              <p className="text-primary-foreground/80">
                Creating extraordinary travel experiences since 2020.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><button onClick={() => scrollToSection('packages')} className="hover:text-sunset transition-colors">Packages</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-sunset transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-sunset transition-colors">Contact</button></li>
                <li><button onClick={() => setShowVideoModal(true)} className="hover:text-sunset transition-colors">Blog</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Destinations</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-sunset transition-colors">Europe</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">Asia</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">Americas</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">Africa</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact Info</h5>
              <div className="space-y-2 text-primary-foreground/80">
                <p>📧 estravel@cytanet.com.cy</p>
                <p>📞 +35799692892</p>
                <p>📍 Polignostou 15 Limassol, 3082</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; Es-Travel and Tours All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Booking Form */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        type={bookingType}
        bookingDetails={getBookingDetails()}
      />
    </div>
  );
};

export default HomePage;