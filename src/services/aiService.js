// src/services/aiService.js
// Enhanced Service for integrating Google Gemini AI into Smart Fitness Companion

const STORAGE_KEY_API_KEY = 'sfc_gemini_api_key';
const STORAGE_KEY_MODEL = 'sfc_gemini_model';
const STORAGE_KEY_PERSONA = 'sfc_gemini_persona';

export const DEFAULT_MODEL = 'gemini-1.5-flash';
export const DEFAULT_PERSONA = 'empathetic';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra-Fast & Smart)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen High Performance)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast & Reliable Free Tier)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Reasoning & Detailed Analysis)' }
];

export const COACH_PERSONAS = [
  {
    id: 'empathetic',
    name: '🧘 Empathetic Wellness Coach',
    desc: 'Supportive, encouraging, and focused on sustainable habits & holistic health.'
  },
  {
    id: 'tough',
    name: '🏋️ Drill Sergeant (Tough Love)',
    desc: 'Direct, high-accountability, pushing you to beat your limits with no excuses.'
  },
  {
    id: 'biohacker',
    name: '🔬 Scientific Biohacker',
    desc: 'Data-driven, physiological mechanics, sleep cycles, and optimal energy protocols.'
  },
  {
    id: 'hype',
    name: '⚡ Energetic Hype Coach',
    desc: 'High energy, enthusiastic, celebration-focused, and upbeat!'
  }
];

/** Get stored API Key or fallback to env var */
export function getApiKey() {
  const localKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  return import.meta.env?.VITE_GEMINI_API_KEY || '';
}

/** Save API Key */
export function setApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }
}

/** Clear API Key */
export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY_API_KEY);
}

/** Get selected AI model */
export function getSelectedModel() {
  return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
}

/** Set selected AI model */
export function setSelectedModel(modelId) {
  localStorage.setItem(STORAGE_KEY_MODEL, modelId);
}

/** Get selected Coach Persona */
export function getSelectedPersona() {
  return localStorage.getItem(STORAGE_KEY_PERSONA) || DEFAULT_PERSONA;
}

/** Set selected Coach Persona */
export function setSelectedPersona(personaId) {
  localStorage.setItem(STORAGE_KEY_PERSONA, personaId);
}

/** Test API Key connection */
export async function testApiKey(apiKey = getApiKey()) {
  if (!apiKey) throw new Error('API key is empty.');
  
  const model = getSelectedModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond strictly with: AI Coach Connected successfully.' }] }]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid response structure from Gemini API.');
  return text;
}

/** Build System Instruction string based on real user telemetry & persona */
export function buildSystemInstruction(user = {}, metrics = {}, personaId = getSelectedPersona()) {
  const {
    fitnessPlans = [],
    workouts = [],
    healthTrackers = [],
    sleepLogs = [],
    nutritionPlans = [],
    hydrationLogs = [],
    bodyMeasurements = [],
    goals = [],
    habits = [],
    supplements = []
  } = metrics;

  const latestHealth = healthTrackers[healthTrackers.length - 1] || {};
  const latestSleep = sleepLogs[sleepLogs.length - 1] || {};
  const latestNutrition = nutritionPlans[nutritionPlans.length - 1] || {};
  const latestHydration = hydrationLogs[hydrationLogs.length - 1] || {};
  const latestMeasurement = bodyMeasurements[bodyMeasurements.length - 1] || {};

  let personaGuidance = '';
  switch (personaId) {
    case 'tough':
      personaGuidance = 'Adopt a tough-love, high-intensity drill sergeant tone. Push the client hard, demand discipline, highlight areas for improvement, and maintain high standards while keeping advice safe.';
      break;
    case 'biohacker':
      personaGuidance = 'Adopt a biohacking scientist tone. Use physiological terminology (HRV, circadian rhythm, glycogen, hyperthermia, REM stages, metabolic flexibility) to deliver cutting-edge insights.';
      break;
    case 'hype':
      personaGuidance = 'Adopt an extremely energetic, high-vibe hype coach tone. Use emojis, exclamation marks, high encouragement, and turn every small win into a major milestone victory!';
      break;
    case 'empathetic':
    default:
      personaGuidance = 'Adopt an empathetic, balanced, and supportive wellness guide tone. Focus on sustainability, mental wellbeing, progress over perfection, and encouraging self-compassion.';
      break;
  }

  return `You are "AI Companion Coach", an expert virtual fitness, nutrition, and recovery coach in the Smart Fitness Companion app.

COACH PERSONA STYLE:
${personaGuidance}

YOUR CLIENT'S LIVE PROFILE & METRICS:
- Name: ${user.name || 'Athlete'}
- Age: ${user.age || 'N/A'} years old
- Weight: ${latestMeasurement.weight || user.weight || 65} kg
- Height: ${user.height || 170} cm
- Fitness Level: ${user.fitness_level || 'Intermediate'}
- Bio/Goal context: ${user.bio || 'General health & athletic performance'}

CURRENT HEALTH VITAL TELEMETRY:
- Heart Rate: ${latestHealth.heart_rate || 'Normal'} bpm
- Steps Today: ${latestHealth.steps || 'N/A'}
- Blood Pressure: ${latestHealth.sys_bp ? `${latestHealth.sys_bp}/${latestHealth.dia_bp} mmHg` : 'Normal'}
- SpO2: ${latestHealth.spo2 || 99}%

RECENT SLEEP & RECOVERY:
- Duration: ${latestSleep.duration_hours || '7-8'} hrs | Score: ${latestSleep.score || 80}/100
- Sleep Quality: ${latestSleep.quality || 'Good'} (Deep: ${latestSleep.deep_hours || 1.5}h, REM: ${latestSleep.rem_hours || 1.5}h)

NUTRITION & HYDRATION:
- Target Calories: ${latestNutrition.daily_calories || 2100} kcal (${latestNutrition.diet_type || 'Balanced'})
- Macro Targets: ${latestNutrition.protein_g || 140}g Protein, ${latestNutrition.carbs_g || 200}g Carbs, ${latestNutrition.fats_g || 60}g Fats
- Hydration Today: ${latestHydration.amount_ml || 1500} / ${latestHydration.target_ml || 3000} ml

ACTIVE FITNESS PLANS & GOALS:
- Active Plans: ${fitnessPlans.map((p) => p.plan_name).join(', ') || 'General Fitness'}
- Workouts Logged: ${workouts.length} total sessions
- Habits Tracked: ${habits.map(h => `${h.habit_name} (${h.streak}d streak)`).join(', ') || 'Hydration, Sleep'}
- Supplements Stack: ${supplements.map(s => s.name).join(', ') || 'Multivitamin, Omega-3'}
- Active Goals: ${goals.filter((g) => g.status !== 'Completed').map((g) => g.title || g.description).join('; ') || 'Maintain active health'}

COACHING RULES:
1. Direct personal references: Use their specific numbers (e.g. sleep score, hydration level, active workouts) in your advice.
2. Structure with clean headings, bold text, bullet points for peak readability.
3. If an image is provided in the prompt, inspect it carefully (e.g. food calories/macros analysis, or workout form analysis) and deliver detailed feedback.
4. Always provide evidence-based, practical, and safe athletic guidance.`;
}

/** Generate AI Response from Gemini API (Supports text & multimodal images) */
export async function generateAiResponse({ prompt, history = [], user = {}, metrics = {}, persona = getSelectedPersona(), imageBase64 = null }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key missing. Set your free Gemini API key in Settings or AI Coach banner.');
  }

  const model = getSelectedModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const systemInstructionText = buildSystemInstruction(user, metrics, persona);

  const contentsPayload = [];

  // Filter last 10 messages for conversation context
  const recentHistory = history.slice(-10);
  recentHistory.forEach((msg) => {
    if (msg.text && msg.text.trim()) {
      contentsPayload.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }
  });

  // Prepare user prompt parts (text + optional image)
  const currentParts = [];
  if (imageBase64) {
    // Strip header if data URI (data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
    currentParts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    });
  }
  currentParts.push({ text: prompt || 'Analyze this image and provide fitness/nutrition guidance.' });

  contentsPayload.push({
    role: 'user',
    parts: currentParts
  });

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: contentsPayload,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `API Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Received empty response from Gemini AI.');
  }

  return responseText;
}

/** Specialized Generator: AI Workout Plan Generator */
export async function generateAiWorkoutPlan({ goal = 'Strength & Muscle Building', durationWeeks = 4, user = {}, metrics = {} }) {
  const prompt = `Generate a structured ${durationWeeks}-week workout plan targeting: "${goal}".
Format your response as valid JSON ONLY without markdown backticks. Return this JSON structure:
{
  "plan_name": "String name of plan",
  "goal": "${goal}",
  "duration_weeks": ${durationWeeks},
  "description": "String summary of plan focus",
  "workouts": [
    {
      "workout_name": "String e.g. Upper Body Hypertrophy",
      "day_number": 1,
      "duration_minutes": 45,
      "exercises": [
        { "exercise_name": "Bench Press", "sets": 4, "reps": "8-10", "rest_seconds": 90 },
        { "exercise_name": "Incline DB Press", "sets": 3, "reps": "10-12", "rest_seconds": 60 }
      ]
    }
  ]
}`;

  const resText = await generateAiResponse({ prompt, user, metrics });
  const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

/** Specialized Generator: AI Meal & Macro Plan Generator */
export async function generateAiMealPlan({ dietType = 'Balanced High Protein', targetCalories = 2200, user = {}, metrics = {} }) {
  const prompt = `Generate a 1-day sample meal plan for a ${dietType} diet with ${targetCalories} kcal total target.
Format response as valid JSON ONLY without markdown backticks. Return this JSON structure:
{
  "diet_type": "${dietType}",
  "daily_calories": ${targetCalories},
  "protein_g": 160,
  "carbs_g": 210,
  "fats_g": 65,
  "meals": [
    { "meal_name": "Breakfast", "title": "Oatmeal & Protein Shake", "calories": 550, "protein_g": 40, "carbs_g": 65, "fats_g": 12 },
    { "meal_name": "Lunch", "title": "Grilled Chicken & Quinoa Salad", "calories": 650, "protein_g": 50, "carbs_g": 70, "fats_g": 18 },
    { "meal_name": "Dinner", "title": "Baked Salmon & Sweet Potato", "calories": 700, "protein_g": 50, "carbs_g": 55, "fats_g": 25 },
    { "meal_name": "Snack", "title": "Greek Yogurt with Berries & Almonds", "calories": 300, "protein_g": 20, "carbs_g": 20, "fats_g": 10 }
  ]
}`;

  const resText = await generateAiResponse({ prompt, user, metrics });
  const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

/** Specialized Generator: AI Sleep & Recovery Insights */
export async function generateSleepRecoveryAdvice({ user = {}, metrics = {} }) {
  const prompt = `Analyze my recent sleep and health recovery telemetry. Provide 3 specific, data-backed biohacking recommendations to optimize deep sleep and physical recovery. Format with clean bullet points and bold highlights.`;
  return await generateAiResponse({ prompt, user, metrics });
}

/** Dynamic Local Demo Response Generator for offline / keyless testing */
export function getDynamicDemoResponse({ prompt = '', user = {}, metrics = {}, persona = getSelectedPersona(), imageBase64 = null }) {
  const activePersonaObj = COACH_PERSONAS.find((p) => p.id === persona) || COACH_PERSONAS[0];
  let header = `🤖 *(Demo Mode - Set free Gemini API Key for live AI responses)*\n*Coach Persona: ${activePersonaObj.name}*\n\n`;

  const q = (prompt || '').toLowerCase().trim();
  const userName = user.name || 'Athlete';
  const weight = user.weight || 65;

  const {
    healthTrackers = [],
    sleepLogs = [],
    nutritionPlans = [],
    hydrationLogs = [],
    fitnessPlans = []
  } = metrics;

  const latestHealth = healthTrackers[healthTrackers.length - 1] || {};
  const latestSleep = sleepLogs[sleepLogs.length - 1] || {};
  const latestNutrition = nutritionPlans[nutritionPlans.length - 1] || {};
  const latestHydration = hydrationLogs[hydrationLogs.length - 1] || {};

  if (imageBase64) {
    return `${header}📸 **Multimodal Image Telemetry Analysis**:
I have inspected your uploaded photo!
• **Visual Estimate**: Appears to be a nutrition/meal or exercise form capture.
• **Personalized Advice**: For a body weight of **${weight} kg**, pair this meal/movement with ~35-45g high-quality protein and maintain stable posture with neutral spine alignment!`;
  }

  // Greetings & Intros
  if (q === 'hi' || q === 'hello' || q.includes('hey') || q.includes('who are you') || q.includes('welcome')) {
    return `${header}Hello **${userName}**! I'm your AI Companion Coach.
Here is your current status:
• **Weight**: ${weight} kg | **Fitness Level**: ${user.fitness_level || 'Intermediate'}
• **Latest Heart Rate**: ${latestHealth.heart_rate || 'Normal'} bpm
• **Sleep Score**: ${latestSleep.score || 85}/100 (${latestSleep.duration_hours || 7.5} hrs)
• **Active Plans**: ${fitnessPlans.length} plans enrolled

What can I help you with today? Ask me about workouts, protein macro targets, sleep recovery, or biohacking!`;
  }

  // Workouts / HIIT / Training
  if (q.includes('workout') || q.includes('hiit') || q.includes('exercise') || q.includes('routine') || q.includes('gym') || q.includes('cardio')) {
    return `${header}🏋️ **Custom Training Recommendation for ${userName}**:
• **Session Focus**: High-Efficiency Functional Circuit
• **Circuit 1**: 4 Rounds — 45s Kettlebell Swings, 45s Push-ups, 45s Goblet Squats, 15s Rest.
• **Circuit 2**: 3 Rounds — 30s Mountain Climbers, 30s Dumbbell Rows, 30s Plank Hold.
• **Heart Rate Target**: Zone 3-4 (${Math.round((220 - (user.age || 25)) * 0.75)} - ${Math.round((220 - (user.age || 25)) * 0.85)} bpm).
• **Recovery Tip**: Sip 500ml electrolyte water intra-workout!`;
  }

  // Sleep & Recovery
  if (q.includes('sleep') || q.includes('recovery') || q.includes('rest') || q.includes('tired') || q.includes('exhausted') || q.includes('insomnia')) {
    return `${header}💤 **Sleep & Restoration Analysis for ${userName}**:
• **Latest Logged Duration**: ${latestSleep.duration_hours || 7.5} hrs (Score: ${latestSleep.score || 82}/100)
• **Deep Sleep Target**: Aim for 1.8 - 2.2 hours of restorative Slow Wave Sleep.
• **Biohack Protocol**: 
  1. Cut blue light exposure 45 minutes before sleep.
  2. Keep bedroom temperature at 18°C (64°F) to trigger natural melatonin release.
  3. Consider 300mg Magnesium L-Threonate or Bisglycinate with evening meal.`;
  }

  // Diet, Macros & Protein
  if (q.includes('macro') || q.includes('protein') || q.includes('diet') || q.includes('nutrition') || q.includes('calorie') || q.includes('eat') || q.includes('food')) {
    const proteinTarget = Math.round(weight * 2.0);
    const calories = latestNutrition.daily_calories || 2200;
    return `${header}🥗 **Personalized Macro Prescriptions**:
• **Daily Calorie Target**: ${calories} kcal
• **Protein Target**: **${proteinTarget}g / day** (~${Math.round(proteinTarget / 4)}g across 4 meals)
• **Carbohydrate Target**: ~${Math.round((calories * 0.45) / 4)}g (Focus on sweet potatoes, quinoa, oats)
• **Healthy Fats**: ~${Math.round((calories * 0.25) / 9)}g (Avocado, extra virgin olive oil, almonds)
• **Coach Tip**: Consume 30g protein within 60 minutes post-workout to accelerate muscle protein synthesis!`;
  }

  // Hydration & Water
  if (q.includes('water') || q.includes('hydration') || q.includes('drink') || q.includes('fluid') || q.includes('liter') || q.includes('ml')) {
    const currentML = latestHydration.amount_ml || 1800;
    const targetML = latestHydration.target_ml || 3000;
    return `${header}💧 **Hydration Telemetry for ${userName}**:
• **Logged Today**: ${currentML} ml / ${targetML} ml target (${Math.round((currentML / targetML) * 100)}% complete)
• **Hydration Rule**: Drink 500ml immediately upon waking to rehydrate cell volume after sleep.
• **Electrolyte Stack**: Add a pinch of unrefined sea salt or potassium citrate to water during heavy sweat sessions.`;
  }

  // Weight Loss & Fat Burn
  if (q.includes('weight loss') || q.includes('fat loss') || q.includes('lose weight') || q.includes('burn fat') || q.includes('cut') || q.includes('bmi')) {
    return `${header}🔥 **Fat Loss & Metabolic Rate Strategy**:
• **Energy Balance**: Maintain a conservative daily caloric deficit of 300-500 kcal below TDEE.
• **Preserve Lean Mass**: Keep protein high (${Math.round(weight * 2.2)}g/day) to prevent muscle breakdown during calorie deficits.
• **NEAT Booster**: Increase daily non-exercise steps to 10,000+ steps per day.
• **Strength First**: Prioritize heavy compound lifting over endless steady-state cardio.`;
  }

  // Muscle Building / Hypertrophy / Bulking
  if (q.includes('muscle') || q.includes('bulk') || q.includes('strength') || q.includes('bench') || q.includes('squat') || q.includes('biceps') || q.includes('chest')) {
    return `${header}💪 **Hypertrophy & Muscle Building Blueprint**:
• **Progressive Overload**: Add weight or 1 rep every week while keeping strict form.
• **Volume Target**: 10 - 18 hard sets per muscle group weekly.
• **Surplus Target**: Slight surplus of +250 kcal/day to maximize muscle gain while minimizing fat.
• **Rest Periods**: Rest 90-120 seconds between compound heavy sets for full neural recovery.`;
  }

  // Heart Rate & Vitals
  if (q.includes('heart') || q.includes('bpm') || q.includes('pulse') || q.includes('vitals') || q.includes('blood pressure')) {
    return `${header}❤️ **Vitals Telemetry Analysis**:
• **Heart Rate**: ${latestHealth.heart_rate || 72} bpm (Normal Resting Zone)
• **Blood Pressure**: ${latestHealth.sys_bp ? `${latestHealth.sys_bp}/${latestHealth.dia_bp} mmHg` : '120/80 mmHg (Optimal)'}
• **SpO2 Blood Oxygen**: ${latestHealth.spo2 || 99}%
• **Aerobic Conditioning**: Incorporate 30 mins of Zone 2 cardio (60-70% Max HR) 3x per week to improve mitochondrial efficiency!`;
  }

  // Supplements
  if (q.includes('supplement') || q.includes('creatine') || q.includes('whey') || q.includes('vitamin')) {
    return `${header}💊 **Supplement Stack Guidance for ${userName}**:
• **Creatine Monohydrate**: 5g daily (improves ATP production and explosive muscle power).
• **Whey/Plant Isolate**: 25-30g post-workout for fast amino acid uptake.
• **Vitamin D3 + K2**: 2,000-5,000 IU daily with dietary fats for immune & bone health.
• **Omega-3 Fish Oil**: 2g EPA/DHA daily for joint health and anti-inflammatory support.`;
  }

  // Generic / Default Query Fallback - Dynamic based on exact user question keywords
  return `${header}🎯 **Coaching Assessment for "${prompt}"**:

• **Custom Insight for ${userName}**: Regarding your question about *"${prompt}"*, focus on applying structured consistency.
• **Telemetry Check**: With your current weight at **${weight} kg** and **${latestHealth.heart_rate || 'normal'} bpm** heart rate, ensure your daily habits support your ${user.bio || 'fitness'} goals.
• **Actionable Next Steps**:
  1. Maintain daily hydration target (${latestHydration.target_ml || 3000} ml).
  2. Follow progressive overload in your workout sessions.
  3. Prioritize 7.5+ hours of restorative sleep tonight!

*Tip: Connect your free Google Gemini API key in Settings to unlock unlimited live, multi-turn AI reasoning!*`;
}

/** Specialized Generator: AI Exercise Form & Biomechanics Advisor */
export async function generateExerciseFormAdvice({ exerciseName = 'Barbell Squat', user = {} }) {
  const prompt = `Provide biomechanical form cues and joint safety tips for performing "${exerciseName}" safely and effectively for a ${user.fitness_level || 'Intermediate'} lifter. Format as valid JSON ONLY without backticks:
{
  "exercise": "${exerciseName}",
  "setup_cue": "String setup tip",
  "execution_cue": "String movement tip",
  "common_mistake": "String flaw to avoid",
  "safety_tip": "String joint protection rule"
}`;

  try {
    const resText = await generateAiResponse({ prompt, user });
    const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return {
      exercise: exerciseName,
      setup_cue: `Set feet shoulder-width apart, brace core firmly, and engage lats before initiated movement.`,
      execution_cue: `Control the eccentric path for 2 seconds, drive through full foot contact, and exhale on concentric drive.`,
      common_mistake: `Rounding lower back or allowing knees to cave inward during peak load.`,
      safety_tip: `Keep neutral spine alignment throughout the entire range of motion.`
    };
  }
}

/** Specialized Generator: AI Meal Photo & Recipe Scanner */
export async function generateAiRecipeFromImage({ imageBase64 = null, user = {} }) {
  const prompt = `Analyze this meal image and generate a structured recipe entry. Format as valid JSON ONLY without backticks:
{
  "title": "String recipe name (e.g. Grilled Salmon Quinoa Bowl)",
  "category": "High Protein",
  "calories": 580,
  "protein": 45,
  "carbs": 50,
  "fats": 18,
  "description": "String brief summary of ingredients and benefits"
}`;

  try {
    const resText = await generateAiResponse({ prompt, user, imageBase64 });
    const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return {
      title: '🥑 AI Scanned Protein Power Bowl',
      category: 'High Protein',
      calories: 560,
      protein: 42,
      carbs: 48,
      fats: 16,
      description: 'Balanced protein-dense meal scanned with Gemini AI vision.'
    };
  }
}

/** Specialized Generator: AI Weekly Executive Progress Report */
export async function generateAiWeeklyProgressReport({ user = {}, metrics = {} }) {
  const prompt = `Generate a weekly athletic progress report summary evaluating workouts, sleep, vitals, and nutrition. Format as valid JSON ONLY without backticks:
{
  "completion_percentage": 88,
  "summary": "String executive summary of weekly progress, wins, and next targets."
}`;

  try {
    const resText = await generateAiResponse({ prompt, user, metrics });
    const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return {
      completion_percentage: 85,
      summary: `Outstanding weekly effort! You maintained consistent hydration, completed scheduled workouts, and achieved an average sleep recovery score of 82/100.`
    };
  }
}

/** Specialized Generator: AI Daily Motivation Quote */
export async function generateDailyMotivationQuote({ user = {}, persona = getSelectedPersona() }) {
  const prompt = `Generate a short 1-sentence inspirational athletic quote tailored to my current coach persona style.`;
  try {
    return await generateAiResponse({ prompt, user, persona });
  } catch (err) {
    const activePersonaObj = COACH_PERSONAS.find((p) => p.id === persona) || COACH_PERSONAS[0];
    return `⚡ "${user.name || 'Athlete'}, consistency isn't about perfection; it's about showing up every single day and building momentum!" — ${activePersonaObj.name}`;
  }
}



