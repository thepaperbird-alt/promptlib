import { PromptLibrary } from '@/components/prompt-library';

export default function SharedPromptLibraryPage() {
  return (
    <PromptLibrary
      readOnly
      title="SHARED PROMPTS."
      subtitle="Read-only prompt library for browsing and copying prompts."
    />
  );
}
