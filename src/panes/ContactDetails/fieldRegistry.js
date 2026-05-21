import { TextField } from './fields/TextField.jsx';
import { PhoneField } from './fields/PhoneField.jsx';
import { NumberField } from './fields/NumberField.jsx';
import { DateField } from './fields/DateField.jsx';
import { ChoiceField } from './fields/ChoiceField.jsx';
import { BooleanField } from './fields/BooleanField.jsx';
import { TagsField } from './fields/TagsField.jsx';

export const fieldRegistry = {
  string: TextField,
  email: TextField,
  url: TextField,
  textarea: TextField,
  phone: PhoneField,
  number: NumberField,
  currency: NumberField,
  date: DateField,
  radio: ChoiceField,
  'multi-select': ChoiceField,
  boolean: BooleanField,
  tags: TagsField,
};
