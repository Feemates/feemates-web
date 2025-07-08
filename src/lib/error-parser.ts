import axios, { AxiosError } from 'axios';

function isObject(o: any) {
  return o instanceof Object && o.constructor === Object;
}

const findErrorMessage = (entity: any, errorKey?: string): string => {
  const errorMessage = 'Something went wrong';

  if (!entity) {
    return errorMessage;
  } else if (typeof entity === 'string') {
    return entity;
  } else if (isObject(entity)) {
    if (errorKey && errorKey in entity) {
      const selectedElement = entity?.[errorKey];
      return findErrorMessage(selectedElement);
    }

    const firstKey = Object.keys?.(entity)?.[0];
    const firstElement = entity?.[firstKey];
    return findErrorMessage(firstElement);
  } else if (Array.isArray(entity)) {
    return findErrorMessage(entity?.[0]);
  } else {
    return errorMessage;
  }
};

export const errorParser = (e: Error | AxiosError | unknown, errorKey?: string) => {
  //  if directly errorMessage is sent to us
  if (typeof e === 'string') {
    return e;
  }

  if (!axios.isAxiosError(e)) {
    // native error

    const data = (e as unknown as any)?.message;
    return findErrorMessage(data, errorKey);
  } else {
    // axios error

    const data = e.response?.data as unknown as any;

    if (errorKey && data?.[errorKey]) {
      return findErrorMessage(data?.[errorKey], errorKey);
    }

    if (data?.validationErrors) {
      return findErrorMessage(data?.validationErrors, errorKey);
    }

    if (data?.message) {
      return findErrorMessage(data?.message, errorKey);
    }

    if (data?.error) {
      return findErrorMessage(data?.error, errorKey);
    }

    if (data?.errors) {
      return findErrorMessage(data?.errors, errorKey);
    }

    // no case matches
    return 'Something went wrong';
  }
};
