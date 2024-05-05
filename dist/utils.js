function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function capitalizeKeys(obj) {
  const newObj = {};
  for (const [oldKey, value] of Object.entries(obj)) {
    const newKey = capitalize(oldKey);
    if (newKey === oldKey) {
      newObj[oldKey] = value;
      continue;
    }
    newObj[newKey] = value;
  }
  return newObj;
}
//# sourceMappingURL=utils.js.map
