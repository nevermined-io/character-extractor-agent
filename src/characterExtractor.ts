// src/characterExtractor.ts

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

/**
 * Class responsible for extracting character descriptions from a script using LangChain and OpenAI.
 */
export class CharacterExtractor {
  private chain: RunnableSequence<{ script: string }, string>;

  /**
   * Initializes the CharacterExtractor with the OpenAI API key.
   * @param apiKey - The OpenAI API key.
   */
  constructor(apiKey: string) {
    // Initialize the OpenAI language model
    const llm = new ChatOpenAI({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      apiKey,
    });

    // Define a prompt template for the character extraction task
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are an expert at analyzing film scripts. Extract a list of characters from the following script. For each character, provide as many details as possible, including their

- age
- gender
- species
- race
- height
- physical_description
- attire
- personality_traits
- role
- additional_notes.

These details will be prompted to a text-to-image model to generate visual representations of the characters, so be as visually descriptive as possible, including any unique or distinguishing features, clothing, or accessories, excluding any character elements that will be ignored by the model.
These details will be comma-separated and the most important details should be at the beginning of the list, enclosed in parentheses.
Also describe the setting, mood, and any other relevant details to set the scene in which every character appears.

Example:
- Female, 30s, human, white, 5'6", long brown hair, friendly blue eyes, casual attire, red scarf, outgoing, caring, outdoor scene
- (Alien), 100s, extraterrestrial, green, 7'0", slimy skin, tentacles, formal attire, regal crown, wise, mysterious, council member

Details from each character should not reference other characters or the script itself, as they will be processed independently.

All the characters provided in the script should be extracted, even if they are minor or unnamed characters.

Script:
{script}

Extracted Characters:`
    );

    // Create a character extraction chain using LangChain's RunnableSequence
    this.chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);
  }

  /**
   * Extracts character information from the given script.
   * @param script - The script to analyze.
   * @returns The extracted character information as a JSON string.
   */
  async extractCharacters(script: string): Promise<string> {
    try {
      // Execute the extraction chain with the input script
      const extractedData = await this.chain.invoke({ script });
      return extractedData.trim();
    } catch (error) {
      console.error(`Error during character extraction: ${error}`);
      throw error;
    }
  }
}
