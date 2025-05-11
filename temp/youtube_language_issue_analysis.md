# Analysis of YouTube Heading Language Issue

## Problem Description

When using the Svelte web interface with a non-English language selected (e.g., French):
- **Article (URL) Input + Pattern:** The entire LLM response, including headings defined in the pattern template, is correctly translated into the selected language.
- **YouTube Input + Pattern:** Only the main content of the LLM response is translated. Headings defined in the pattern template remain in English.

This occurs even when using the same pattern for both input types.

## Analysis and Findings

1.  **Pattern Templates:** Pattern templates (e.g., `patterns/summarize/system.md`) contain hardcoded headings in English (e.g., `ONE SENTENCE SUMMARY:`, `MAIN POINTS:`).
2.  **Frontend Prompt Construction (`ChatService.ts`):**
    *   The frontend service (`createChatPrompt`) was identified as the central place to add language instructions to the prompt.
    *   It prepends `"You MUST respond in {language} language. All output must be in {language}."` to the system prompt and appends `"IMPORTANT: Respond in {language} language only."` to the user input if the language is not English.
3.  **Backend Prompt Construction (`core/chatter.go`):**
    *   The backend (`BuildSession` function) receives the request.
    *   It combines the pattern template content with any context to form the system message.
    *   Crucially, if a `language` field is present at the top level of the incoming `ChatRequest`, the backend appends its own instruction: `. Please use the language '{language}' for the output.` to the system message. It does **not** use the language instructions sent from the frontend within the `userInput` or `systemPrompt` fields.
4.  **Payload Discrepancy:**
    *   Initial analysis showed the payload sent from the frontend for **article input** correctly included the frontend's explicit language instructions in the `systemPrompt` and `userInput`.
    *   The payload for **YouTube input** was missing these explicit frontend instructions. It was also missing the top-level `language` field needed by the backend.

## Steps Taken

1.  **Centralized Frontend Logic:** Refactored `ChatInput.svelte` (`processYouTubeURL`) to remove redundant language instruction logic, ensuring it passes the plain transcript and system prompt to `ChatService.ts`.
2.  **Added Language Field to Request:** Modified `ChatService.ts` (`createChatRequest`) to add the `language` field (from `languageStore`) to the top level of the `ChatRequest` object sent to the backend.
3.  **Updated Interface:** Modified `web/src/lib/interfaces/chat-interface.ts` to add the optional `language?: string;` field to the `ChatRequest` interface to resolve TypeScript errors.

**Goal:** Ensure both YouTube and article flows send a `ChatRequest` with the top-level `language` field set, allowing the backend to consistently apply its language instruction (`. Please use the language '{language}' for the output.`).

## Why It Might Still Be Failing

Despite ensuring the `language` field is sent to the backend for both flows, the issue persists for YouTube input. Possible reasons include:

1.  **Backend Instruction Insufficient:** The backend's appended instruction (`. Please use the language '{language}' for the output.`) might be less effective than the frontend's original instruction ("You MUST respond..."). The LLM might still prioritize the prominent English headings from the pattern template over this less forceful backend instruction.
2.  **Backend Logic Error:** There might be a subtle condition in `core/chatter.go` (`BuildSession`) where the language instruction is not appended correctly even if the `language` field is present in the request.
3.  **Payload Verification Needed:** We haven't explicitly confirmed (via backend logs) that the `language` field is *actually present* in the request received by the backend for the YouTube flow after the latest changes.
4.  **Transcript Content Interference:** Something specific to the format or content of the YouTube transcript (as fetched by the backend) might be confusing the LLM's language processing.
5.  **LLM Variability:** Language models can sometimes exhibit inconsistent behavior based on subtle prompt differences or input types.

## Next Steps for Debugging

1.  **Verify Backend Payload:** Add logging in `restapi/chat.go` (`HandleChat`) immediately after `c.BindJSON(&request)` to print the full `request` struct and confirm the `language` field is populated for YouTube requests.
2.  **Review Backend Language Logic:** Carefully re-examine `core/chatter.go` (`BuildSession`) to ensure the `. Please use the language '{language}' for the output.` line is executed unconditionally whenever `request.Language` is not empty.
3.  **Strengthen Backend Instruction:** Modify the backend instruction in `core/chatter.go` to be more explicit, similar to the frontend's original instruction (e.g., "You MUST respond in {language}. ALL output, including headings, MUST be in {language}.").
4.  **Compare Full Prompts:** Log the *final* system message constructed by the backend in `BuildSession` just before it's added to the session messages. Compare this final system message for both YouTube and article flows to ensure they are identical except for the user input part.
5.  **Isolate Transcript:** Test by manually pasting the YouTube transcript content into the chat input (treating it like text input) with French selected. Does it work correctly then? This helps isolate whether the issue is related to the transcript content itself or the YouTube processing flow.
