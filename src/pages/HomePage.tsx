import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import mountainPackage from "@/assets/mountain-package.jpg";
import beachPackage from "@/assets/beach-package.jpg";
import cityPackage from "@/assets/city-package.jpg";

// Mock data - in real app this would come from Supabase
const travelPackages = [
  {
    id: 1,
    title: "Mountain Adventure Escape",
    description: "Experience breathtaking mountain views and thrilling adventures in the Swiss Alps.",
    image: mountainPackage,
    price: "$2,499",
    duration: "7 days",
    location: "Swiss Alps",
    rating: 4.9,
    maxGuests: 12,
    featured: true
  },
  {
    id: 2,
    title: "Tropical Paradise Getaway",
    description: "Relax in luxury overwater bungalows with pristine beaches and crystal-clear waters.",
    image: beachPackage,
    price: "$3,299",
    duration: "10 days",
    location: "Maldives",
    rating: 4.8,
    maxGuests: 8,
    featured: false
  },
  {
    id: 3,
    title: "Urban Explorer Package",
    description: "Discover vibrant city life, world-class cuisine, and iconic landmarks.",
    image: cityPackage,
    price: "$1,799",
    duration: "5 days",
    location: "Tokyo, Japan",
    rating: 4.7,
    maxGuests: 16,
    featured: false
  }
];

const newsItems = [
  {
    id: 1,
    title: "New Sustainable Travel Initiatives",
    excerpt: "We're proud to announce our commitment to eco-friendly travel options and carbon-neutral packages.",
    date: "2024-01-15",
    category: "Sustainability"
  },
  {
    id: 2,
    title: "Early Bird Special: 30% Off Alpine Adventures",
    excerpt: "Book your mountain getaway before March and save big on our most popular alpine packages.",
    date: "2024-01-10",
    category: "Promotions"
  },
  {
    id: 3,
    title: "Travel Safety Updates",
    excerpt: "Important information about travel requirements and safety protocols for all destinations.",
    date: "2024-01-08",
    category: "Safety"
  }
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPackages = selectedCategory === "all" 
    ? travelPackages 
    : travelPackages.filter(pkg => pkg.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            WanderLux Travel
          </h1>
          <div className="flex gap-4">
            <Button variant="ghost">Packages</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
            <Button variant="ghost" onClick={() => window.location.href = '/admin'}>Admin</Button>
            <Button variant="hero">Book Now</Button>
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
            <Button variant="hero" size="lg" className="shadow-hero">
              Explore Packages
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              Watch Video
            </Button>
          </div>
        </div>
      </section>

      {/* Travel Packages Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">Featured Travel Packages</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked destinations and experiences designed to create lasting memories
            </p>
          </div>

          {/* Package Filters */}
          <div className="flex justify-center gap-4 mb-12">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Packages
            </Button>
            <Button 
              variant={selectedCategory === "featured" ? "default" : "outline"}
              onClick={() => setSelectedCategory("featured")}
            >
              Featured
            </Button>
          </div>

          {/* Package Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden group hover:shadow-card transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {pkg.featured && (
                    <Badge className="absolute top-4 left-4 bg-sunset text-sunset-foreground">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {pkg.price}
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
                      Max {pkg.maxGuests}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current text-sunset" />
                      {pkg.rating}
                    </div>
                  </div>
                  <Button className="w-full" variant="ocean">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Card key={item.id} className="hover:shadow-card transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                  <Button variant="ghost" className="p-0 h-auto">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 bg-sunset-gradient bg-clip-text text-transparent">
                WanderLux Travel
              </h4>
              <p className="text-primary-foreground/80">
                Creating extraordinary travel experiences since 2020.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-sunset transition-colors">Packages</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-sunset transition-colors">Blog</a></li>
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
                <p>📧 info@wanderlux.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Travel St, Adventure City</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 WanderLux Travel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;