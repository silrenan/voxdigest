
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, FileText, Loader2, Sparkles, UploadCloud, QuoteIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { TranscribeAudioOutput } from '@/ai/flows/transcribe-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type { SummarizeTranscriptionOutput } from '@/ai/flows/summarize-transcription';
import { summarizeTranscription } from '@/ai/flows/summarize-transcription';
import type { GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { generateImage } from '@/ai/flows/generate-image-flow';
import type { GenerateQuoteOutput } from '@/ai/flows/generate-quote-flow';
import { generateInspirationalQuote } from '@/ai/flows/generate-quote-flow';


export default function VoxDigestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribeAudioOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeTranscriptionOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); 
  
  const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(true); // Start true for initial load
  const [inspirationalQuote, setInspirationalQuote] = useState<string | null>(null); // Initial state null
  const [isGeneratingQuote, setIsGeneratingQuote] = useState<boolean>(true); // Start true for initial load

  const { toast } = useToast();

  const fetchGeneratedImage = useCallback(async () => {
    setIsGeneratingImage(true);
    setGeneratedImageSrc(null); // Clear previous image
    try {
      const imageResult: GenerateImageOutput = await generateImage({ prompt: "ethereal female warrior, blindfolded, short white hair, sleek monochrome outfit, futuristic setting, abstract digital art style" });
      setGeneratedImageSrc(imageResult.imageDataUri);
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: "Could not generate the 2B image. Showing placeholder.",
      });
      setGeneratedImageSrc("https://placehold.co/600x400.png"); 
    } finally {
      // setIsGeneratingImage(false) will be handled by Image onLoad/onError
    }
  }, [toast]);

  const fetchInspirationalQuote = useCallback(async () => {
    setIsGeneratingQuote(true);
    setInspirationalQuote(null); // Clear previous quote
    try {
      const quoteResult: GenerateQuoteOutput = await generateInspirationalQuote();
      setInspirationalQuote(quoteResult.quote);
    } catch (error) {
      console.error("Error generating quote:", error);
      setInspirationalQuote("Failed to generate a thought. Try again?");
      toast({
        variant: "destructive",
        title: "Quote Generation Failed",
        description: "Could not generate an inspirational quote.",
      });
    } finally {
      setIsGeneratingQuote(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGeneratedImage();
    fetchInspirationalQuote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'audio/mpeg') {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an .mp3 file.",
        });
        setSelectedFile(null);
        setAudioDataUrl(null);
        event.target.value = ''; 
        return;
      }
      setSelectedFile(file);
      setTranscriptionResult(null); 
      setSummaryResult(null); 
      try {
        const dataUrl = await readFileAsDataURL(file);
        setAudioDataUrl(dataUrl);
        toast({
          title: "File Selected",
          description: `${file.name} is ready for processing.`,
        });
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the selected file.",
        });
        setSelectedFile(null);
        setAudioDataUrl(null);
      }
    }
  };
  
  const handleSummarizeInternal = async (transcription: string) => {
    if (!transcription) {
      toast({ variant: "destructive", title: "No Transcription", description: "Cannot summarize without transcription." });
      return;
    }
    setSummaryResult(null);
    toast({ title: "Summarization Started", description: "Generating enhanced summary..." });
    try {
      const result = await summarizeTranscription({ transcription: transcription });
      setSummaryResult(result);
      toast({ title: "Summarization Successful", description: "Enhanced summary generated." });
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: "An error occurred during summarization.",
      });
    }
  };


  const handleTranscribeAndSummarize = async () => {
    if (!audioDataUrl) {
      toast({ variant: "destructive", title: "No Audio", description: "Please select an audio file first." });
      return;
    }
    setIsProcessing(true);
    setTranscriptionResult(null);
    setSummaryResult(null); 
    
    toast({ title: "Processing Started", description: "Generating visuals, quote, and transcribing audio..." });

    // Regenerate image and quote
    await Promise.all([fetchGeneratedImage(), fetchInspirationalQuote()]);

    try {
      toast({ title: "Transcription Underway", description: "Processing your audio file..." });
      const transcriptionOutput = await transcribeAudio({ audioDataUri: audioDataUrl });
      setTranscriptionResult(transcriptionOutput);
      toast({ title: "Transcription Successful", description: "Audio transcribed. Now generating summary..." });
      
      if (transcriptionOutput.transcription) {
        await handleSummarizeInternal(transcriptionOutput.transcription);
      } else {
        toast({ variant: "destructive", title: "Empty Transcription", description: "Cannot summarize empty transcription." });
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "An error occurred during transcription or summarization.",
      });
      setSummaryResult(null); 
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDownload = () => {
    if (!transcriptionResult || !summaryResult) {
      toast({ variant: "destructive", title: "No Content", description: "Nothing to download." });
      return;
    }

    const markdownContent = `
# VoxDigest Audio Transcription

\`\`\`
${transcriptionResult.transcription}
\`\`\`

# AI Summary

## Key Concepts
${summaryResult.keyConcepts}

## Quotes
${summaryResult.quotes}

## Facts
${summaryResult.facts}

## Latest on this Matter
${summaryResult.latestInformation}

## TL;DR
${summaryResult.tldrSummary}
    `.trim();

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voxdigest_ai_output.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: "Content is being downloaded as Markdown." });
  };
  
  useEffect(() => {
    const currentAudioDataUrl = audioDataUrl;
    return () => {
      if (currentAudioDataUrl && currentAudioDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudioDataUrl);
      }
    };
  }, [audioDataUrl]);


  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="py-6 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-primary font-headline tracking-tight">VoxDigest</h1>
          <p className="text-muted-foreground mt-1">Transcribe and Summarize Your Audio Files with AI</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          <div className="space-y-6 lg:space-y-8">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                  <UploadCloud className="mr-2 h-6 w-6 text-primary" />
                  1. Upload Audio
                </CardTitle>
                <CardDescription>Select an .mp3 file to begin.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="audio-file" className="sr-only">Audio File</Label>
                  <Input id="audio-file" type="file" accept=".mp3" onChange={handleFileChange} className="file:text-primary file:font-semibold hover:file:bg-primary/10" />
                </div>
                {selectedFile && <p className="mt-3 text-sm text-muted-foreground">Selected: <span className="font-medium text-foreground">{selectedFile.name}</span></p>}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleTranscribeAndSummarize} 
                  disabled={!selectedFile || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  {isProcessing ? 'Processing AI Magic...' : 'Transcribe & Summarize'}
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl">2B</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border border-border">
                  {(isGeneratingImage) && ( // Show loader if actively generating OR if src is still null after initial attempt
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 z-10">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">Generating inspiration...</p>
                    </div>
                  )}
                  <Image 
                    src={generatedImageSrc || "https://placehold.co/600x400.png"} 
                    data-ai-hint={generatedImageSrc && generatedImageSrc !== "https://placehold.co/600x400.png" ? "futuristic warrior" : "placeholder image"} 
                    alt={generatedImageSrc && generatedImageSrc !== "https://placehold.co/600x400.png" ? "AI-generated 2B-inspired visual" : "Placeholder image"} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover" 
                    priority={!generatedImageSrc} 
                    onLoad={() => {
                        if (generatedImageSrc && generatedImageSrc !== "https://placehold.co/600x400.png") setIsGeneratingImage(false);
                    }}
                    onError={() => {
                        setIsGeneratingImage(false);
                        if (generatedImageSrc && generatedImageSrc !== "https://placehold.co/600x400.png") { 
                            setGeneratedImageSrc("https://placehold.co/600x400.png"); 
                            toast({ variant: "destructive", title: "Image Load Error", description: "Failed to display generated image. Showing placeholder."});
                        }
                    }}
                  />
                </div>
                 <CardDescription className="mt-3 text-center italic flex items-center justify-center min-h-[2em]">
                    {isGeneratingQuote ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Crafting a thought...
                        </>
                    ): inspirationalQuote ? (
                        <>
                            <QuoteIcon className="mr-2 h-4 w-4 text-primary/70 transform scale-x-[-1]" />
                            {inspirationalQuote}
                             <QuoteIcon className="ml-2 h-4 w-4 text-primary/70" />
                        </>
                    ) : (
                        "Let AI inspire your next step." 
                    )}
                 </CardDescription>
              </CardContent>
            </Card>
          </div>

          
          <div className="space-y-6 lg:space-y-8">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                  <FileText className="mr-2 h-6 w-6 text-primary" />
                   2. Transcription
                </CardTitle>
                <CardDescription>The transcribed text from your audio file.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[150px]">
                {isProcessing && !transcriptionResult && (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-sm text-muted-foreground">Transcribing audio...</p>
                  </div>
                )}
                {transcriptionResult && (
                  <Textarea 
                    value={transcriptionResult.transcription} 
                    readOnly 
                    rows={10} 
                    className="text-sm bg-muted/50 border-border" 
                    placeholder="Transcription output..."
                  />
                )}
                {!transcriptionResult && !isProcessing && <p className="text-sm text-muted-foreground text-center py-10">Transcription will appear here once processed.</p>}
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                  <Sparkles className="mr-2 h-6 w-6 text-primary" />
                  3. AI Summary
                </CardTitle>
                <CardDescription>Key insights and latest context extracted by AI.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] space-y-3 text-sm">
                {isProcessing && !summaryResult && transcriptionResult && ( 
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="ml-2 text-sm text-muted-foreground">Generating enhanced summary...</p>
                  </div>
                )}
                 {transcriptionResult && !summaryResult && !isProcessing && ( 
                  <div className="flex justify-center items-center h-full">
                     <p className="text-sm text-muted-foreground">Summary will appear here.</p>
                  </div>
                )}
                {summaryResult && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Key Concepts:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{summaryResult.keyConcepts}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Important Quotes:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{summaryResult.quotes}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Key Facts:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{summaryResult.facts}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Latest on this Matter:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{summaryResult.latestInformation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">TL;DR Summary:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{summaryResult.tldrSummary}</p>
                    </div>
                  </div>
                )}
                {!summaryResult && !isProcessing && !transcriptionResult && <p className="text-sm text-muted-foreground text-center py-10">Upload and transcribe an audio file to see the summary.</p>}
              </CardContent>
              {summaryResult && !isProcessing && (
                <CardFooter>
                  <Button 
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download (.md)
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        © {new Date().getFullYear()} VoxDigest. All rights reserved.
      </footer>
    </div>
  );
}

    