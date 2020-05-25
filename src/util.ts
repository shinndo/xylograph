export const unsupportedWarning = () => {
    console.warn('Unsupported function.');
};

export const isBrowser = () => {
    return (typeof window !== "undefined" && window.document);
};