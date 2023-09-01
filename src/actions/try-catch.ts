'use server';

export const tryCatch =
  <T = any>(action: (formData: FormData) => Promise<T>) =>
  (formData: FormData) =>
    action(formData)
      .then((res) => res)
      .catch((err: any) => {
        console.error(err);
        return;
      });
