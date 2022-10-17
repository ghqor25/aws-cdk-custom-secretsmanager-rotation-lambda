const toBoolean = (target: string) => {
   if (target === 'true') return true;
   else if (target === 'false') return false;
   else throw Error(`wrong target: ${target}`);
};

export { toBoolean };
