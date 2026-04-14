/* eslint-disable @typescript-eslint/no-unused-vars */
type objectType = {
  [key: string]: any;
};

export const checkIfFormHasChanges = (form: objectType, data: objectType) => {
  let isChanged = false;
  Object.entries(form).forEach(([key, value]) => {
    if (data[key] !== value) {
      isChanged = true;
    }
  });
  return isChanged;
};
