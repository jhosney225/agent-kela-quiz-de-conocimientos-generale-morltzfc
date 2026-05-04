import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: string[];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function generateQuestions(): Promise<Question[]> {
  console.log("\n🔄 Generando preguntas de quiz...\n");

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Genera exactamente 5 preguntas de trivia de conocimientos generales en JSON. 
        Cada pregunta debe tener:
        - id (número del 1 al 5)
        - question (texto de la pregunta)
        - options (array de 4 opciones)
        - correctAnswer (la respuesta correcta, debe ser exactamente una de las opciones)
        - explanation (breve explicación de por qué es correcta)
        
        Retorna SOLO el JSON válido sin markdown ni explicación adicional.
        
        Formato esperado:
        [
          {
            "id": 1,
            "question": "pregunta aquí",
            "options": ["opción1", "opción2", "opción3", "opción4"],
            "correctAnswer": "opción correcta",
            "explanation": "explicación"
          }
        ]`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Clean up markdown if present
  let cleanedText = responseText
    .replace(/