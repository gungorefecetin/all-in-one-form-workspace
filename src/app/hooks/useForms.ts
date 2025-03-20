import { useAppSelector } from '@/app/hooks/redux';
import { Form } from '@/app/types/form';

export const useForms = () => {
  const formsRecord = useAppSelector((state) => state.formBuilder.forms);
  const forms = Object.values(formsRecord);

  return {
    forms,
  };
}; 