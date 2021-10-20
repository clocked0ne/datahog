import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv();
addFormats(ajv);

const validateJsonSchema = (input: any, schema: any) => {
  const validate = ajv.compile(schema);

  if (validate(input)) {
    return {
      isValid: true,
	  validationErrors: null
    }
  } else {
    return {
      isValid: false,
	  validationErrors: validate.errors
    }
  }
};

export default validateJsonSchema;
