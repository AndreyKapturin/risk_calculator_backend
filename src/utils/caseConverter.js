export const convertCamelToSnakeCase = (string) => {
  return string.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
}