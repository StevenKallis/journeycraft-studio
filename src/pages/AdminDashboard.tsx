import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, Edit, Trash2, FileText, Image, MapPin, Calendar, Users, DollarSign, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  useEffect(() => {
    fetchPackages();
    fetchNews();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news",
        variant: "destructive",
      });
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('package-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      uploadedPaths.push(fileName);
    }
    
    return uploadedPaths;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(files);
    toast({
      title: "Files selected",
      description: `${files.length} file(s) ready for upload`
    });
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let uploadedImages: string[] = [];
      let uploadedPdfs: string[] = [];
      
      if (selectedFiles) {
        const imageFiles = Array.from(selectedFiles).filter(f => f.type.startsWith('image/'));
        const pdfFiles = Array.from(selectedFiles).filter(f => f.type === 'application/pdf');
        
        if (imageFiles.length > 0) {
          uploadedImages = await uploadFiles(imageFiles);
        }
        if (pdfFiles.length > 0) {
          uploadedPdfs = await uploadFiles(pdfFiles);
        }
      }
      
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          title: newPackage.title,
          description: newPackage.description,
          price: parseFloat(newPackage.price),
          duration: newPackage.duration,
          location: newPackage.location,
          max_guests: parseInt(newPackage.maxGuests),
          images: uploadedImages,
          pdfs: uploadedPdfs,
          status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setPackages([data, ...packages]);
      setNewPackage({ title: "", description: "", price: "", duration: "", location: "", maxGuests: "" });
      setSelectedFiles(null);
      
      toast({
        title: "Package created",
        description: "Travel package has been successfully created"
      });
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([{
          title: newNews.title,
          excerpt: newNews.excerpt,
          content: newNews.content,
          category: newNews.category,
          status: 'published'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setNews([data, ...news]);
      setNewNews({ title: "", excerpt: "", content: "", category: "" });
      
      toast({
        title: "News published",
        description: "News article has been successfully published"
      });
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: "Error",
        description: "Failed to create news article",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPackages(packages.filter(pkg => pkg.id !== id));
      toast({
        title: "Package deleted",
        description: "Travel package has been removed"
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNews(news.filter(item => item.id !== id));
      toast({
        title: "News deleted",
        description: "News article has been removed"
      });
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
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
                      <Button type="submit" variant="hero" disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Package"
                        )}
                      </Button>
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
                          <span>Max {pkg.max_guests}</span>
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
                      <Button type="submit" variant="hero" disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          "Publish Article"
                        )}
                      </Button>
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
                      Published on {new Date(item.created_at).toLocaleDateString()}
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