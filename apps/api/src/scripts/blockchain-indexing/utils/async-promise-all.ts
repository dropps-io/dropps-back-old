export async function asyncPromiseAll(chunks: Promise<any>[]): Promise<void> {
  return new Promise((resolve, reject) => {
    Promise.all(chunks)
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
}
