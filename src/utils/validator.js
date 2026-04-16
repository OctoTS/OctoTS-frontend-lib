export const validateConfig = (config, requiredKeys) => {
  if (!config) return { isValid: false, missingKeys: requiredKeys };
  
  const missingKeys = requiredKeys.filter(key => !config[key]);
  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};
