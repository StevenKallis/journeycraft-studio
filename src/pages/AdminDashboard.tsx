import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, Edit, Trash2, FileText, Image, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockPackages = [
  {
    id: 1,
    title: "Mountain Adventure Escape",
    description: "Experience breathtaking mountain views and thrilling adventures.",
    price: 2499,
    duration: "7 days",
    location: "Swiss Alps",
    maxGuests: 12,
    images: ["mountain1.jpg", "mountain2.jpg"],
    pdfs: ["mountain-itinerary.pdf"],
    status: "active"
  },
  {
    id: 2,
    title: "Tropical Paradise Getaway",
    description: "Relax in luxury overwater bungalows with pristine beaches.",
    price: 3299,
    duration: "10 days",
    location: "Maldives",
    maxGuests: 8,
    images: ["beach1.jpg", "beach2.jpg"],
    pdfs: ["beach-guide.pdf"],
    status: "active"
  }
];

const mockNews = [
  {
    id: 1,
    title: "New Sustainable Travel Initiatives",
    excerpt: "We're proud to announce our commitment to eco-friendly travel options.",
    content: "Full content here...",
    category: "Sustainability",
    date: "2024-01-15",
    status: "published"
  },
  {
    id: 2,
    title: "Early Bird Special: 30% Off Alpine Adventures",
    excerpt: "Book your mountain getaway before March and save big.",
    content: "Full content here...",
    category: "Promotions",
    date: "2024-01-10",
    status: "draft"
  }
];

const AdminDashboard = () => {
  const [packages, setPackages] = useState(mockPackages);
  const [news, setNews] = useState(mockNews);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    location: "",
    maxGuests: ""
  });
  const [newNews, setNewNews] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: ""
  });
  
  const { toast } = useToast();

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // In real implementation, upload to Supabase Storage
    setSelectedFiles(files);
    toast({
      title: "Files selected",
      description: `${files.length} file(s) ready for upload`
    });
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real implementation, save to Supabase
    const packageData = {
      id: packages.length + 1,
      ...newPackage,
      price: parseFloat(newPackage.price),
      maxGuests: parseInt(newPackage.maxGuests),
      images: selectedFiles ? Array.from(selectedFiles).filter(f => f.type.startsWith('image/')).map(f => f.name) : [],
      pdfs: selectedFiles ? Array.from(selectedFiles).filter(f => f.type === 'application/pdf').map(f => f.name) : [],
      status: "active"
    };
    
    setPackages([...packages, packageData]);
    setNewPackage({ title: "", description: "", price: "", duration: "", location: "", maxGuests: "" });
    setSelectedFiles(null);
    
    toast({
      title: "Package created",
      description: "Travel package has been successfully created"
    });
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real implementation, save to Supabase
    const newsData = {
      id: news.length + 1,
      ...newNews,
      date: new Date().toISOString().split('T')[0],
      status: "published"
    };
    
    setNews([...news, newsData]);
    setNewNews({ title: "", excerpt: "", content: "", category: "" });
    
    toast({
      title: "News published",
      description: "News article has been successfully published"
    });
  };

  const deletePackage = (id: number) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
    toast({
      title: "Package deleted",
      description: "Travel package has been removed"
    });
  };

  const deleteNews = (id: number) => {
    setNews(news.filter(item => item.id !== id));
    toast({
      title: "News deleted",
      description: "News article has been removed"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-white/80">Manage your travel packages and content</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="packages" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="packages">Travel Packages</TabsTrigger>
            <TabsTrigger value="news">News & Updates</TabsTrigger>
            <TabsTrigger value="files">File Management</TabsTrigger>
          </TabsList>

          {/* Travel Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Travel Packages</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Travel Package</DialogTitle>
                    <DialogDescription>
                      Add a new travel package with images and documents
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePackageSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Package Title</Label>
                        <Input
                          id="title"
                          value={newPackage.title}
                          onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newPackage.location}
                          onChange={(e) => setNewPackage({...newPackage, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPackage.description}
                        onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newPackage.price}
                          onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={newPackage.duration}
                          onChange={(e) => setNewPackage({...newPackage, duration: e.target.value})}
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxGuests">Max Guests</Label>
                        <Input
                          id="maxGuests"
                          type="number"
                          value={newPackage.maxGuests}
                          onChange={(e) => setNewPackage({...newPackage, maxGuests: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="files">Upload Images & PDFs</Label>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Select multiple images and PDF files for this package
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline">Cancel</Button>
                      <Button type="submit" variant="hero">Create Package</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{pkg.title}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deletePackage(pkg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${pkg.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{pkg.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Max {pkg.maxGuests}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <Label className="text-sm font-medium">Images ({pkg.images.length})</Label>
                        <div className="flex gap-1 mt-1">
                          {pkg.images.map((img, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />
                              {img}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">PDFs ({pkg.pdfs.length})</Label>
                        <div className="flex gap-1 mt-1">
                          {pkg.pdfs.map((pdf, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {pdf}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">News & Updates</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add News Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create News Article</DialogTitle>
                    <DialogDescription>
                      Add a new news article or update
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNewsSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="newsTitle">Title</Label>
                      <Input
                        id="newsTitle"
                        value={newNews.title}
                        onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newNews.category}
                        onChange={(e) => setNewNews({...newNews, category: e.target.value})}
                        placeholder="e.g., Promotions, Safety, Sustainability"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={newNews.excerpt}
                        onChange={(e) => setNewNews({...newNews, excerpt: e.target.value})}
                        placeholder="Brief summary of the article"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Full Content</Label>
                      <Textarea
                        id="content"
                        value={newNews.content}
                        onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                        placeholder="Full article content"
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline">Cancel</Button>
                      <Button type="submit" variant="hero">Publish Article</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {news.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <Badge variant={item.status === 'published' ? 'default' : 'outline'}>
                            {item.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.excerpt}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteNews(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Published on {new Date(item.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* File Management Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">File Management</h2>
              <Button variant="hero">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                  Upload images and PDF files for your travel packages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports JPG, PNG, and PDF files up to 10MB each
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="max-w-xs cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;