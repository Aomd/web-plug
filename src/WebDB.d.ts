interface WebDBOption {
  name?: string;
  varsion?: number;
}

interface CreateObjectStoreOption {
  keyPath?: string;
  autoIncrement?: boolean;
}

interface ReturnEntity {
  eventName: string;
  value: object;
}

interface SetEntity extends Object {
  /**
   * IDBObjectStore.put 下标
   *
   * @type {(string|number)}
   * @memberof SetEntity
   */
  key?: string | number;
}

interface GetOption {
  rowName: string;
  value?: string | number;
}

interface GetAllOption {
  rowName: string;
  value?: string | number;
  limit?: number;
}

interface DelOption {

  /**
   * 需要删除的指定 key
   *
   * @type {(number | string)}
   * @memberof DelOption
   */
  key: number | string;
}

interface FuzzySearchOption {
  limit?: number;
  rowName: string;
  value: number | string;
}


type transactionMode = 'readonly' | 'readwrite' | 'readwriteflush';

interface WebDB {
  new(option?: WebDBOption): this;

  init(): Promise<T>;

  createObjectStore(tableName: string, option?: CreateObjectStoreOption): Promise<ReturnEntity>;

  deleteObjectStore(tableName: string): Promise<ReturnEntity>;

  getObjectStore(tableName: string, type?: transactionMode): IDBObjectStore;

  createIndex(indexName: String, option?: IDBIndexParameters): IDBIndex;

  set(tableName: string, entity?: SetEntity): Promise<ReturnEntity>;

  get(tableName: string, option: GetOption): Promise<ReturnEntity>;

  getAll(tableName: string, option: GetAllOption): Promise<ReturnEntity>;

  del(tableName: string, option: DelOption): Promise<ReturnEntity>;

  clear(tableName: string): Promise<ReturnEntity>;

  fuzzySearch(tableName: string, option: FuzzySearchOption): Array<Object>;

  close(): Promise<ReturnEntity>;
}

declare var WebDB: WebDB;

export {
  WebDB
}