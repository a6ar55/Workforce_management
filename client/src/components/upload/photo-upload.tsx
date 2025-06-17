import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  X, 
  FileImage,
  Check
} from "lucide-react";

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  category: string;
  uploaded: boolean;
}

export function PhotoUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("before");
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: "before", label: "Before Work" },
    { value: "during", label: "During Work" },
    { value: "after", label: "After Completion" },
    { value: "signature", label: "Customer Signature" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoFile = {
            id: Date.now().toString() + Math.random(),
            file,
            preview: e.target?.result as string,
            category: selectedCategory,
            uploaded: false
          };
          setPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive"
        });
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const updatePhotoCategory = (id: string, category: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, category } : photo
    ));
  };

  const uploadPhotos = async () => {
    setIsUploading(true);
    
    try {
      // Simulate upload process
      for (const photo of photos.filter(p => !p.uploaded)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, uploaded: true } : p
        ));
      }
      
      toast({
        title: "Photos uploaded successfully",
        description: `${photos.length} photos uploaded to job report`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "before": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "during": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "after": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "signature": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors">
        <div className="p-8 text-center">
          <Camera className="mx-auto mb-4 text-slate-400 dark:text-slate-500" size={48} />
          <p className="text-muted-foreground mb-2">Upload job photos</p>
          <p className="text-sm text-muted-foreground mb-4">Before, during, and after photos</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Photo Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2" size={16} />
              Choose Files
            </Button>
          </div>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Photos ({photos.length})</h4>
            <Button
              onClick={uploadPhotos}
              disabled={isUploading || photos.every(p => p.uploaded)}
              size="sm"
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="relative overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={photo.preview}
                    alt="Job photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(photo.category)}>
                      {categories.find(c => c.value === photo.category)?.label}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      {photo.uploaded && (
                        <Check className="text-green-600 dark:text-green-400" size={16} />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <Select
                    value={photo.category}
                    onValueChange={(value) => updatePhotoCategory(photo.id, value)}
                    disabled={photo.uploaded}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {photos.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileImage size={16} />
                <span>{photos.length} photos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="text-green-600 dark:text-green-400" size={16} />
                <span>{photos.filter(p => p.uploaded).length} uploaded</span>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              Total size: {(photos.reduce((acc, p) => acc + p.file.size, 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
