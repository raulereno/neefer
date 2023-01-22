export const validateSend = (form) => {
  console.log(form);
  let errors = {};
  if (!form.name) {
    errors.name = "Enter a name please";
  }
  if (!form.description) {
    errors.description = "Entear a description please";
  }
  if (!form.email) {
    errors.email = "Entear a mail please";
  }
  if (!form.chain) {
    errors.chain = "Select a chain please";
  }
  if (!form.properties[0].key || !form.properties[0].value) {
    errors.properties = "Enter at least one property";
  }

  return errors;
};
