import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '20mb' })); // support large image base64 uploads

// Initialize Gemini SDK with telemetry User-Agent as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Image Analysis for Civic Issues
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType, nearbyIssues, categoryHint, descriptionHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    // Format nearby issues for duplicate check prompt
    const reportsText = nearbyIssues && Array.isArray(nearbyIssues) && nearbyIssues.length > 0
      ? nearbyIssues.map((issue: any) => 
          `- ID: ${issue.reportId}, Category: ${issue.category}, Title: "${issue.title}", Severity: ${issue.severity}, Location: (${issue.latitude}, ${issue.longitude}), Address: "${issue.address}", Status: "${issue.status}"`
        ).join('\n')
      : 'None';

    const prompt = `
      You are an expert civic inspector. Analyze the attached photo of a municipal hazard or infrastructure issue in Indore, Madhya Pradesh, India.
      
      Hints provided by the citizen reporting the issue:
      - Category Hint: ${categoryHint || 'None'}
      - Citizen's description: ${descriptionHint || 'None'}
      
      Nearby Active Issues in the database (use these to detect potential duplicates):
      ${reportsText}

      Perform the following duties:
      1. Assess if the image quality is clear enough to identify a civic problem. If it's extremely blurry, dark, or has nothing to do with street issues (e.g. is a selfie or blank image), set isImageClear to false and provide feedback.
      2. Identify the issue, generate an elegant, brief startup-style Title.
      3. Generate a highly professional, detailed Description.
      4. Classify the issue into one of these categories:
         'Pothole', 'Water Leakage', 'Garbage', 'Broken Streetlight', 'Road Damage', 'Drainage', 'Traffic Signal', 'Illegal Dumping', 'Public Safety', 'Tree Fallen', 'Other'
      5. Estimate Severity (Low, Medium, High, Critical).
      6. Estimate Urgency (e.g., "Immediate Action", "Within 24 Hours", "Within 3 Days", "Routine").
      7. Estimate typical repair cost in Indian Rupees (INR) - e.g. pothole is 2000-5000, broken streetlight is 3000, major water leakage is 8000, garbage clean up is 1000. Give a single integer average.
      8. Predict typical resolution time (e.g., "48 Hours", "3 Days", "5 Days").
      9. Recommend the specific municipal department responsible in Indore (e.g. "IMC Waste Management Department", "MP Electricity Board (MPPKVVCL)", "IMC Water Works Division", "Indore Traffic Police", "IMC Public Works Department").
      10. Scan the Nearby Active Issues. If there is an issue of the exact same type at approximately the same location, set isDuplicateNearby to true and identify the duplicateReportId. Otherwise, false.
      11. Suggest a polished, constructive version of the citizen's description for official reports in suggestedWording.
      12. Generate a 2-sentence citizen-friendly summary.
    `;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [imagePart, { text: prompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Brief concise title for the issue' },
            description: { type: Type.STRING, description: 'Formal civic problem description' },
            category: { 
              type: Type.STRING, 
              description: 'Must match one of standard categories: Pothole, Water Leakage, Garbage, Broken Streetlight, Road Damage, Drainage, Traffic Signal, Illegal Dumping, Public Safety, Tree Fallen, Other' 
            },
            severity: { 
              type: Type.STRING, 
              description: 'Low, Medium, High, or Critical' 
            },
            urgency: { type: Type.STRING, description: 'Est. Urgency level' },
            estimatedCost: { type: Type.INTEGER, description: 'Estimated repair cost in INR as integer' },
            predictedResolutionTime: { type: Type.STRING, description: 'Estimated repair duration' },
            recommendedDepartment: { type: Type.STRING, description: 'Indore municipal department recommended' },
            isDuplicateNearby: { type: Type.BOOLEAN, description: 'True if there is another report in Nearby Issues representing the exact same hazard' },
            duplicateReportId: { type: Type.STRING, description: 'The ID of the duplicate report if found' },
            suggestedWording: { type: Type.STRING, description: 'A more polished citizen description suggestion' },
            summary: { type: Type.STRING, description: 'A brief 2-sentence summary' },
            isImageClear: { type: Type.BOOLEAN, description: 'False if image is bad, unrelated, or too blurry' },
            feedbackMessage: { type: Type.STRING, description: 'Instructions if image is bad (e.g. please upload a clearer picture)' }
          },
          required: [
            'title',
            'description',
            'category',
            'severity',
            'urgency',
            'estimatedCost',
            'predictedResolutionTime',
            'recommendedDepartment',
            'isDuplicateNearby',
            'suggestedWording',
            'summary',
            'isImageClear'
          ],
        },
      },
    });

    const resultText = response.text?.trim() || '{}';
    const resultObj = JSON.parse(resultText);
    res.json(resultObj);
  } catch (err: any) {
    console.error('Analyze API Error:', err);
    res.status(500).json({ error: err.message || 'Error occurred during AI analysis.' });
  }
});

// Endpoint: AI Civic Assistant (Chatbot Agent)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, reportsContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No user message provided.' });
    }

    // Format active reports context to ground the assistant in local reality
    const reportsText = reportsContext && Array.isArray(reportsContext) && reportsContext.length > 0
      ? reportsContext.map((issue: any) => 
          `- [ID: ${issue.reportId}] "${issue.title}" (${issue.category}) - Status: ${issue.status}, Severity: ${issue.severity}, Location: ${issue.address || 'Indore'}, Ward: ${issue.ward}, Upvotes: ${issue.upvotesCount || 0}, Verifications: ${issue.verificationsCount || 0}`
        ).join('\n')
      : 'No active reports are logged currently in Indore.';

    const systemInstruction = `
      You are "Indore Civic AI Friend", the official, highly polite, and hyper-local civic AI assistant for SpotFix in Indore, Madhya Pradesh.
      
      Your goal is to assist citizens and municipal administrators in reporting, tracking, and understanding civic infrastructure issues.
      
      Active Reports logged in SpotFix currently:
      ${reportsText}

      Your instructions:
      1. Be helpful, polite, optimistic, and highly knowledgeable about Indore (mention famous spots like Rajwada, Chappan Dukan, Sarafa, Palasia, Vijay Nagar, Bhawarkua if relevant to geographic questions).
      2. Answer civic concerns: e.g. tell the user who resolves broken streetlights (MP Electricity Board / MPPKVVCL) or potholes (IMC Public Works Department).
      3. If asked about the status of an issue or "has someone reported X", look through the Active Reports context provided above. Identify relevant reports near that location or matching the category and inform the user.
      4. If asked "Which issues are critical today?", look through the Active Reports, identify any report where Severity is "Critical" or "High", and summarize them beautifully.
      5. Keep responses concise, clear, and structured with bullet points where appropriate. Write in Markdown.
      6. For simple Greetings, respond warmly. Maintain a professional yet friendly "Indore Proud" startup vibe (Indore is India's cleanest city, so celebrate that!).
    `;

    // Map history to Google GenAI format (role: user/model, parts: [{text}])
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({ reply: response.text || 'I could not generate a response.' });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: err.message || 'Error occurred during AI Chat assistant.' });
  }
});

// Configure Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SpotFix] Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();
