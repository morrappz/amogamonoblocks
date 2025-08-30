import {
  anthropicDefaultModelId,
  anthropicModels,
  geminiDefaultModelId,
  geminiModels,
  openAiNativeDefaultModelId,
  openAiNativeModels,
  mistralModels,
  mistralDefaultModelId,
} from "@/data/models";

export const PROVIDER_MODELS: Record<
  string,
  { models: Record<string, any>; default: string }
> = {
  google: { models: geminiModels, default: geminiDefaultModelId },
  openai: { models: openAiNativeModels, default: openAiNativeDefaultModelId },
  anthropic: { models: anthropicModels, default: anthropicDefaultModelId },
  mistral: { models: mistralModels, default: mistralDefaultModelId },
};
