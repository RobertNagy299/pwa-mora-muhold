import {inject, Injectable} from '@angular/core';
import {addDoc, collection, collectionData, Firestore, getDocs, query} from '@angular/fire/firestore';
import {catchError, from, map, Observable, of} from 'rxjs';
import {VoltageInterface} from '../interfaces/VoltageInterface';
@Injectable({
  providedIn: 'root'
})
export class VoltageFirebaseService {


  // teacher's material
  private readonly collectionName = 'voltage';
  constructor(private readonly fireStore: Firestore) { }

  public saveVoltage(voltage: VoltageInterface){

    //Puts an object into a collection, returns with a promise
    //from -> creates an observable from a promise
    return from(addDoc(collection(this.fireStore, this.collectionName), voltage));

  }

  public getAllVoltageValues(){
    return from(getDocs(query(collection(this.fireStore, this.collectionName))))
      .pipe(map(snapShot => snapShot.docs.map( (voltage) => voltage.data() as VoltageInterface ))
      ,catchError(()=>of([])));
  }

  // TODO firebase init hosting, dist/mora-muhold, firebase deploy --only hosting



}
