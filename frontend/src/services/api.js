/**
 * CrimeVision AI - Backend API Integration Client
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchCases() {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to load cases');
  return res.json();
}

export async function fetchCase(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error('Failed to load case details');
  return res.json();
}

export async function uploadEvidenceFile(caseId, file, title, source, type) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('source', source);
  formData.append('evidence_type', type);

  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload evidence');
  return res.json();
}

export async function queryAIChat(caseId, message, history = []) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      case_id: caseId,
      message,
      history,
    }),
  });
  if (!res.ok) throw new Error('AI query failed');
  return res.json();
}

export async function downloadReportPdf(caseId, investigatorNotes = '') {
  const res = await fetch(`${API_BASE}/cases/${caseId}/report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      investigator_notes: investigatorNotes,
    }),
  });
  if (!res.ok) throw new Error('Failed to generate PDF report');
  
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `CrimeVision_Forensic_Dossier_${caseId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
