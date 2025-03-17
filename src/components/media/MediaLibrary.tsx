"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Copy, 
  Trash, 
  Check,
  FileText as TextSnippetIcon
} from "lucide-react";

export function MediaLibrary() {
  // Media state
  const [mediaItems, setMediaItems] = useState([
    { id: 1, name: "Company Logo", type: "image", url: "/images/logo.png", global: true },
    { id: 2, name: "Product Brochure", type: "pdf", url: "/documents/brochure.pdf", global: true },
    { id: 3, name: "Welcome Video", type: "video", url: "/videos/welcome.mp4", global: false },
    { id: 4, name: "Brand Guidelines", type: "pdf", url: "/documents/brand.pdf", global: true },
  ]);
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaType, setMediaType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [isTextSnippetDialogOpen, setIsTextSnippetDialogOpen] = useState(false);
  const [textSnippetName, setTextSnippetName] = useState("");
  const [textSnippetContent, setTextSnippetContent] = useState("");

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Add the file to media items
        setTimeout(() => {
          try {
            // Safely determine file type - fixing TS18048
            let fileType = 'file'; // Default type
            if (file && typeof file.type === 'string') {
              const typeParts = file.type.split('/');
              if (typeParts && typeParts.length > 0) {
                fileType = typeParts[0] || 'file';
              }
            }
            
            // Create URL safely - fixing TS2345
            const objectUrl = file instanceof Blob ? URL.createObjectURL(file) : '';
            
            const newFile = {
              id: Date.now(),
              name: (file && typeof file.name === 'string') ? file.name : `File-${Date.now()}`,
              type: fileType,
              url: objectUrl,
              global: false,
            };
            
            setMediaItems(prev => [...prev, newFile]);
            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setUploadProgress(0);
          } catch (err) {
            console.error("Error processing uploaded file:", err);
            alert("There was an error processing your file. Please try again.");
            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }, 500);
      }
    }, 300);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'video/*': []
    }
  });

  // Handle media filtering
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = mediaType === "all" || item.type === mediaType;
    return matchesSearch && matchesType;
  });

  // Handle delete media
  const deleteMedia = (id: number) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle copy URL
  const copyUrl = (id: number, url: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
          .then(() => {
            setCopySuccess(id);
            setTimeout(() => setCopySuccess(null), 2000);
          })
          .catch(err => {
            console.error("Clipboard write failed:", err);
            fallbackCopyTextToClipboard(url, id);
          });
      } else {
        fallbackCopyTextToClipboard(url, id);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Unable to copy URL. Please try again or copy manually.");
    }
  };
  
  // Fallback clipboard method for browsers without clipboard API support
  const fallbackCopyTextToClipboard = (text: string, id: number) => {
    try {
      // Create temporary element
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopySuccess(id);
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        alert("Copy failed. Please try again or copy manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      alert("Unable to copy URL. Please try again or copy manually.");
    }
  };

  // Media type icon
  const getMediaIcon = (type: string) => {
    switch(type) {
      case 'image': return <ImageIcon className="h-10 w-10 text-blue-500" />;
      case 'pdf': return <FileText className="h-10 w-10 text-red-500" />;
      case 'video': return <Video className="h-10 w-10 text-purple-500" />;
      case 'text': return <TextSnippetIcon className="h-10 w-10 text-green-500" />;
      default: return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  // Handle text snippet submit
  const handleTextSnippetSubmit = () => {
    if (!textSnippetName.trim() || !textSnippetContent.trim()) return;
    
    const newTextSnippet = {
      id: Date.now(),
      name: textSnippetName,
      type: "text",
      url: `text-snippet-${uuidv4()}`, // Generate a unique identifier
      global: false,
      content: textSnippetContent, // Store the actual text content
    };
    
    setMediaItems(prev => [...prev, newTextSnippet]);
    setIsTextSnippetDialogOpen(false);
    setTextSnippetName("");
    setTextSnippetContent("");
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search media..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="pdf">Documents</option>
            <option value="video">Videos</option>
            <option value="text">Text Snippets</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="border rounded-md overflow-hidden flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          {/* Text Snippet Dialog */}
          <Dialog open={isTextSnippetDialogOpen} onOpenChange={setIsTextSnippetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TextSnippetIcon className="h-4 w-4 mr-2" />
                Add Text Snippet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Text Snippet</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input 
                    value={textSnippetName}
                    onChange={(e) => setTextSnippetName(e.target.value)}
                    placeholder="Enter a title for the text snippet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text Content</label>
                  <textarea
                    value={textSnippetContent}
                    onChange={(e) => setTextSnippetContent(e.target.value)}
                    placeholder="Enter your text snippet content"
                    className="w-full min-h-[150px] p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTextSnippetDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleTextSnippetSubmit}>Add Snippet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
              </DialogHeader>
              
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getMediaIcon(selectedFile.type.split('/')[0] || 'file')}
                    <div className="flex-1">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-center">
                    {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
                  </p>
                </div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div>
                    <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      {isDragActive
                        ? "Drop the files here..."
                        : "Drag and drop files here, or click to select files"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: Images, PDFs, Videos
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Media Library Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Media</TabsTrigger>
              <TabsTrigger value="global">Global Media</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No media files found</p>
                  <p className="text-sm mt-2">Try adjusting your search or upload new files</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gray-50 flex items-center justify-center border-b">
                        {getMediaIcon(item.type)}
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium truncate" title={item.name}>
                            {item.name}
                          </p>
                          {item.global && (
                            <Badge className="ml-1" variant="outline">Global</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                              onClick={() => copyUrl(item.id, item.url)}
                              title="Copy URL"
                            >
                              {copySuccess === item.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button 
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              onClick={() => deleteMedia(item.id)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedia.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {getMediaIcon(item.type)}
                            <span>{item.name}</span>
                          </TableCell>
                          <TableCell>{item.type.toUpperCase()}</TableCell>
                          <TableCell>
                            {item.global ? (
                              <Badge variant="outline">Global</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100">Private</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => copyUrl(item.id, item.url)}>
                                {copySuccess === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMedia(item.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="global">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMedia.filter(item => item.global).map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gray-50 flex items-center justify-center border-b">
                        {getMediaIcon(item.type)}
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium truncate" title={item.name}>
                            {item.name}
                          </p>
                          <Badge className="ml-1" variant="outline">Global</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                              onClick={() => copyUrl(item.id, item.url)}
                              title="Copy URL"
                            >
                              {copySuccess === item.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button 
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              onClick={() => deleteMedia(item.id)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedia.filter(item => item.global).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {getMediaIcon(item.type)}
                            <span>{item.name}</span>
                          </TableCell>
                          <TableCell>{item.type.toUpperCase()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => copyUrl(item.id, item.url)}>
                                {copySuccess === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMedia(item.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent">
              {/* Recently added content */}
              <div className="text-center py-12 text-gray-500">
                <p>Showing most recently added media files</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}