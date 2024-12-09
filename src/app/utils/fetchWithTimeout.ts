export function fetchWithTimeout(promise: Promise<any>, timeout: number): Promise<any> {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  );
  return Promise.race([promise, timeoutPromise]);
}
