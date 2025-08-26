"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "../type";

interface EnhancerRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: Product;
}

export function EnhancerRecordSheet({
  record,
  ...props
}: EnhancerRecordSheetProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [productData, setProductData] = useState<{
    name: string;
    shortDescription: string;
    description: string;
    image: File | null;
    imagePreview: string;
    customPrompt: string;
    imageEnhancerPrompt: string;
  }>({
    name: record?.product_name || "",
    shortDescription: record?.product_short_description || "",
    description: record?.product_short_description || "",
    image: null,
    imagePreview: "",
    customPrompt: "",
    imageEnhancerPrompt: "",
  });
  const [generatedData, setGeneratedData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    enhancedImage: "",
  });

  useEffect(() => {
    if (record) {
      const fetchImageAsFile = async (url: string | URL | Request) => {
      const response = await fetch(url);
      let blob = await response.blob();

      if (blob.type === "binary/octet-stream") {
        const extension = url.toString().split('.').pop()?.toLowerCase();
        let mimeType = "application/octet-stream";

        switch (extension) {
        case "jpg":
        case "jpeg":
          mimeType = "image/jpeg";
          break;
        case "png":
          mimeType = "image/png";
          break;
        case "gif":
          mimeType = "image/gif";
          break;
        case "webp":
          mimeType = "image/webp";
          break;
        default:
          console.warn("Unknown file extension, defaulting to application/octet-stream");
        }

        blob = blob.slice(0, blob.size, mimeType);
      }

      const file = new File([blob], "image.jpg", { type: blob.type });
      console.log("imageloaded url", file);
      return file;
      };

      const initializeImage = async () => {
      if (record.product_small_image_link) {
        const file = await fetchImageAsFile(record.product_small_image_link);
        setProductData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        }));
      }
      };

      setProductData((prev) => ({
      ...prev,
      name: record.product_name || "",
      shortDescription: record.product_short_description || "",
      description: record.product_short_description || "",
      }));

      initializeImage();
    }
  }, [record]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      // Ensure the correct MIME type is saved
      const correctedFile = new File([file], file.name, { type: file.type });

      setProductData((prev) => ({
        ...prev,
        image: correctedFile,
        imagePreview: URL.createObjectURL(correctedFile),
      }));
    }
  };

  const handleGenerate = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsGenerating(true);

    const formdata = new FormData();
    formdata.append("title", productData.name);
    formdata.append("description", productData.description);
    formdata.append("short_description", productData.shortDescription);
    formdata.append("user_prompt", productData.customPrompt);

    try {
      const response = await fetch(
        "https://automate.morr.biz/webhook/c106eeed-d793-4128-b03a-194dd17951fc",
        {
          method: "POST",
          body: formdata,
          redirect: "follow",
        }
      );
      const result = await response.json();
      setGeneratedData((prev) => ({
        ...prev,
        name: result.title,
        description: result.description,
        shortDescription: result.short_description,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceImage = async () => {
    if (!productData.image) return;
    setIsEnhancingImage(true);
    setEnhanceError(null);

    const formdata = new FormData();
    const file = productData.image;
    console.log("file",file)

    // Ensure the correct MIME type is sent
    formdata.append("product_image", file, file.name);
    formdata.append("user_prompt", productData.imageEnhancerPrompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // Set timeout to 180 seconds

    try {
      const response = await fetch(
        "https://automate.morr.biz/webhook/a4906a27-2862-47b9-9b2d-ecea5f3cec7c",
        {
          method: "POST",
          body: formdata,
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedData((prev) => ({
        ...prev,
        enhancedImage: `data:${result.output_image_mimeType};base64,${result.output_image_base64}`,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setEnhanceError("Request timed out. Please try again.");
      } else {
        console.log("error",error)
        setEnhanceError("Error enhancing image. Please try again.");
      }
    } finally {
      setIsEnhancingImage(false);
    }
  };

  const handleSave = () => {
    alert("Product saved successfully!");
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setProductData({
      name: "",
      shortDescription: "",
      description: "",
      image: null,
      imagePreview: "",
      customPrompt: "",
      imageEnhancerPrompt: "",
    });
    setGeneratedData({
      name: "",
      shortDescription: "",
      description: "",
      enhancedImage: "",
    });
    setStep(1);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsGenerating(true);
    await handleGenerate(e);
    setStep(2);
    handleEnhanceImage();
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-ld max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enhancer Sheet</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mb-0">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              1
            </div>
            <div className="w-16 h-1 bg-muted mx-2"></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            <CardHeader>
              <CardTitle>Step 1: Product Prompts</CardTitle>
              <CardDescription>Enter your product details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">1. Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">2. Short Description</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={productData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">3. Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed product description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">4. Upload Image</Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-2">
                        <label
                          htmlFor="image"
                          className="cursor-pointer text-sm text-primary hover:text-primary/80"
                        >
                          Upload an image
                          <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only size-7"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {productData.imagePreview && (
                    <div className="relative h-40 w-full overflow-hidden rounded-md">
                      <Image
                        src={productData.imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrompt">
                  5. Custom Prompt (Optional)
                </Label>
                <Textarea
                  id="customPrompt"
                  name="customPrompt"
                  value={productData.customPrompt}
                  onChange={handleInputChange}
                  placeholder="Add any specific instructions for generation"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageEnhancerPrompt">
                  6. Image Enhancer Prompt (Optional)
                </Label>
                <Textarea
                  id="imageEnhancerPrompt"
                  name="imageEnhancerPrompt"
                  value={productData.imageEnhancerPrompt}
                  onChange={handleInputChange}
                  placeholder="Add specific instructions for image enhancement"
                  rows={2}
                />
              </div>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isGenerating ||
                    isEnhancingImage ||
                    !productData.name ||
                    !productData.shortDescription ||
                    !productData.description
                  }
                >
                  {(isGenerating || isEnhancingImage) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Step 2: Generated Product</CardTitle>
              <CardDescription>
                Review your generated product content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>1. Product Name</Label>
                <div className="p-4 rounded-md border bg-primary/5">
                  <p className="font-medium">{generatedData.name}</p>
                </div>
                <div className="mt-2 p-3 rounded-md border-l-2 border-muted bg-muted/20">
                  <p className="text-sm text-muted-foreground">Original:</p>
                  <p className="text-sm">{productData.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>2. Short Description</Label>
                <div className="p-4 rounded-md border bg-primary/5">
                  <p className="font-medium">{generatedData.shortDescription}</p>
                </div>
                <div className="mt-2 p-3 rounded-md border-l-2 border-muted bg-muted/20">
                  <p className="text-sm text-muted-foreground">Original:</p>
                  <p className="text-sm">{productData.shortDescription}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>3. Description</Label>
                <div className="p-4 rounded-md border bg-primary/5">
                  <p className="font-medium">{generatedData.description}</p>
                </div>
                <div className="mt-2 p-3 rounded-md border-l-2 border-muted bg-muted/20">
                  <p className="text-sm text-muted-foreground">Original:</p>
                  <p className="text-sm">{productData.description}</p>
                </div>
              </div>
              {productData.imagePreview && (
                <div className="space-y-2">
                  <Label>4. Enhanced Image</Label>
                  <div className="relative h-64 w-full overflow-hidden rounded-md">
                    <Image
                      src={
                        generatedData.enhancedImage
                          ? generatedData.enhancedImage
                          : productData.imagePreview
                      }
                      alt="Enhanced product"
                      fill
                      className={`object-contain ${
                        !generatedData.enhancedImage && !enhanceError ? "blur-sm" : ""
                      }`}
                    />
                    {!generatedData.enhancedImage && !enhanceError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span>This will take some time...</span>
                      </div>
                    )}
                    {enhanceError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 text-white p-4 rounded-md">
                        <p>{enhanceError}</p>
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={handleEnhanceImage}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <DialogClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave}>Save Product</Button>
            </CardFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
