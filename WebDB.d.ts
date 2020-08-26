interface WebDBOption {
  name?: string,
  varsion?: number
}

interface createObjectStoreOption {
  keyPath?: string,
  autoIncrement?: boolean
}

interface returnEntity {
  eventName: string
  value: object
}

interface setEntity extends Object {
  /**
   * IDBObjectStore.put 下标
   *
   * @type {(string|number)}
   * @memberof setEntity
   */
  key?: string | number
}

interface getOption {
  rowName: string
  value?: string | number
}

interface getAllOption {
  rowName: string
  value?: string | number
  limit?: number
}

interface delOption {

  /**
   * 需要删除的指定 key
   *
   * @type {(number | string)}
   * @memberof delOption
   */
  key: number | string
}

interface fuzzySearchOption {
  limit?: number
  rowName: string
  value: number | string
}


type transactionMode = 'readonly' | 'readwrite' | 'readwriteflush'

interface WebDB {
  new(option?: WebDBOption): this

  init(): Promise<T>

  createObjectStore(tableName: string, option?: createObjectStoreOption): Promise<returnEntity>

  deleteObjectStore(tableName: string): Promise<returnEntity>

  getObjectStore(tableName: string, type?: transactionMode): IDBObjectStore

  createIndex(indexName: String, option?: IDBIndexParameters): IDBIndex

  set(tableName: string, entity?: setEntity): Promise<returnEntity>

  get(tableName: string, option: getOption): Promise<returnEntity>

  getAll(tableName: string, option: getAllOption): Promise<returnEntity>

  del(tableName: string, option: delOption): Promise<returnEntity>

  clear(tableName: string): Promise<returnEntity>

  fuzzySearch(tableName: string, option: fuzzySearchOption): Array<Object>

  close(): Promise<returnEntity>
}

declare var WebDB: WebDB;

export {
  WebDB
}