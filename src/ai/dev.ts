
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-transcription.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/generate-quote-flow.ts';
