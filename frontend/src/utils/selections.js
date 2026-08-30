const KEY = 'voting_selections';

export function getSelections() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function setSelection(positionId, candidateId) {
  const next = { ...getSelections(), [positionId]: candidateId };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSelections() {
  sessionStorage.removeItem(KEY);
}
