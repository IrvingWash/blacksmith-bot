import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import {
    Firestore,
    DocumentData,
    getFirestore,
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { ISessionStorage } from "../session-storage/isession-storage";

export class Firebase<D extends DocumentData> implements ISessionStorage<D> {
    private readonly _app: FirebaseApp;
    private _db: Firestore;

    public constructor(options: FirebaseOptions) {
        this._app = initializeApp(options);
        this._db = getFirestore(this._app);
    }

    public load(key: string, userId: string): Promise<D | undefined> {
        return this.documentData(key, userId);
    }

    public save(key: string, userId: string, data: D): Promise<void> {
        return this.newDocument(key, userId, data);
    }

    public clear(key: string, userId: string): Promise<void> {
        return this.deleteDocument(key, userId);
    }

    public async documentsData(collectionName: string): Promise<D[]> {
        const foundCollection = collection(this._db, collectionName);

        const foundDocs = await getDocs(foundCollection);

        return foundDocs.docs.map((doc) => doc.data() as D);
    }

    public async documentData(
        collectionName: string,
        documentId: string
    ): Promise<D | undefined> {
        const foundCollection = collection(this._db, collectionName);

        const foundDocs = await getDocs(foundCollection);

        return foundDocs.docs
            .filter((doc) => doc.id === documentId)
            .map((doc) => doc.data() as D)[0];
    }

    public async newDocument(
        collectionName: string,
        documentId: string,
        data: D
    ): Promise<void> {
        await setDoc(doc(this._db, collectionName, documentId), data);
    }

    public async deleteDocument(
        collectionName: string,
        documentId: string
    ): Promise<void> {
        await deleteDoc(doc(this._db, collectionName, documentId));
    }
}
