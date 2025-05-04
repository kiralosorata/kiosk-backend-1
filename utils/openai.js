import { OpenAI } from 'openai';
// ⚠️  HARD-CODED FOR LOCAL TESTING ONLY  ⚠️
const openai = new OpenAI({
  apiKey: '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'
});

/**
 * Returns { esi: 1-5, reason: string }
 */
export async function classifyTriage(complaint) {
  const messages = [
    {
      role: 'system',
      content:
        'You are an emergency-department triage nurse. ' +
        'Use the patient’s age, complaint, pain scale, symptom description, duration, and affected body part. ' +
        'If available use the Patients vital (BP, HR, RR, Temp, SpO₂) ' +
        'to decide an ESI level.' +
        'Return ONLY valid JSON like {"esi":3,"reason":"…"}'
    },
    { role: 'user', content: `Patient complaint: ${complaint}` }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 100,
    temperature: 0
  });

  return JSON.parse(completion.choices[0].message.content.trim());
}
