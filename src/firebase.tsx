import * as firebase from "firebase";
import * as _ from "underscore";

export interface UserProfile {
  provider: string,
  id: string;
  displayName: string;
  photoURL: string;
}

export interface TextInfo {
  __id?: string,
  title: string,
  text: string,
  url: string,
  image?: string,
  updateDate?: number,
  createDate?: number,
}

export interface TextInfoMap {
  [id: string] : TextInfo,
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

  pushText(profile: UserProfile, id: string, textInfo: TextInfo): Promise<any> {
    return new Promise((resolve, reject) => {
      const path: string = "users/"+profile.id+"/text/";
      if(textInfo){
        textInfo.createDate = +new Date();
        textInfo.updateDate = +new Date();
      }
      this.fb.database().ref(path + id).set(textInfo).then(resolve, reject);
      
    });
  }

  getText(profile: UserProfile) : Promise<TextInfoMap> {
    return new Promise((resolve, reject) => {
      const userref: firebase.database.Reference = this.fb.database().ref("users/" + profile.id + "/text");
      userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
        const values: any = snapshot.val();
        resolve(values);
      });
    });
  }

  deleteTextInfo(profile: UserProfile, id: string) {
    return this.pushText(profile, id, null);
  }

  removeTextInfo(profile: UserProfile, id: string) {
    return new Promise<any>((resolve, reject) => {
      this.getItemWithIdList([id]).then((result)=>{
        const item = result[0];
        if(item){
          item.title = null;
          item.url = null;
          item.image = null;
          item.updateDate = +new Date();
          this.pushText(profile, id, item).then(resolve, reject);
        }
      }).catch((error)=>{
        throw error;
      });
    });
  }

  generateId(profile: UserProfile): string {
    const path: string = "users/"+profile.id+"/text/";
    return this.fb.database().ref().child(path).push().key;
  }

  //TODO もっとかしこいやり方ありそう
  getItemWithIdList(idlist: string[]) : Promise<any> {
    return new Promise((resolve, reject) => {
      let results = [];
      const userref: firebase.database.Reference = this.fb.database().ref("users/");
      userref.once("value", (snapshot) => { //TODO .onにしてsubscribeする？
        const values: any = snapshot.val();
        Object.keys(values).forEach((userid) => {
          idlist.forEach((wordid) => {
            if(values[userid][wordid]){
              results.push(values[userid][wordid]);
            }
          })
        });
        resolve(results);
      });
    });
  }

}

