import * as firebase from "firebase";
import * as _ from "underscore";

export interface UserProfile {
  provider: string,
  id: string;
  displayName: string;
  photoURL: string;
}

export const PathMap = {
  Text: "text",
  List: "list",
}

export const __DefaultList = "__DefaultList";

export interface ListInfo {
  __id?: string,
  title: string,
  updateDate?: number,
  createDate?: number,
}

export interface ResultListInfoMap {
  [id: string]: ListInfo
}

export interface TextInfo {
  __id?: string,
  title: string,
  text: string,
  url: string,
  star: number,
  public: boolean,
  image?: string,
  updateDate?: number,
  createDate?: number,
}

export interface ResultAllTextMap {
  [listId: string]: ResultTextInfoMap,
}

export interface ResultTextInfoMap {
  [id: string] : TextInfo,
}

export interface AllTextMap {
  [listId: string]: TextInfo[],
}

export class FirebaseWrapper {
  fb: firebase.app.App;
  tp: firebase.auth.TwitterAuthProvider;
  isLogined: boolean;

  constructor(env) {
    const fconf = {
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      databaseURL: env.databaseURL,
      storageBucket: env.storageBucket,
      messagingSenderId: env.messagingSenderId,
    };
    this.fb = firebase.initializeApp(fconf);
    this.isLogined = false;
  }

  signIn(authEmail, authPass): Promise<firebase.UserInfo> {
    return new Promise((resolve, reject)=>{
      this.fb.auth().signInWithEmailAndPassword(authEmail, authPass)
      .then(()=>{
        const cUser: firebase.UserInfo = this.fb.auth().currentUser;
        this.isLogined = true;
        resolve(cUser);
      }).catch((error)=>{
        reject(error);
      })
    });
  }

  signInWithTwitter(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.tp = new firebase.auth.TwitterAuthProvider();
      this.tp.setCustomParameters({"lang": "ja"});
      this.fb.auth().signInWithPopup(this.tp)
      .then(()=>{
        this.isLogined = true;
        resolve();
      }).catch(()=>{
        reject();
      });
    });
  }

  register(email, password): Promise<firebase.UserInfo> {
    return new Promise((resolve, reject)=>{
      this.fb.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        const cUser: firebase.UserInfo = this.fb.auth().currentUser;
        this.isLogined = true;
        resolve(cUser);
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.fb.auth().signOut();
      resolve();
    });
  }

  //TODO 重複確認
  pushText(profile: UserProfile, listId: string,  id: string, textInfo: TextInfo): Promise<any> { //TODO 型
    return new Promise((resolve, reject) => {
      if(!listId) {
        listId = __DefaultList;
      }
      const path: string = "users/"+profile.id + "/" + PathMap.Text + "/" + listId + "/";
      if(textInfo){
        textInfo.createDate = +new Date();
        textInfo.updateDate = +new Date();
      }else {
        //Hard Delete
      }
      this.fb.database().ref(path + id).set(textInfo).then(resolve, reject);
    });
  }

  //TODO 二分木あたりで管理して高速化
  getTexts(profile: UserProfile) : Promise<AllTextMap> {
    return new Promise((resolve, reject) => {
      const userref: firebase.database.Reference = this.fb.database().ref("users/" + profile.id + "/" + PathMap.Text);
      userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
        const results: AllTextMap = {};
        const values: ResultAllTextMap = snapshot.val();
        values ? Object.keys(values).forEach((listId)=>{
          const textLists: TextInfo[] = values[listId] ? Object.keys(values[listId]).map((textId)=>{
            return _.assign({}, values[listId][textId], {__id: textId});
          }) : [];
          results[listId] = textLists;
        }) : [];
        resolve(results);
      });
    });
  }

  getTextWithListId(profile: UserProfile, listId: string) : Promise<TextInfo[]> {
    return new Promise((resolve, reject) => {
      if(!listId) {
        listId = __DefaultList;
      }
      const userref: firebase.database.Reference = this.fb.database().ref("users/" + profile.id + "/" + PathMap.Text + "/" + listId);
      userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
        const values: ResultTextInfoMap = snapshot.val();
        const lists = values ? Object.keys(values).map((id)=>{
          return _.assign({}, values[id], {__id: id});
        }) : [];
        resolve(lists);
      });
    });
  }


  /**
   * ハードデリート
   * @param profile 
   * @param id 
   */
  deleteTextInfo(profile: UserProfile, listId: string,  id: string) {
    if(!listId) {
      listId = __DefaultList;
    }
    return this.pushText(profile, listId, id, null);
  }

  // removeTextInfo(profile: UserProfile, id: string) {
  //   return new Promise<any>((resolve, reject) => {
  //     this.getItemWithIdList([id]).then((result)=>{
  //       const item = result[0];
  //       if(item){
  //         item.title = null;
  //         item.url = null;
  //         item.image = null;
  //         item.updateDate = +new Date();
  //         this.pushText(profile, id, item).then(resolve, reject);
  //       }
  //     }).catch((error)=>{
  //       throw error;
  //     });
  //   });
  // }

  createList(profile: UserProfile, id: string, listInfo: ListInfo): Promise<any> { //TODO 型　idを返す
    return new Promise((resolve, reject) => {
      const path: string = "users/"+profile.id+"/"+PathMap.List+"/";
      if(listInfo){
        listInfo.createDate = +new Date();
        listInfo.updateDate = +new Date();
      }else {
        //Hard Delete
      }
      this.fb.database().ref(path + id).set(listInfo).then(resolve, reject);
    });
  }

  getList(profile: UserProfile) : Promise<ListInfo[]> {
    return new Promise((resolve, reject) => {
      const userref: firebase.database.Reference = this.fb.database().ref("users/" + profile.id + "/"+ PathMap.List);
      userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
        const values: ResultListInfoMap = snapshot.val();
        const lists = values ? Object.keys(values).map((id)=>{
          return _.assign({}, values[id], {__id: id});
        }) : [];
        resolve(lists);
      });
    });
  }

  deleteList(profile: UserProfile, id: string) {
    return this.createList(profile, id, null);
  }

  //TODO IDをハッシュマップ管理したら重複管理できそう
  generateId(profile: UserProfile, targetPath: string): string {
    const path: string = "users/"+profile.id+"/"+targetPath+"/";
    return this.fb.database().ref().child(path).push().key;
  }

  // //TODO 削除予定
  // getItemWithIdList(idlist: string[]) : Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let results = [];
  //     const userref: firebase.database.Reference = this.fb.database().ref("users/");
  //     userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
  //       const values: any = snapshot.val();
  //       Object.keys(values).forEach((userid) => {
  //         idlist.forEach((wordid) => {
  //           if(values[userid][wordid]){
  //             results.push(values[userid][wordid]);
  //           }
  //         })
  //       });
  //       resolve(results);
  //     });
  //   });
  // }

}

