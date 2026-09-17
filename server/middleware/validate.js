// Lightweight request body validator (no external dependency).
// rules: { fieldName: { required: true, type: 'string'|'number'|'boolean', min, max, enum: [] } }
function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = body[field];
      const isMissing = value === undefined || value === null || value === '';

      if (rule.required && isMissing) {
        errors.push(`${field} is required.`);
        return;
      }
      if (isMissing) return; // optional and not provided, skip further checks

      if (rule.type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${field} must be a number.`);
      }
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string.`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}.`);
      }
      if (rule.min !== undefined && Number(value) < rule.min) {
        errors.push(`${field} must be at least ${rule.min}.`);
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        errors.push(`${field} must be at most ${rule.max}.`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }
    next();
  };
}

module.exports = { validateBody };
