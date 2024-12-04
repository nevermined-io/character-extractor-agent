import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

/**
 * Class responsible for extracting character descriptions from a script using LangChain and OpenAI.
 */
export class CharacterExtractor {
  private chain: RunnableSequence<{ script: string }, Record<string, any>[]>;

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
      `You are an expert at analyzing film scripts. Extract a list of characters from the following script. 

For each character, provide the following details as a JSON object:
- name: (string) The name of the character or a placeholder like "Unnamed Character" if no name is given.
- age: (string) A description of the character's age, e.g., "30s" or "child".
- gender: (string) The gender of the character, e.g., "male", "female", or "non-binary".
- species: (string) The species of the character, e.g., "human", "alien", or "animal".
- physical_description: (string) A description of the character's physical appearance.
- attire: (string) A description of the character's clothing or outfit.
- personality_traits: (string) A summary of the character's personality.
- role: (string) The role of the character in the story, e.g., "protagonist", "villain", or "side character".
- scene_description: (string) A description of the scene or context where the character appears.
- additional_notes: (string) Any additional relevant details about the character.

The JSON output should be an array of objects, with one object for each character. Example:

[
  {{
    "name": "Jane Doe",
    "age": "30s",
    "gender": "female",
    "species": "human",
    "physical_description": "long brown hair, blue eyes, 5'6\"",
    "attire": "casual attire with a red scarf",
    "personality_traits": "outgoing and caring",
    "role": "protagonist",
    "scene_description": "Outdoor scene in a park, sunny day",
    "additional_notes": "Wears a bracelet with sentimental value"
    }},
  {{
    "name": "Unnamed Alien",
    "age": "100s",
    "gender": "unknown",
    "species": "extraterrestrial",
    "physical_description": "green slimy skin, tall with tentacles",
    "attire": "formal attire with a regal crown",
    "personality_traits": "wise and mysterious",
    "role": "council member",
    "scene_description": "Meeting in a grand hall with other aliens",
    "additional_notes": "Speaks with a deep, resonant voice"
    }}
]

Script:
{script}

Output an array of JSON objects only.
Details from each character should not reference other characters or the script itself, as they will be processed independently.
All the characters provided in the script should be extracted, even if they are minor or unnamed characters.`
    );

    // Create a character extraction chain using LangChain's RunnableSequence
    this.chain = RunnableSequence.from([prompt, llm, new JsonOutputParser()]);
  }

  /**
   * Extracts character information from the given script.
   * @param script - The script to analyze.
   * @returns An array of character objects.
   */
  async extractCharacters(script: string): Promise<object[]> {
    try {
      // Execute the extraction chain with the input script
      const extractedData = await this.chain.invoke({ script });
      return extractedData;
    } catch (error) {
      console.error(`Error during character extraction: ${error}`);
      throw error;
    }
  }
}
