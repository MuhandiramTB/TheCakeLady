export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join('.');
        details[field] = issue.message;
      }
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.validatedBody = result.data;
    next();
  };
}
