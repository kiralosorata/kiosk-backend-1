import { v4 as uuidv4 } from 'uuid';

import { classifyTriage } from '../utils/openai.js';
import { sendCriticalEmail } from '../utils/email.js';
import * as Patient from '../models/patientModel.js';

function generateQueueNo(esi) {
  const prefix = ['A', 'B', 'C', 'D', 'E'][esi - 1] || 'Z';
  return prefix + Math.floor(100 + Math.random() * 900);
}

/** POST /api/triage */
export async function triagePatient(req, res) {
  try {
    const {
          name,
          age,
          complaint,
          painScale,
          symptomChecker,
          duration,
          bodyPart
        } = req.body;
    if ([painScale, symptomChecker, duration, bodyPart].some(v => v === undefined))
      return res.status(400).json({ error: 'Missing one of painScale, symptomChecker, duration, or bodyPart' });

    // include *all* nurse inputs in the prompt
    const promptLines = [
        `Patient age: ${age}`,
        `Chief complaint: ${complaint}`,
        `Pain scale (0–10): ${painScale}`,
        `Symptom description: ${symptomChecker}`,
        `Duration: ${duration}`,
        `Body part affected: ${bodyPart}`
      ];
    const { esi, reason } = await classifyTriage(promptLines.join('\n'));
    const queue = generateQueueNo(esi);

    const record = Patient.add({
      id: uuidv4(),
      name,
      age,
      complaint,
      painScale,
      symptomChecker,
      duration,
      bodyPart,
      esi,
      reason,
      queue,
      status: 'waiting',
      createdAt: Date.now()
    });

    // critical alert
    if (esi === 1) await sendCriticalEmail({ ...record });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/** GET /api/admin/patients */
export function getAllPatients(_req, res) {
  res.json(Patient.getAll());
}

/** PATCH /api/admin/patients/:id/status */
export function updatePatientStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const updated = Patient.updateStatus(id, status);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
}


/** PATCH /api/admin/patients/:id/vitals
 *  { bp, hr, rr, temp, spo2 }
 */
export async function updatePatientVitals(req, res) {
  try {
    const { id } = req.params;
    const { bp, hr, rr, temp, spo2 } = req.body;

    // 1. confirm all five vitals arrived
    if (![bp, hr, rr, temp, spo2].every(v => v !== undefined)) {
      return res.status(400).json({ error: 'All five vitals required' });
    }

    // 2. fetch the existing patient record
    const patient = Patient.getById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // 3. build a full prompt including age+complaint+vitals
    const prompt = [
      `Patient name: ${patient.name}`,
      `Age: ${patient.age}`,
      `Complaint: ${patient.complaint}`,
      `Blood Pressure: ${bp}`,
      `Heart Rate: ${hr}`,
      `Respiratory Rate: ${rr}`,
      `Temperature: ${temp}`,
      `Oxygen Saturation: ${spo2}`
    ].join('\n');

    // 4. re-classify
    const { esi, reason } = await classifyTriage(prompt);

    // 5. store vitals + new ESI + reason + history
    const updated = Patient.updateVitals(
      id,
      { bp, hr, rr, temp, spo2 },
      esi,
      reason
    );
    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }

    // 6. alert if critical
    if (esi === 1) {
      await sendCriticalEmail(updated);
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}




/** PATCH /api/admin/patients/:id/clear */
export function clearPatient(req, res) {
    const { id } = req.params;
    const updated = Patient.updateStatus(id, 'cleared');
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }
  
  /** DELETE /api/admin/patients/:id */
  export function deletePatient(req, res) {
    const ok = Patient.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.sendStatus(204); // No-Content
  }