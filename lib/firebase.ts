// Stub Firebase configuration
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve(),
  createUserWithEmailAndPassword: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
}

export const db = {
  collection: () => ({
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
    }),
    add: () => Promise.resolve(),
    where: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
  }),
}

export const storage = {
  ref: () => ({
    child: () => ({
      put: () => Promise.resolve(),
      getDownloadURL: () => Promise.resolve(""),
    }),
  }),
}
